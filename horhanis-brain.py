#!/usr/bin/env python3
"""
horhanis-brain.py — SECC-OS multi-agent ChatBridge.
Routes messages through the SECC-OS Agent Sandbox webhook.
Supported agents: horhanis (default), trio, tito, ciro, sunni, triage

Usage:
  python3 ~/horhanis-brain.py "message"                     # HORHANiS (default)
  python3 ~/horhanis-brain.py --agent tito "message"        # TiTO
  python3 ~/horhanis-brain.py "@trio what is the risk here" # TRiO via prefix
  python3 ~/horhanis-brain.py --session custom-id "msg"     # custom session
  python3 ~/horhanis-brain.py --mode lite "message"         # gpt-4.1-mini (faster/cheaper)
  python3 ~/horhanis-brain.py -m lite --agent ciro "msg"   # Lite + specific agent
"""
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime
import re

SANDBOX_URL = "https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/agent"

VALID_AGENTS = {"horhanis", "trio", "tito", "ciro", "sunni", "triage"}
AGENT_LABELS = {
    "horhanis": "HORHANiS",
    "trio":     "TRiO",
    "tito":     "TiTO",
    "ciro":     "CiRO",
    "sunni":    "SunNi Agent",
    "triage":   "TRiAGE"
}

# ── Parse args ──────────────────────────────────────────────────────────────
args = sys.argv[1:]
agent = "horhanis"
session_override = None
mode = "standard"
message_parts = []

i = 0
while i < len(args):
    if args[i] in ("--agent", "-a") and i + 1 < len(args):
        agent = args[i + 1].lower()
        i += 2
    elif args[i] in ("--session", "-s") and i + 1 < len(args):
        session_override = args[i + 1]
        i += 2
    elif args[i] in ("--mode", "-m") and i + 1 < len(args):
        mode = args[i + 1].lower()
        i += 2
    else:
        message_parts.append(args[i])
        i += 1

if mode not in ("lite", "standard"):
    mode = "standard"

message = " ".join(message_parts).strip()

if not message:
    print("Usage: python3 ~/horhanis-brain.py [--agent AGENT] \"message\"")
    print("Agents: horhanis (default), trio, tito, ciro, sunni, triage")
    print('Prefix: "@trio your message" also works')
    sys.exit(1)

# ── Agent prefix detection: @trio, @tito, etc. ──────────────────────────────
prefix_match = re.match(r'^@(\w+)\s+(.*)', message, re.IGNORECASE | re.DOTALL)
if prefix_match:
    prefix_agent = prefix_match.group(1).lower()
    if prefix_agent in VALID_AGENTS or prefix_agent in {"h", "t", "ti", "c", "s"}:
        agent = prefix_agent
        message = prefix_match.group(2).strip()

if agent not in VALID_AGENTS:
    agent = "horhanis"

agent_label = AGENT_LABELS.get(agent, agent.upper())

# ── Session ID ───────────────────────────────────────────────────────────────
date_str = datetime.now().strftime("%Y%m%d")
session_id = session_override or f"chatbridge-{agent}-{date_str}"

# ── Send to SECC-OS Agent Sandbox ────────────────────────────────────────────
payload = json.dumps({
    "message": message,
    "agent": agent,
    "sessionId": session_id,
    "operator": "SunNi",
    "source": "ChatBridge",
    "mode": mode
}).encode()

try:
    req = urllib.request.Request(
        SANDBOX_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read())
        mode_label = " [lite]" if mode == "lite" else ""
        reply = data.get("reply", f"{agent_label} did not return a response.")
        print(f"[{agent_label}{mode_label}]\n{reply}")
except urllib.error.URLError as e:
    print(f"{agent_label} is unreachable: {e}")
    sys.exit(1)
except json.JSONDecodeError:
    print(f"{agent_label} returned an unreadable response.")
    sys.exit(1)
