#!/usr/bin/env bash
set -euo pipefail

BRIDGE_DIR="/Users/Shared/SECC_OS/ChatBridge"
CURRENT="$BRIDGE_DIR/CURRENT.md"

usage() {
  printf 'Usage:\n'
  printf '  %s open\n' "$0"
  printf '  %s show\n' "$0"
  printf '  %s note "message"\n' "$0"
  printf '  %s checkpoint "message"\n' "$0"
}

case "${1:-}" in
  open)
    open "$BRIDGE_DIR"
    ;;
  show)
    sed -n '1,220p' "$CURRENT"
    ;;
  note)
    shift
    if [ "$#" -eq 0 ]; then
      usage
      exit 2
    fi
    {
      printf '\n## Note %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')"
      printf '%s\n' "$*"
    } >> "$CURRENT"
    ;;
  checkpoint)
    shift
    if [ "$#" -eq 0 ]; then
      usage
      exit 2
    fi
    file="$BRIDGE_DIR/checkpoints/$(date '+%Y%m%d-%H%M%S')-checkpoint.md"
    {
      printf '# Checkpoint\n\n'
      printf 'Created: %s\n\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')"
      printf '%s\n' "$*"
    } > "$file"
    chmod 660 "$file"
    printf '%s\n' "$file"
    ;;
  *)
    usage
    exit 2
    ;;
esac
