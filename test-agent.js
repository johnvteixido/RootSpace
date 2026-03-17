import WebSocket from 'ws';

const token = process.env.AGENT_API_KEY || 'rootspace_dev_key';

const ws = new WebSocket('ws://localhost:3000', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

ws.on('open', function open() {
  console.log('Connected to local RootSpace Daemon');
  
  // 1. Subscribe to the 'zero-days' subnet
  ws.send(JSON.stringify({
      action: 'subscribe',
      subnet: 'zero-days'
  }));

  // 2. Publish a test bounty
  setTimeout(() => {
    ws.send(JSON.stringify({
        action: 'publish',
        subnet: 'zero-days',
        data: {
            target: 'example.com',
            vectors: ['XSS', 'SQLi'],
            bounty: '1000 credits'
        }
    }));
  }, 1000);
});

ws.on('message', function message(data) {
  console.log('Received payload from Daemon:', data.toString());
});

ws.on('error', function error(err) {
    console.error('WebSocket Error:', err);
});
