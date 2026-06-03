#!/usr/bin/env bash
# End-to-end sales pipeline test (API). Requires API on :4000 and ADMIN_API_TOKEN.
set -euo pipefail

API_URL="${API_URL:-http://localhost:4000}"
TOKEN="${ADMIN_API_TOKEN:?Set ADMIN_API_TOKEN}"
HDR=(-H "X-Admin-Token: $TOKEN" -H "Content-Type: application/json")
UNIQUE="e2e-$(date +%s)"

echo "== 1. Submit demo request =="
DEMO_BODY=$(cat <<EOF
{
  "fname": "Alex",
  "lname": "Pipeline",
  "email": "${UNIQUE}@example.com",
  "phone": "5550101999",
  "company": "Pipeline Test Co",
  "what_automate": "Automated lead routing and CRM sync",
  "budget": "50000",
  "timeline": "Q2 2026"
}
EOF
)
DEMO_RES=$(curl -sf -X POST "$API_URL/api/leads/demo" -H "Content-Type: application/json" -d "$DEMO_BODY")
echo "$DEMO_RES"
LEAD_ID=$(python3 -c "import json,sys; print(json.load(sys.stdin)['id'])" <<<"$DEMO_RES")
[[ "$LEAD_ID" != "null" && -n "$LEAD_ID" ]] || { echo "Demo submit failed"; exit 1; }

echo "== 2. Confirm lead in GET /api/leads =="
LEADS=$(curl -sf "$API_URL/api/leads" "${HDR[@]}")
python3 -c "import json,sys; leads=json.load(sys.stdin)['leads']; m=[l for l in leads if l['id']=='$LEAD_ID']; print(m[0] if m else 'MISSING')" <<<"$LEADS"

echo "== 3. Update lead status (qualified) =="
curl -sf -X PATCH "$API_URL/api/leads/$LEAD_ID/status" "${HDR[@]}" \
  -d '{"pipelineStage":"qualified"}' | python3 -m json.tool

echo "== 4. Lead detail =="
curl -sf "$API_URL/api/leads/$LEAD_ID" "${HDR[@]}" | python3 -m json.tool

echo "== 5. Convert lead to opportunity =="
CONV=$(curl -sf -X POST "$API_URL/api/leads/$LEAD_ID/convert-to-opportunity" "${HDR[@]}" -d '{}')
echo "$CONV" | python3 -m json.tool
OPP_ID=$(python3 -c "import json,sys; print(json.load(sys.stdin)['opportunity']['id'])" <<<"$CONV")

echo "== 6. Update opportunity stage (negotiation) =="
curl -sf -X PATCH "$API_URL/api/opportunities/$OPP_ID" "${HDR[@]}" \
  -d '{"stage":"negotiation"}' | python3 -m json.tool

echo "== 7. Convert opportunity to client =="
CLIENT_RES=$(curl -sf -X POST "$API_URL/api/opportunities/$OPP_ID/convert-to-client" "${HDR[@]}" -d '{"stackTemplateId":"tpl-basic"}')
echo "$CLIENT_RES" | python3 -m json.tool
CLIENT_ID=$(python3 -c "import json,sys; print(json.load(sys.stdin)['client']['id'])" <<<"$CLIENT_RES")
PORTAL_ID=$(python3 -c "import json,sys; print(json.load(sys.stdin).get('portalClientId',''))" <<<"$CLIENT_RES")
[[ -n "$PORTAL_ID" ]] || { echo "portalClientId missing from convert response"; exit 1; }

echo "== 8. Confirm client in GET /api/clients =="
curl -sf "$API_URL/api/clients" "${HDR[@]}" | python3 -c "import json,sys; clients=json.load(sys.stdin)['clients']; m=[c for c in clients if c['id']=='$CLIENT_ID']; print(m[0] if m else 'MISSING')"

echo "== Pipeline board snapshot =="
curl -sf "$API_URL/api/leads/pipeline" "${HDR[@]}" | python3 -c "import json,sys; print('cards:', len(json.load(sys.stdin)['cards']))"

echo "OK: full chain passed (lead=$LEAD_ID opp=$OPP_ID client=$CLIENT_ID)"
