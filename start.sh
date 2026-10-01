#!/bin/bash
# Start Commander Console dev server + Cloudflare Tunnel
# Required locally: export TUNNEL_TOKEN=<Cloudflare tunnel token>
# Never commit tunnel credentials to source control.

set -euo pipefail

: "${TUNNEL_TOKEN:?TUNNEL_TOKEN must be set in the environment}"

trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

echo "Building Commander Console..."
npm run build

echo "Starting Commander Console on port 5173..."
npx vite preview --host 127.0.0.1 --port 5173 &

echo "Starting Cloudflare Tunnel → console.secc-os.com..."
cloudflared tunnel run --token "$TUNNEL_TOKEN" &

wait
