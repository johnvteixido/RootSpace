import { WebSocketServer } from 'ws'
import { z } from 'zod'

// Strict payload validation for commercial agents
// This prevents agents from injecting malicious or malformed data into the P2P network
const AgentPayloadSchema = z.object({
  action: z.enum(['subscribe', 'publish', 'ping']),
  subnet: z.string().min(1).max(255).optional(),
  data: z.any().optional(), // In the future, we will cryptographically verify this object
});

export class AgentAPI {
  constructor(port, p2pNode) {
    this.port = port;
    this.p2pNode = p2pNode;
    this.wss = new WebSocketServer({ port });
    
    // Setup libp2p pubsub listener
    this.p2pNode.services.pubsub.addEventListener('message', (message) => {
        const topic = message.detail.topic;
        const msgData = new TextDecoder().decode(message.detail.data);
        const sender = message.detail.from.toString();
        
        console.log(`[P2P -> Agent] Received on subnet ${topic} from ${sender}`);
        
        // Broadcast to all connected local agents
        this.wss.clients.forEach(client => {
            if (client.readyState === 1 /* WebSocket.OPEN */) {
                // In a full implementation, we'd only send to agents subscribed to this topic
                client.send(JSON.stringify({
                    type: 'p2p_message',
                    topic: topic,
                    sender: sender,
                    payload: JSON.parse(msgData)
                }));
            }
        });
    });

    console.log(`Agent API WebSocket server started on ws://localhost:${port}`);
    this.handleConnections();
  }

  handleConnections() {
    this.wss.on('connection', (ws, req) => {
      // Very basic local auth check (for demonstration, in production use real API keys via headers)
      const token = req.headers['authorization'];
      const expectedToken = `Bearer ${process.env.AGENT_API_KEY || 'rootspace_dev_key'}`;
      
      if (token !== expectedToken) {
          console.warn('Agent connection rejected: Invalid Authorization header');
          ws.close(4001, 'Unauthorized');
          return;
      }
      
      console.log('Local AI Agent connected.');

      ws.on('message', (messageAsString) => {
        try {
          const rawPayload = JSON.parse(messageAsString);
          
          // STRICT VALIDATION
          const payload = AgentPayloadSchema.parse(rawPayload);

          this.handleAgentAction(ws, payload);
          
        } catch (error) {
          if (error instanceof z.ZodError) {
             console.error('Agent submitted malformed payload:', error.errors);
             ws.send(JSON.stringify({ error: 'Invalid payload schema', details: error.errors }));
          } else {
             console.error('Failed to parse agent message:', error);
             ws.send(JSON.stringify({ error: 'Invalid JSON' }));
          }
        }
      });
      
      ws.on('close', () => {
         console.log('Local AI Agent disconnected.');
      });
    });
  }

  handleAgentAction(ws, payload) {
      if (payload.action === 'ping') {
          ws.send(JSON.stringify({ status: 'pong' }));
      } 
      else if (payload.action === 'subscribe') {
          if (!payload.subnet) throw new Error("Subnet required for subscribe action");
          this.p2pNode.services.pubsub.subscribe(payload.subnet);
          console.log(`Agent subscribed Daemon to P2P Subnet: ${payload.subnet}`);
          ws.send(JSON.stringify({ status: 'subscribed', subnet: payload.subnet }));
      }
      else if (payload.action === 'publish') {
          if (!payload.subnet || !payload.data) throw new Error("Subnet and data required for publish action");
          
          const encodedMessage = new TextEncoder().encode(JSON.stringify(payload.data));
          this.p2pNode.services.pubsub.publish(payload.subnet, encodedMessage)
            .then(res => {
                console.log(`[Agent -> P2P] Published message to Subnet: ${payload.subnet}`);
                ws.send(JSON.stringify({ status: 'published', subnet: payload.subnet, p2p_result: res }));
            })
            .catch(err => {
                console.error('Failed to publish to P2P network', err);
                ws.send(JSON.stringify({ error: 'P2P Publish Failed', details: err.message }));
            });
      }
  }
}
