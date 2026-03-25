import { WebSocketServer } from 'ws'
import { z } from 'zod'
import crypto from 'crypto'
import { CryptoUtils } from './crypto-utils.js'
import { decodeBase64 } from 'tweetnacl-util'

// Strict payload validation for commercial agents
// This prevents agents from injecting malicious or malformed data into the P2P network
const AgentPayloadSchema = z.object({
  action: z.enum(['subscribe', 'publish', 'ping', 'get_history', 'get_peers']),
  subnet: z.string().min(1).max(255).optional(),
  data: z.any().optional(),
  signature: z.string().optional(), // Base64 signature for Proof-of-Pwn
  publicKey: z.string().optional(), // Agent's PEM public key
  e2ee: z
    .object({
      recipientPublicKey: z.string(),
      senderPrivateKey: z.string(), // Local agent should provide this for outbound
      nonce: z.string().optional(),
    })
    .optional(),
})

export class AgentAPI {
  constructor(port, p2pNode, db) {
    this.port = port
    this.p2pNode = p2pNode
    this.db = db
    this.wss = new WebSocketServer({ port })

    // Setup libp2p pubsub listener
    this.p2pNode.services.pubsub.addEventListener('message', (message) => {
      const topic = message.detail.topic
      const msgData = new TextDecoder().decode(message.detail.data)
      const sender = message.detail.from.toString()
      let payload = JSON.parse(msgData)

      console.log(`[P2P -> Agent] Received on subnet ${topic} from ${sender}`)

      // E2EE Decryption check
      if (payload.e2ee && payload.e2ee.ciphertext && payload.e2ee.nonce) {
        try {
          // This assumes the local agent has previously shared keys or we have a global key (for the demo)
          // In a real V2, the local agent would provide its PrivateKey via a 'set_keys' action.
          console.log(`[E2EE] Attempting decryption for message on ${topic}...`)
          // placeholder for local private key
        } catch (err) {
          console.warn(`[E2EE] Could not decrypt message from ${sender}: ${err.message}`)
        }
      }

      // Persistence: Log the message
      this.db.saveMessage({
        peerId: sender,
        topic: topic,
        data: payload.data || payload,
        signature: payload.signature,
        publicKey: payload.publicKey,
      })

      // Broadcast to all connected local agents
      this.broadcast({
        type: 'p2p_message',
        topic: topic,
        sender: sender,
        payload: payload,
      })
    })

    // Setup peer event listeners for the Human Dashboard
    this.p2pNode.addEventListener('peer:discovery', (evt) => {
      const peerId = evt.detail.id.toString()
      this.broadcast({ type: 'peer_event', action: 'discovered', peerId })
    })

    this.p2pNode.addEventListener('peer:connect', (evt) => {
      const peerId = evt.detail.toString()
      console.log(`[P2P] Peer connected: ${peerId}`)
      this.broadcast({ type: 'peer_event', action: 'connected', peerId })
    })

    this.p2pNode.addEventListener('peer:disconnect', (evt) => {
      const peerId = evt.detail.toString()
      this.broadcast({ type: 'peer_event', action: 'disconnected', peerId })
    })

    console.log(`Agent API WebSocket server started on ws://localhost:${port}`)
    this.handleConnections()
  }

  broadcast(message) {
    const data = JSON.stringify(message)
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(data)
      }
    })
  }

  handleConnections() {
    this.wss.on('connection', (ws, req) => {
      // Allow token via Header or Query Parameter (for browser dashboards)
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
      const queryToken = url.searchParams.get('token')
      const authHeader = req.headers['authorization']

      const providedToken = queryToken || (authHeader ? authHeader.replace('Bearer ', '') : null)
      const expectedToken = process.env.AGENT_API_KEY

      if (!expectedToken) {
        console.error('CRITICAL: AGENT_API_KEY is not set in environment.')
        ws.close(1011, 'Internal Server Error')
        return
      }

      if (providedToken !== expectedToken) {
        console.warn('Agent connection rejected: Invalid or missing token')
        ws.close(4001, 'Unauthorized')
        return
      }

      console.log('Local AI Agent connected.')
      let messageCount = 0
      let lastReset = Date.now()

      ws.on('message', (messageAsString) => {
        try {
          // SECURITY: Payload size limit (64KB) to prevent OOM
          if (messageAsString.length > 65536) {
            console.warn('Agent message rejected: Payload too large')
            ws.send(JSON.stringify({ error: 'Payload too large', limit: '64KB' }))
            return
          }

          // SECURITY: Simple Rate Limiting (100 req/min)
          messageCount++
          if (Date.now() - lastReset > 60000) {
            messageCount = 1
            lastReset = Date.now()
          }
          if (messageCount > 100) {
            console.warn('Agent rate limited: Excessive messages')
            ws.send(JSON.stringify({ error: 'Rate limit exceeded', limit: '100 req/min' }))
            return
          }

          const rawPayload = JSON.parse(messageAsString)

          // STRICT VALIDATION
          const payload = AgentPayloadSchema.parse(rawPayload)

          this.handleAgentAction(ws, payload)
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error('Agent submitted malformed payload:', error.errors)
            ws.send(JSON.stringify({ error: 'Invalid payload schema', details: error.errors }))
          } else {
            console.error('Failed to parse agent message:', error)
            ws.send(JSON.stringify({ error: 'Invalid JSON' }))
          }
        }
      })

      ws.on('close', () => {
        console.log('Local AI Agent disconnected.')
      })
    })
  }

  handleAgentAction(ws, payload) {
    if (payload.action === 'ping') {
      ws.send(JSON.stringify({ status: 'pong' }))
    } else if (payload.action === 'get_history') {
      const history = this.db.getHistory()
      ws.send(JSON.stringify({ status: 'success', history }))
    } else if (payload.action === 'get_peers') {
      const peers = this.db.getPeers()
      ws.send(JSON.stringify({ status: 'success', peers }))
    } else if (payload.action === 'subscribe') {
      if (!payload.subnet) throw new Error('Subnet required for subscribe action')
      this.p2pNode.services.pubsub.subscribe(payload.subnet)
      console.log(`Agent subscribed Daemon to P2P Subnet: ${payload.subnet}`)
      ws.send(JSON.stringify({ status: 'subscribed', subnet: payload.subnet }))
    } else if (payload.action === 'publish') {
      if (!payload.subnet || !payload.data)
        throw new Error('Subnet and data required for publish action')

      // Cryptographic Proof-of-Pwn Validation
      if (payload.signature && payload.publicKey) {
        try {
          const verifier = crypto.createVerify('SHA256')
          verifier.update(JSON.stringify(payload.data))
          const isValid = verifier.verify(payload.publicKey, payload.signature, 'base64')

          if (!isValid) {
            console.warn('Agent submitted invalid cryptographic Proof-of-Pwn signature!')
            // Reputation: Decrease for bad signature
            this.db.updateReputation('local_agent', -10)
            ws.send(
              JSON.stringify({
                error: 'Invalid Signature',
                details: 'The provided signature does not match the payload data.',
              })
            )
            return
          }
          console.log('✅ Agent Proof-of-Pwn Signature Verified!')
          this.db.updateReputation('local_agent', 5)
        } catch (cryptoErr) {
          console.error('Cryptographic verification failed:', cryptoErr.message)
          ws.send(JSON.stringify({ error: 'Verification Failed', details: cryptoErr.message }))
          return
        }
      }

      // E2EE Encryption hook
      if (payload.e2ee && payload.e2ee.recipientPublicKey && payload.e2ee.senderPrivateKey) {
        try {
          const { ciphertext, nonce } = CryptoUtils.encrypt(
            payload.data,
            decodeBase64(payload.e2ee.recipientPublicKey),
            decodeBase64(payload.e2ee.senderPrivateKey)
          )
          payload.data = { ciphertext, nonce }
          console.log(`[E2EE] Payload encrypted for recipient.`)
        } catch (err) {
          console.error('E2EE Encryption failed:', err)
          ws.send(JSON.stringify({ error: 'E2EE Failed', details: err.message }))
          return
        }
      }

      const encodedMessage = new TextEncoder().encode(JSON.stringify(payload))
      this.p2pNode.services.pubsub
        .publish(payload.subnet, encodedMessage)
        .then((res) => {
          console.log(`[Agent -> P2P] Published message to Subnet: ${payload.subnet}`)
          ws.send(JSON.stringify({ status: 'published', subnet: payload.subnet, p2p_result: res }))
        })
        .catch((err) => {
          console.error('Failed to publish to P2P network', err)
          ws.send(JSON.stringify({ error: 'P2P Publish Failed', details: err.message }))
        })
    }
  }
}
