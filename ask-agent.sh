#!/bin/bash
# ask-agent.sh — SECC-OS multi-agent ChatBridge
# Usage:
#   ./ask-agent.sh horhanis "your message"
#   ./ask-agent.sh tito "diagnose this error"
#   ./ask-agent.sh "@trio is this routing decision correct?"
#   ./ask-agent.sh "message"  (defaults to HORHANiS)
#
# Agents: horhanis, trio, tito, ciro, sunni, triage

cd /Users/Shared/SECC_OS/ChatBridge || exit 1

# ── Parse agent and message ──────────────────────────────────────────────────
AGENT="horhanis"
MESSAGE=""

VALID_AGENTS=("horhanis" "trio" "tito" "ciro" "sunni" "triage")

if [ $# -eq 0 ]; then
  echo "Usage: ./ask-agent.sh [AGENT] \"message\""
  echo "       ./ask-agent.sh \"@agent message\"  (prefix syntax)"
  echo "Agents: horhanis (default), trio, tito, ciro, sunni, triage"
  exit 1
fi

# Check if first arg is a known agent name
FIRST=$(echo "$1" | tr '[:upper:]' '[:lower:]')
IS_AGENT=false
for a in "${VALID_AGENTS[@]}"; do
  if [ "$FIRST" = "$a" ]; then
    IS_AGENT=true
    break
  fi
done

if [ "$IS_AGENT" = true ]; then
  AGENT="$FIRST"
  shift
  MESSAGE="$*"
else
  MESSAGE="$*"
fi

if [ -z "$MESSAGE" ]; then
  echo "Error: No message provided."
  exit 1
fi

# ── Agent display name ───────────────────────────────────────────────────────
case "$AGENT" in
  horhanis) LABEL="HORHANiS" ;;
  trio)     LABEL="TRiO" ;;
  tito)     LABEL="TiTO" ;;
  ciro)     LABEL="CiRO" ;;
  sunni)    LABEL="SunNi Agent" ;;
  triage)   LABEL="TRiAGE" ;;
  *)        LABEL="${AGENT^^}" ;;
esac

# ── Log to CURRENT.md ────────────────────────────────────────────────────────
echo "" >> CURRENT.md
echo "## [$LABEL] Request $(date '+%Y-%m-%d %H:%M:%S %Z')" >> CURRENT.md
echo "$MESSAGE" >> CURRENT.md

# ── Call brain ───────────────────────────────────────────────────────────────
RESPONSE=$(python3 ~/horhanis-brain.py --agent "$AGENT" "$MESSAGE")

# ── Save to outbox ───────────────────────────────────────────────────────────
OUTFILE="outbox/${AGENT}-response-$(date '+%Y%m%d-%H%M%S').md"
{
  echo "# $LABEL Response"
  echo ""
  echo "Created: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo ""
  echo "## SunNi asked"
  echo "$MESSAGE"
  echo ""
  echo "## $LABEL replied"
  echo "$RESPONSE"
} > "$OUTFILE"

echo "$RESPONSE"
echo ""
echo "[$LABEL] Saved to: /Users/Shared/SECC_OS/ChatBridge/$OUTFILE"
