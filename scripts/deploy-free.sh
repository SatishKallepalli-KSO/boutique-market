#!/usr/bin/env bash
set -euo pipefail

DASHBOARD_URL="https://dashboard.render.com/web/srv-da19cevqj5pc73cid58g"
LIVE_URL="https://boutique-market-k7m7.onrender.com"

echo ""
echo "Boutique Market — Render"
echo "========================"
echo ""
echo "Dashboard: ${DASHBOARD_URL}"
echo "Live:      ${LIVE_URL}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "${DASHBOARD_URL}"
fi
