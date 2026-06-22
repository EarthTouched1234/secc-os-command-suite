# Execution Fabric v1 — Property Domain

The first real-world mutation layer: **Decision Object → enterprise system actions**, scoped to Property only (Yardi · CRM IQ · Notion). Deterministic, GUARDiAN-gated, idempotent, verified, feedback-closed.

**Workflow:** `execution-fabric-property-v1.json` (import into n8n)
**Webhook:** `POST /webhook/secc-os/execution-fabric`

---

## End-to-end flow

```
Decision Object → Webhook → GUARDiAN Gate → Approved? ──yes─→ Execute → Verify → CIRO Feedback → Respond
                                                  └──no──→ Guardian Block → Respond
```

This realizes: `Signal → Decision → Execution Fabric → GUARDiAN → n8n → External Systems → Verification → CIRO Outcome → Feedback`.

## Status of this version

| Layer | State |
|-------|-------|
| GUARDiAN gate (idempotency hash, field/risk validation) | ✅ built |
| Routing (maintenance/leasing/vacancy) | ✅ built |
| Execution verification + CIRO feedback | ✅ built |
| Notion audit | ⚠️ simulated in Code node — swap for a Notion `create page` node |
| **Yardi mutation** | ⛔ **simulated** — blocked on Voyager API access |
| **CRM IQ mutation** | ⛔ **simulated** — blocked on a fresh `loginguid` |

v1 returns simulated `success` so the full orchestration (gate → route → verify → feedback) runs and is testable end-to-end **today**. The Yardi/CRM IQ blocks are clearly marked swap points (`REAL:` comments in `Execute Property Actions`).

---

## 1. Decision Intake Contract

The Fabric only accepts structured Decision Objects:

```json
{
  "decision_id": "D-182",
  "domain": "Property",
  "priority": "high",
  "recommended_action": "accelerate_maintenance_queue + leasing_outreach",
  "routing": { "systems": ["Yardi", "CRM_IQ"], "agents": ["Maintenance_Agent", "Leasing_Agent"] }
}
```

## 2. GUARDiAN Gate (rules + risk)

| Check | Result | Risk |
|-------|--------|------|
| Missing required field | `rejected` | 1.0 |
| `domain !== Property` | `rejected` (v1 scope) | 0.9 |
| Financial / pricing / rent change | `requires_review` (human approval) | 0.7 |
| Otherwise | `approved` | 0.2 |

Output: `{ status: approved|rejected|requires_review, reason, risk_score }` + `execution_hash`.

## 3. Execution State Hash (idempotency)

```
execution_hash = hash(decision_id + systems + recommended_action)
```

Computed in the gate. **To enforce real dedupe:** look the hash up in a persistent store (Notion/Redis) and reject duplicates. (v1 computes it; persistence is the next add — see "Next upgrades".)

## 4. Property Execution Map

| Trigger | Actions |
|---------|---------|
| Maintenance backlog > threshold | Yardi: reprioritize work orders · Notion: log · Slack: notify lead |
| Occupancy drop / tour-conversion decline | CRM IQ: follow-up tasks + increase cadence · Notion: log |
| Unit turnover delay | Yardi: update unit readiness · fast-track repairs · prioritize marketing |
| Occupancy + market deviation *(v1.1)* | Finance alert · log pricing review (requires_review) |

## 5. Real API mapping (swap targets)

**Yardi** — `POST {yardi}/workorders/create`
```json
{ "priority": "high", "unit": "A-1203", "category": "turnover acceleration", "notes": "AI PMO decision D-182" }
```

**CRM IQ** — base `16458fortis.elevate.cafe`, headers `database: Live`, `loginguid: <fresh>`, `role: CRM IQ Leasing`. Create leasing task / update lead status. (`loginguid` expires — refresh from browser dev tools.)

**Notion audit** — `create page` in an audit DB: Decision ID, actions executed, systems affected, execution_hash, timestamp, status.

## 6. Feedback to CIRO

```json
{ "decision_id": "D-182", "execution_result": "success", "systems_updated": ["Yardi:reprioritize_work_orders"], "execution_hash": "exh_…", "timestamp": "", "status": "verified" }
```

Feeds the Outcome Attribution layer → system learning loop.

---

## Safety model (non-negotiable)

- No direct financial changes without approval (gate → `requires_review`)
- No bulk actions without batching validation
- No cross-property execution leakage
- All actions logged to the Notion audit trail
- Idempotency hash prevents duplicate execution

## Activation steps

1. Import `execution-fabric-property-v1.json` into n8n (recommended: the **DEV sandbox project** `j34hdBkO5PPVJLV5` first — isolated from production).
2. Test with a simulated Decision Object (`POST /webhook/secc-os/execution-fabric`) — confirm gate → route → verify → feedback.
3. When access lands: replace the Yardi block with a Yardi HTTP Request node; the CRM IQ block with a CRM IQ HTTP Request node (fresh `loginguid`); the audit block with a Notion node.
4. Add hash persistence for real idempotency.
5. Promote DEV → TRAINING → PROD through the GUARDiAN gate.

## Next upgrades (in order — do not skip)

1. Retry logic / failure recovery / partial-execution handling
2. Execution Replay Engine (safely re-run failed decisions)
3. Agent attribution (which agent caused which outcome)
4. Expand to a second system **only after Property stabilizes** — do not scale domains yet
