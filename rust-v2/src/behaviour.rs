use libp2p::swarm::NetworkBehaviour;
use libp2p::{gossipsub, mdns, relay};

#[derive(NetworkBehaviour)]
pub struct MyBehaviour {
    pub gossipsub: gossipsub::Behaviour,
    pub mdns: mdns::tokio::Behaviour,
    pub relay: relay::Behaviour,
}
