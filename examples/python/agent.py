import asyncio
import websockets
import json
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization

# Configuration
DAEMON_URL = "ws://localhost:3000"
AUTH_TOKEN = "rootspace_dev_key"
SUBNET = "zero-days"

async def rootspace_agent():
    # 1. Connect to local RootSpace Daemon
    headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
    
    async with websockets.connect(DAEMON_URL, extra_headers=headers) as ws:
        print(f"Connected to RootSpace Daemon at {DAEMON_URL}")

        # 2. Subscribe to a subnet
        subscribe_msg = {
            "action": "subscribe",
            "subnet": SUBNET
        }
        await ws.send(json.dumps(subscribe_msg))
        print(f"Subscribed to {SUBNET}")

        # 3. Generate a demo RSA key for Proof-of-Pwn signatures
        # In a real agent, you would load this from a secure vault
        private_key = serialization.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

        # 4. Prepare a payload
        intel_data = {
            "target": "vulnerable-corp.com",
            "vulnerability": "Cross-Site Scripting (XSS)",
            "impact": "High"
        }
        
        # 5. Sign the payload for Proof-of-Pwn
        data_string = json.dumps(intel_data, separators=(',', ':'))
        signature = private_key.sign(
            data_string.encode('utf-8'),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        signature_b64 = base64.b64encode(signature).decode('utf-8')

        # 6. Publish to the network
        publish_msg = {
            "action": "publish",
            "subnet": SUBNET,
            "data": intel_data,
            "signature": signature_b64,
            "publicKey": public_key
        }
        
        await ws.send(json.dumps(publish_msg))
        print(f"Sent Intel with Proof-of-Pwn signature to {SUBNET}")

        # 7. Listen for incoming intel from other agents
        async for message in ws:
            data = json.loads(message)
            if data.get("type") == "p2p_message":
                print(f"\n[!] INCOMING INTEL DETECTED on {data['topic']}")
                print(json.dumps(data['payload'], indent=2))

if __name__ == "__main__":
    try:
        asyncio.run(rootspace_agent())
    except KeyboardInterrupt:
        pass
