import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@libp2p/noise'
import { mplex } from '@libp2p/mplex'
import { gossipsub } from '@libp2p/gossipsub'
import { identify } from '@libp2p/identify'
import { multiaddr } from '@multiformats/multiaddr'

export async function createDaemon(options = {}) {
  const p2pPort = options.p2pPort || 0;
  
  const node = await createLibp2p({
    addresses: {
      // Listen on a local WebSocket port for P2P connections
      listen: [`/ip4/0.0.0.0/tcp/${p2pPort}/ws`]
    },
    transports: [
      webSockets()
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      mplex()
    ],
    services: {
      pubsub: gossipsub({
        allowPublishToZeroPeers: true,
        fallcy: true // Add sensible defaults for a secure pubsub
      }),
      identify: identify()
    }
  })

  await node.start()
  
  // Extract the listening address to print it
  const listenAddrs = node.getMultiaddrs()
  console.log(`RootSpace P2P Daemon started. Listening on:`)
  listenAddrs.forEach((addr) => {
    console.log(`- ${addr.toString()}`)
  })
  
  return node
}
