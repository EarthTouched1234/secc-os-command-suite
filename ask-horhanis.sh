#!/bin/bash
cd /Users/Shared/SECC_OS/ChatBridge || exit 1

MESSAGE="$*"

if [ -z "$MESSAGE" ]; then
  echo "Usage: ./ask-horhanis.sh \"your message\""
  exit 1
fi

echo "" >> CURRENT.md
echo "## iPhone/HORHANiS Request $(date '+%Y-%m-%d %H:%M:%S %Z')" >> CURRENT.md
echo "$MESSAGE" >> CURRENT.md

RESPONSE=$(python3 ~/horhanis-brain.py "$MESSAGE")

OUTFILE="outbox/horhanis-response-$(date '+%Y%m%d-%H%M%S').md"

{
  echo "# HORHANiS Response"
  echo ""
  echo "Created: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo ""
  echo "## SunNi asked"
  echo "$MESSAGE"
  echo ""
  echo "## HORHANiS replied"
  echo "$RESPONSE"
} > "$OUTFILE"

echo "$RESPONSE"
echo ""
echo "Saved to: /Users/Shared/SECC_OS/ChatBridge/$OUTFILE"
