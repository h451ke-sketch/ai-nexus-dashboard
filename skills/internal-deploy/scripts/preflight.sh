#!/usr/bin/env bash
# Preflight check before running `co deploy apply`. Exits non-zero if anything
# looks unsafe, so the agent can stop early.
set -euo pipefail

service="${1:?usage: preflight.sh <service> <env>}"
env="${2:?usage: preflight.sh <service> <env>}"

echo "→ checking $service @ $env"

# 1. cluster health
co deploy status "$service" --env "$env" --json \
  | jq -e '.healthy == true' >/dev/null \
  || { echo "✗ cluster reports unhealthy"; exit 1; }

# 2. release freeze
if co release-freeze list --env "$env" --active --json | jq -e 'length > 0' >/dev/null; then
  echo "✗ release freeze active for $env — aborting"
  exit 1
fi

# 3. pending migrations
if co db migrate "$service" --env "$env" --check --json | jq -e '.pending > 0' >/dev/null; then
  echo "✗ pending DB migrations — run \`co db migrate $service --env $env\` first"
  exit 1
fi

echo "✓ preflight passed"
