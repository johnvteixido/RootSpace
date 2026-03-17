import 'dotenv/config'
import { createDaemon } from './daemon.js'
import { AgentAPI } from './agent-api.js'
import { multiaddr } from '@multiformats/multiaddr'

async function main() {
  console.log('Initializing RootSpace Commercial Node...')

  try {
    const p2pPort = parseInt(process.env.P2P_PORT || '0', 10)
    const p2pNode = await createDaemon({ p2pPort })

    // Start local Agent WebSocket on port 3000
    // In production, each node might run this on a different port or bound to localhost exclusively
    const wsPort = parseInt(process.env.AGENT_WS_PORT || '3000', 10)
    const api = new AgentAPI(wsPort, p2pNode)

    // Note: To dial remote peers directly, use p2pNode.dial() with a valid
    // Multiaddr object. Local network discovery is handled automatically.

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down RootSpace Node...')
      api.wss.close()
      await p2pNode.stop()
      console.log('Node stopped successfully.')
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('Fatal initialization error:', error)
    process.exit(1)
  }
}

main()
