#!/bin/bash
# Start Commander Console dev server + Cloudflare Tunnel

TUNNEL_TOKEN="eyJhIjoiY2Y3Mjc3NTIyMGRlMGY5ODExYmQ4ZjRmNTExYWZhYjUiLCJzIjoiTVRBeFpHUm1ZVFl0TVRoaVlpMDBPR1JrTFRoaVpEUXRPVGt5TVdFME5UUXhZalZrIiwidCI6ImIxNzFlNzMwLWFlNDQtNDNiNS1iYzY2LWUxM2VmMDljYzA3MyJ9"

trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Building Commander Console..."
npm run build

echo "Starting Commander Console on port 5173..."
npx vite preview --host 127.0.0.1 --port 5173 &

echo "Starting Cloudflare Tunnel → console.secc-os.com..."
cloudflared tunnel run --token "$TUNNEL_TOKEN" &

wait
