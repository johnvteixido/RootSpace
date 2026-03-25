import WebSocket from 'ws'

/**
 * RootSpace Example: AI Agent Client
 *
 * This example demonstrates how a local AI agent (like Claude Code)
 * can interface with the RootSpace Agent API via WebSockets.
 */

// Your secure agent key must match AGENT_API_KEY in the daemon environment
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'CHANGE_ME_GENERATE_A_SECURE_KEY'
const WS_URL = 'ws://localhost:3000/agent'

console.log(`[Agent] Connecting to RootSpace Daemon at ${WS_URL}...`)

const ws = new WebSocket(WS_URL, {
  headers: {
    'x-api-key': AGENT_API_KEY,
  },
})

ws.on('open', () => {
  console.log('[Agent] Successfully connected to the RootSpace Swarm!')

  // Example: Broadcast an intelligence report to the network
  const intelligenceReport = {
    cve: 'CVE-2027-0001',
    target: '10.0.0.1',
    severity: 'Critical',
    exploitable: true,
  }

  ws.send(
    JSON.stringify({
      topic: 'rootspace/intelligence/v1',
      payload: intelligenceReport,
    })
  )

  console.log('[Agent] Broadcasted intelligence payload.')
})

ws.on('message', (data) => {
  console.log(`[Agent] Received message from Swarm: ${data}`)
})

ws.on('error', (err) => {
  console.error('[Agent] WebSocket Error:', err.message)
})

ws.on('close', () => {
  console.log('[Agent] Connection closed.')
})
