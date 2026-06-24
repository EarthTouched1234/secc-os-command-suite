# SUNNi (SEIS) — Deployment Architecture (Living)

**Doc class:** Deployment Architecture — Living (category 3 of 3, per `DECISIONS.md` ADR-008). *Where, and for whom, it runs.*
**Subordinate to** `ARCHITECTURE.md` (Engineering, locked) · **Companion to** `IA-MAP.md` (Capability) · **Governed by** the Platform Expansion Doctrine (one live spine + many dormant skeletons).
This is the **most living** of the three docs — it tracks reality, not intent. Every metric is labeled `LIVE` or `SIMULATED` (`sys_014`).

---

## Executive Status (as of 2026-06-23)

| Phase | Status | Confidence |
|---|---|---|
| Foundation (architecture, governance, IA, agents, Mission Control direction) | ✅ Complete | 100% |
| Execution Spine — **SIMULATED** | ✅ Complete | 95% |
| Real Connector Integration | 🟡 In Progress | 40% |
| Production Reference Implementation | 🔵 Pending | 0% |

---

## Milestones

### M1 — Operational Spine
**Definition:** A complete *simulated* execution loop that produces a permanent enterprise audit record.
**Capability proven:** the platform can **think · route · verify · generate receipts · remember.**

| Criterion | Status |
|---|---|
| Decision Object accepted | ✅ |
| GUARDiAN evaluation | ✅ |
| Approval routing | ✅ |
| Execution routing (multi-system) | ✅ |
| Verification completed | ✅ |
| Receipt generated (CIRO feedback + `execution_hash`) | ✅ |
| **Audit persisted to Notion** | ⏳ in progress (Step 1) |

> M1 is achieved when the final checkbox closes. Everything above it was verified end-to-end on 2026-06-23 against the active DEV workflow `sR584Aa19e1GVV7t` (`POST /webhook/secc-os/execution-fabric`), all `SIMULATED`.

#### M1 — Strict Completion Gate (the persistence invariant)

M1 is **NOT**: an HTTP 200, a running workflow, routing success, or a GUARDiAN evaluation. M1 is **ONLY**: *audit persistence proven*.

**Invariant:** every execution MUST produce a stored, **query-verified** audit record. No execution is `COMPLETE` unless a Notion audit row exists **and** is confirmed by a database read. The HTTP response is never proof — the row is.

Per Decision Object (D-182, D-200, D-201), all six layers must hold; one missing row → M1 not achieved:

| Layer | Requirement |
|---|---|
| Execution | triggered |
| Routing | processed |
| GUARDiAN | evaluated |
| Receipt | generated |
| Notion | row created |
| Verification | row confirmed by DB query |

**Runtime enforcement (already structural in v1.1):** the `Respond — Executed` / `Respond — Blocked` nodes are wired *downstream* of the `Save Audit` Notion nodes, so a success response cannot be emitted unless the audit write succeeds first; a failed Notion create errors the run and returns no `verified` response. **v1.2 may make this explicit:** `IF audit_write_success != true THEN execution_status = FAILED_AUDIT`.

**Verification method:** after firing the 3 test objects, query `collection://94c08a3d-d2d9-4b13-a699-70efd667da55` and confirm 3 rows with matching Decision IDs + statuses. As of 2026-06-23 the table holds **0 rows** because v1.1 has not been imported/activated — the live workflow is still the un-audited old v1.

### M2 — Connected Spine
**Definition:** the Operational Spine executes against **real** enterprise systems.
**Targets (in order):** CRM IQ (read) → CRM IQ (write) → Yardi.
**Capability proven:** the platform can **safely perform real operational work.**
**Gate:** CRM IQ fresh `loginguid` (manual export) + Yardi Voyager API access. This is the Level-5 gate named in the doctrine — only access stands between here and a live reference implementation.

### M3 — Autonomous Enterprise Spine
**Definition:** multiple enterprise systems orchestrated together through the Execution Fabric.
**Targets:** multi-system orchestration · executive reporting · cross-platform automation · enterprise audit chain · AI-driven operational intelligence.
**Capability proven:** the platform coordinates work across connected business platforms while maintaining governance, auditability, and executive visibility.

---

## Execution Mode Roadmap

```
✓ Foundation
✓ Governance
✓ Mission Control
✓ Execution Fabric
✓ Routing
✓ Verification
✓ Receipt
─────────────────  M1 boundary ↓
□ Persistent Audit (Notion)          ← current priority (Step 1)
□ CRM IQ (read-only)
□ CRM IQ (write)
─────────────────  M2 boundary ↓
□ Yardi integration
□ Executive Report generation
□ Property Management Reference Implementation
□ Production Promotion               ← Platform Expansion Rule: first industry → Production
```

---

## Current Priority — Step 1: Persistent Enterprise Audit

**Objective:** replace the simulated audit Code stub in `Execute Property Actions` with a real Notion *create page* into a dedicated Audit DB.

**Flow after this change:**
```
Decision %---> GUARDiAN %---> Execution %---> Verification %---> Receipt %---> Knowledge Capture %---> Permanent Audit Record (Notion)
```

**Outcome:** every execution becomes searchable · auditable · traceable · reportable · reusable as intelligence. *Nothing executed is ever forgotten.*

**Doctrine note:** Step 1 is chosen before CRM IQ/Yardi because it is fully under our control (no external access dependency) and converts a simulated checkbox into a real, permanent capability.

---

## The Property Reference Spine (the one live spine)

```
Property %---> CRM IQ %---> Yardi %---> LIE %---> Report Center %---> Executive Brief %---> Approval %---> Action Router %---> Receipt %---> Knowledge Capture %---> SOP
```

**Current status:** MODELED / SIMULATED end-to-end. Promotes to **Production** only on verified live execution against real data (Platform Expansion Rule). Property is the only **Active** industry; all others are **Design** skeletons (`IA-MAP.md` §5).
