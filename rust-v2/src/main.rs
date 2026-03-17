use futures::stream::StreamExt;
use libp2p::{
    gossipsub, mdns, noise, swarm::NetworkBehaviour, swarm::SwarmEvent, tcp, yamux,
};
use std::error::Error;
use std::time::Duration;
use tokio::{io, select};
use serde::{Deserialize, Serialize};
use ed25519_dalek::{Signature, VerifyingKey, Verifier};

#[derive(Serialize, Deserialize, Debug)]
pub struct ProofOfPwn {
    pub cve: String,
    pub target: String,
    pub timestamp: u64,
    pub signature: String, // Hex encoded
    pub public_key: String, // Hex encoded
}

#[derive(NetworkBehaviour)]
struct MyBehaviour {
    gossipsub: gossipsub::Behaviour,
    mdns: mdns::tokio::Behaviour,
}

impl Validator {
    pub fn verify_signature(payload: &ProofOfPwn) -> Result<bool, Box<dyn Error>> {
        let sig_bytes = hex::decode(&payload.signature)?;
        let pk_bytes = hex::decode(&payload.public_key)?;

        let signature = Signature::from_slice(&sig_bytes)?;
        let public_key = VerifyingKey::from_bytes(
            &pk_bytes.try_into().map_err(|_| "Invalid public key length")?
        )?;

        let message = format!("{}:{}:{}", payload.cve, payload.target, payload.timestamp);
        
        match public_key.verify(message.as_bytes(), &signature) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}

pub struct Validator;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
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
                .map_err(|msg| io::Error::new(io::ErrorKind::Other, msg))?;

            let gossipsub = gossipsub::Behaviour::new(
                gossipsub::MessageAuthenticity::Signed(key.clone()),
                gossipsub_config,
            )?;

            let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), key.public().to_peer_id())?;
            Ok(MyBehaviour { gossipsub, mdns })
        })?
        .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
        .build();

    let topic = gossipsub::IdentTopic::new("rootspace/global/v1");
    swarm.behaviour_mut().gossipsub.subscribe(&topic)?;

    swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

    println!("RootSpace V2 Daemon (Rust) - High-Performance Node Started");

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
                    println!("Received Gossip from {peer_id}: {data}");
                    
                    // Attempt to validate as Proof-of-Pwn
                    if let Ok(payload) = serde_json::from_str::<ProofOfPwn>(&data) {
                        match Validator::verify_signature(&payload) {
                            Ok(true) => println!(">>> VALID Proof-of-Pwn signature verified!"),
                            Ok(false) => println!(">>> INVALID Proof-of-Pwn signature detected!"),
                            Err(e) => println!(">>> Validation Error: {e}"),
                        }
                    }
                },
                SwarmEvent::NewListenAddr { address, .. } => {
                    println!("Daemon listening on {address}");
                }
                _ => {}
            }
        }
    }
}
