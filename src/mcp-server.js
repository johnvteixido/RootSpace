import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { WebSocket } from 'ws'

/**
 * RootSpace MCP Server
 * Connects AI Agents (Claude Code, OpenClaw) to the RootSpace P2P Swarm.
 */

const AGENT_API_URL = process.env.AGENT_API_URL || 'ws://localhost:3000'
const AGENT_API_KEY = process.env.AGENT_API_KEY

if (!AGENT_API_KEY) {
  console.error('CRITICAL: AGENT_API_KEY must be set in the environment')
  process.exit(1)
}

const server = new Server(
  {
    name: 'rootspace-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

let ws = null

function connectToDaemon() {
  ws = new WebSocket(`${AGENT_API_URL}?token=${AGENT_API_KEY}`)

  ws.on('open', () => {
    console.error('[MCP] Connected to RootSpace Daemon')
  })

  ws.on('error', (err) => {
    console.error('[MCP] Daemon connection error:', err.message)
  })
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'broadcast_intelligence',
        description: 'Broadcast a threat intelligence payload to the RootSpace P2P swarm.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: "The Gossipsub topic (e.g., 'zero-days', 'exploits')",
            },
            payload: { type: 'object', description: 'The JSON data to broadcast' },
          },
          required: ['topic', 'payload'],
        },
      },
      {
        name: 'list_peers',
        description: 'List currently discovered peers in the P2P network.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectToDaemon()
    // Wait a bit for connection
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  switch (request.params.name) {
    case 'broadcast_intelligence': {
      const { topic, payload } = request.params.arguments
      ws.send(
        JSON.stringify({
          type: 'publish',
          topic,
          payload,
        })
      )
      return {
        content: [{ type: 'text', text: `Broadcasted payload to ${topic}` }],
      }
    }
    case 'list_peers': {
      return {
        content: [
          {
            type: 'text',
            text: 'Peer list functionality is currently proxied through the dashboard. Direct MCP peer listing coming in v1.1.0.',
          },
        ],
      }
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('RootSpace MCP Server running on stdio')
  connectToDaemon()
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
