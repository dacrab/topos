#!/usr/bin/env bash
# Runtime smoke check: build, boot the production server, and hit key routes.
# Catches bugs that static checks cannot — e.g. a client hook called from a
# server component renders fine in `next build` but 500s at request time.
#
# Usage: bun run smoke   (from the repo root)

set -euo pipefail

PORT="${SMOKE_PORT:-3999}"

echo "▶ Building production bundle…"
bun run build

echo "▶ Starting production server on :$PORT…"
PORT="$PORT" bun run start &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

# Wait for readiness (max 30s)
for _ in $(seq 1 30); do
  if curl -sf -o /dev/null "http://localhost:$PORT/sign-in"; then break; fi
  sleep 1
done

fail=0
check() {
  local route="$1" expect="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$route")
  if [ "$status" = "$expect" ]; then
    echo "✓ GET $route → $status"
  else
    echo "✗ GET $route → $status (expected $expect)"
    fail=1
  fi
}

# Public routes must render
check "/" 200
check "/sign-in" 200
check "/sign-up" 200
check "/pricing" 200
check "/privacy" 200
check "/terms" 200

# Unknown tenant route 404s via notFound() in the tenant lookup
check "/definitely-not-a-tenant" 404

# Protected routes must redirect to sign-in (with return URL), not 500
for route in /dashboard /listings /deals /contacts /commissions /documents /appointments /activity /settings; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$route")
  if [ "$status" = "307" ] || [ "$status" = "302" ]; then
    echo "✓ GET $route → $status (auth redirect)"
  else
    echo "✗ GET $route → $status (expected 302/307 auth redirect)"
    fail=1
  fi
done

# The auth redirect must carry the return URL
location=$(curl -s -o /dev/null -w "%{redirect_url}" "http://localhost:$PORT/listings")
if [[ "$location" == *"redirect_url=%2Flistings"* ]]; then
  echo "✓ redirect preserves return URL ($location)"
else
  echo "✗ redirect missing return URL: $location"
  fail=1
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "✅ Smoke check passed"
  exit 0
else
  echo "❌ Smoke check FAILED"
  exit 1
fi
