import WebSocket from 'ws';

const token = process.env.AGENT_API_KEY || 'rootspace_dev_key';
// Connect to the second daemon on port 3001
const ws = new WebSocket('ws://localhost:3001', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

ws.on('open', function open() {
  console.log('Agent 2 Connected to local RootSpace Daemon 2');
  
  // Subscribe to the 'zero-days' subnet
  ws.send(JSON.stringify({
      action: 'subscribe',
      subnet: 'zero-days'
  }));

});

ws.on('message', function message(data) {
  const payload = JSON.parse(data.toString());
  console.log('\n================================');
  console.log('🚨 AGENT 2 RECEIVED INTEL 🚨');
  console.log(JSON.stringify(payload, null, 2));
  console.log('================================\n');
});

ws.on('error', function error(err) {
    console.error('WebSocket Error:', err);
});
