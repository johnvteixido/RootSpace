mod behaviour;
mod persistence;
mod validator;
mod wasm_engine;

use anyhow::Result;
use behaviour::{MyBehaviour, MyBehaviourEvent};
use futures::stream::StreamExt;
use libp2p::{gossipsub, mdns, noise, relay, swarm::SwarmEvent, tcp, yamux};
use std::time::Duration;
use tokio::select;
use tracing::{error, info, warn};
use validator::{ProofOfPwn, Validator};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    // V2.0 Persistence & Wasm
    let db = persistence::Persistence::new("rootspace_v2.db")?;
    let _wasm = wasm_engine::WasmEngine::new();

    let mut swarm = libp2p::SwarmBuilder::with_new_identity()
        .with_tokio()
        .with_tcp(
            tcp::Config::default(),
            noise::Config::new,
            yamux::Config::default,
        )?
        .with_behaviour(|key| {
            let message_id_fn = |message: &gossipsub::Message| {
                let mut s = std::collections::hash_map::DefaultHasher::new();
                std::hash::Hash::hash(&message.data, &mut s);
                std::hash::Hash::hash(&message.topic, &mut s);
                gossipsub::MessageId::from(std::hash::Hasher::finish(&s).to_string())
            };

            let gossipsub_config = gossipsub::ConfigBuilder::default()
                .heartbeat_interval(Duration::from_secs(10))
                .validation_mode(gossipsub::ValidationMode::Strict)
                .message_id_fn(message_id_fn)
                .build()
                .map_err(std::io::Error::other)?;

            let gossipsub = gossipsub::Behaviour::new(
                gossipsub::MessageAuthenticity::Signed(key.clone()),
                gossipsub_config,
            )?;

            let mdns =
                mdns::tokio::Behaviour::new(mdns::Config::default(), key.public().to_peer_id())?;
            let relay = relay::Behaviour::new(key.public().to_peer_id(), relay::Config::default());

            Ok(MyBehaviour {
                gossipsub,
                mdns,
                relay,
            })
        })?
        .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
        .build();

    let topic = gossipsub::IdentTopic::new("rootspace/global/v1");
    swarm.behaviour_mut().gossipsub.subscribe(&topic)?;

    swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

    info!("RootSpace V2 Daemon (Rust) - High-Performance Node Started");

    loop {
        select! {
            event = swarm.select_next_some() => match event {
                SwarmEvent::Behaviour(MyBehaviourEvent::Mdns(mdns::Event::Discovered(list))) => {
                    for (peer_id, _multiaddr) in list {
                        swarm.behaviour_mut().gossipsub.add_explicit_peer(&peer_id);
                    }
                },
                SwarmEvent::Behaviour(MyBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                    propagation_source: peer_id,
                    message,
                    ..
                })) => {
                    let data = String::from_utf8_lossy(&message.data);
                    info!("Received Gossip from {peer_id}: {data}");

                    // V2.0 Persistence
                    if let Err(e) = db.save_message(&peer_id.to_string(), &message.topic.to_string(), &data) {
                        error!("Failed to save message to DB: {e}");
                    }

                    if let Ok(payload) = serde_json::from_str::<ProofOfPwn>(&data) {
                        match Validator::verify_signature(&payload) {
                            Ok(true) => {
                                info!(">>> VALID Proof-of-Pwn signature verified!");
                                // V2.0: If the message contains a Wasm exploit, execute it
                                if data.contains("\"wasm_hex\"") {
                                    info!(">>> Wasm exploit detected, initiating sandbox execution...");
                                    // Placeholder for hex decoding and execution
                                }
                            },
                            Ok(false) => warn!(">>> INVALID Proof-of-Pwn signature detected!"),
                            Err(e) => error!(">>> Validation Error: {e}"),
                        }
                    }
                },
                SwarmEvent::NewListenAddr { address, .. } => {
                    info!("Daemon listening on {address}");
                }
                _ => {}
            }
        }
    }
}
