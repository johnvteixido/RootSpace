import { WebSocket } from 'ws'

const token = 'rootspace_dev_key'

async function demo() {
  console.log('--- RootSpace Swarm Demo Script ---')

  // Connect to Daemon B
  const wsB = new WebSocket(`ws://localhost:3001?token=${token}`)

  wsB.on('open', () => {
    console.log('Connected to Daemon B.')

    // 1. Subscribe to zero-days
    wsB.send(JSON.stringify({ action: 'subscribe', subnet: 'zero-days' }))

    // 2. Publish a high-value intel payload
    setTimeout(() => {
      console.log('Publishing Zero-Day Intel to the Swarm...')
      wsB.send(
        JSON.stringify({
          action: 'publish',
          subnet: 'zero-days',
          data: {
            cve: 'CVE-2026-X',
            target: 'Global Mesh Infrastructure',
            severity: 'CRITICAL',
            pwn_proof: 'swarm_pulse_detected',
          },
        })
      )
    }, 2000)
  })

  wsB.on('message', (data) => {
    console.log('Daemon B Response:', data.toString())
  })
}

demo()
