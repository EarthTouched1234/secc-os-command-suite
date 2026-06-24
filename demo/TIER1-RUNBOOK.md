# Tier-1 Runbook — Prove the Governed Loop (DEV)

*Fire-and-watch. Test rows are already seeded. ~20 min once the blueprints are imported.*

## Prereqs (one-time, n8n UI)
1. Import all 3 blueprints: `execution-fabric-property-v1.2.json`, `inbox-promotion-pmo-v1.json`,
   `inbox-promotion-dar-v1.json`.
2. In each, attach the Notion credential to every Notion node (Bug 26 — must be done in UI).
3. **Webhook URLs:** while a workflow is *inactive*, click **"Listen for test event"** and use the
   **test URL** `…/webhook-test/<path>`. Once you **Activate** it, use the production URL
   `…/webhook/<path>`. Base host: `https://sunnicommandcenter.app.n8n.cloud`.

---

## Test A — Execution Fabric, VALID decision (gate passes → executes → audits)

`POST /webhook/secc-os/execution-fabric`
```json
{
  "decision_id": "D-TEST-001",
  "entity_key": "crmiq|eddy|portfolio",
  "domain": "property",
  "metric": "occupied_pct",
  "value": 95.8,
  "confidence": 0.9,
  "recommended_action": "accelerate unit turnover to protect occupancy",
  "routing": { "systems": ["Yardi"] }
}
```
**Expect:** GUARDiAN `approved` → Contract `contract_valid` → simulated execute → verify →
response is the CIRO feedback JSON (`execution_result: success`). **One new row in
🧾 Execution Fabric — Audit Log** (Execution Status `success`/`verified`, GUARDiAN `approved`).

---

## Test B — Execution Fabric, CONTRACT VIOLATION (passes GUARDiAN, gate rejects)

`POST /webhook/secc-os/execution-fabric`
```json
{
  "decision_id": "D-TEST-002",
  "domain": "property",
  "metric": "Occupancy %",
  "confidence": 1.7,
  "recommended_action": "accelerate turnover",
  "routing": { "systems": ["Yardi"] }
}
```
*(This is crafted to clear GUARDiAN but fail the contract gate.)*
**Expect:** response `status: REJECTED_CONTRACT_VIOLATION` with violations:
`missing_field:entity_key`, `metric_not_canonical:'Occupancy %'->'occupied_pct'`,
`confidence_out_of_range:'1.7'`. **No execution happened**, but an audit row is still written
(Execution Status `rejected`). *This is the money shot for the demo.*

> Optional Test C (GUARDiAN block): set `"recommended_action": "increase rent pricing"` → GUARDiAN
> returns `requires_review` → routed to Guardian Block, never reaches the contract gate. Shows the
> two governance layers are distinct.

---

## Test D — PMO Promotion (seeded test row already in the Inbox)

`POST /webhook/connector/promote`  *(empty body)*

Pre-seeded row: **`[TEST] Portfolio health — LIE`** (Validated, entity_type `portfolio`,
Program `LIE — Leasing Intelligence Engine`, Health 91, green/improving).
[open row](https://app.notion.com/p/3894359699a881a89f96c740dd1fbe5f)

**Expect:**
- PMO program **`LIE — Leasing Intelligence Engine`** changes from Health `null` / RAG `Not Set`
  → **Health 91 · RAG Green · Status Notes "Promoted from Integration Inbox…" · Last Review today**.
- The Inbox test row flips **Record Lifecycle → Promoted**, **Promoted To → PMO**.
- Response: `{ promoted: 1, program: "LIE — Leasing Intelligence Engine", promoted_to: "PMO" }`.

---

## Test E — DAR Promotion (seeded test row already in the Inbox)

`POST /webhook/connector/promote-dar`  *(empty body)*

Pre-seeded row: **`[TEST] Property unit — Eddy box score 06-13`** (Validated, `property_unit`,
Property Code `eddy`, Captured `2026-06-13`, measures occ 96.5 / lease 94.9 / WO 4).
[open row](https://app.notion.com/p/3894359699a881f7b6b5dbb6f7896fc4)

**Expect:**
- The **2026-06-13 DAR** row enriches: Occupied % `95.4 → 96.5`, Lease % `93.8 → 94.9`,
  Pending Work Orders `6 → 4`.
- The Inbox test row flips **Record Lifecycle → Promoted**, **Promoted To → DAR**.
- Response: `{ promoted: 1, property: "The Eddy at Riverview Landing", dar_date: "2026-06-13", promoted_to: "DAR" }`.

---

## ✅ Verification checklist
- [ ] Audit Log has a `success` row (Test A) and a `rejected` row (Test B)
- [ ] Test B response listed the 3 contract violations
- [ ] `LIE — Leasing Intelligence Engine` PMO program now shows Health 91 / Green (Test D)
- [ ] 06-13 DAR shows 96.5 / 94.9 / 4 (Test E)
- [ ] Both `[TEST]` Inbox rows are now `Promoted` with the right `Promoted To`

**When all five pass → v1.2 has "run live once" → the v1/v1.1 deletion gate is met.**

## 🧹 Cleanup after testing
- Delete the 2 `[TEST]` Inbox rows
- Reset the 06-13 DAR to its original values (occ 95.4 / lease 93.8 / WO 6) — or just delete the
  Audit rows; the DAR enrichment is harmless seeded data
- Delete the 2 `[TEST]` leads in the Leads Tracker (separate cleanup)
