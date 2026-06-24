# SEIS — Install

~30 minutes on a fresh n8n + Notion. No external-system access required (SEIS governs
execution; you wire your own actions into the Execute node).

## Prerequisites
- An n8n instance (Cloud or self-hosted)
- A Notion workspace + an n8n Notion credential (OAuth2)

## Steps

### 1. Create the Notion databases
From `notion-schema.md`, create:
- 🧾 **Execution Fabric — Audit Ledger**
- 📥 **Integration Inbox (Quarantine)**

Also identify your two **promotion targets** (a portfolio/PMO register and a reporting/DAR table),
or create them. **Share all four with your n8n Notion integration** (Share → invite the integration).

### 2. Import the workflows
In n8n → **Import from File** for each of `workflows/*.json`:
- `execution-fabric-property-v1.2.json` — the governed pipeline
- `inbox-promotion-pmo-v1.json` — promotion → PMO
- `inbox-promotion-dar-v1.json` — promotion → DAR

### 3. Wire credentials + database IDs
In each imported workflow:
- Attach your Notion credential to every Notion node *(must be done in the n8n UI — the API can't
  attach a credential across projects).*
- Replace the `databaseId` values with **your** DB IDs (Audit Ledger, Inbox, promotion targets).

### 4. Activate
Activate all three workflows. Note the webhook URLs:
- `POST /webhook/secc-os/execution-fabric`
- `POST /webhook/connector/promote`
- `POST /webhook/connector/promote-dar`

### 5. Verify (reproduce the proof)
Fire the governed pipeline — a valid decision and an invalid one:

```bash
# VALID → executes + writes a success receipt
curl -X POST <host>/webhook/secc-os/execution-fabric -H 'Content-Type: application/json' -d '{
  "decision_id":"D-001","entity_key":"demo|x|portfolio","domain":"property",
  "metric":"occupied_pct","value":95.8,"confidence":0.9,
  "recommended_action":"demo action","routing":{"systems":["YourSystem"]}}'

# INVALID → REJECTED_CONTRACT_VIOLATION, no execution, still audited
curl -X POST <host>/webhook/secc-os/execution-fabric -H 'Content-Type: application/json' -d '{
  "decision_id":"D-002","domain":"property","metric":"Occupancy %","confidence":1.7,
  "recommended_action":"x","routing":{"systems":["YourSystem"]}}'
```

**Success criteria:** your Audit Ledger now has two rows — one `success`, one `rejected` (with the
contract violations listed). That's SEIS proven on your instance.

### 6. Make it yours
- Replace the `Execute Property Actions` node with your real actions (HTTP Request / DB / email…).
- Edit the inlined contract snapshot in `Contract Validator` (or load your own `contracts/`).
- Everything else — gates, verification, audit — is domain-neutral and stays as-is.

## Support
Early access is invite-based while the install is hardened. Questions → `admin@secc-os.com`.
