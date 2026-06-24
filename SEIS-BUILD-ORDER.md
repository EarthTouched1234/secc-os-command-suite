# SEIS Build Order Map

*The implementation sequence that turns the merged SEIS↔Core design into a real system.*
*Grounded in actual current state (what exists, what's proven, what's blocked) — not aspirational.*

## Governing principle
**Prove → Govern → Harden → Observe → (gated) Execute.**
Never add execution richness on an unproven or ungoverned base. Each phase has an **exit
criterion** (a fact, not a feeling) that unlocks the next.

---

## Phase 0 — PROVE (do first; blocks everything)
The whole stack is built but **nothing has run live**. Until it does, every later phase is
speculation.

- Import `execution-fabric-property-v1.2`, `inbox-promotion-pmo-v1`, `inbox-promotion-dar-v1`
  into n8n **DEV** (`j34hdBkO5PPVJLV5`) — or team `ezHY1ijrdxz3ZrgZ` where the Notion cred lives.
- Attach the Notion credential in the **UI** (Bug 26 — can't be API'd).
- Share the new DBs with the Notion integration (Audit Log `002cc2e2…`, Inbox `07a654a3…`) if
  not already.
- Run all 5 tests in `demo/TIER1-RUNBOOK.md` (test rows already seeded).

**Exit criterion:** an audit row is written, a contract rejection is observed, the LIE program +
06‑13 DAR enrich, both `[TEST]` Inbox rows flip to `Promoted`.
**Unlocks:** trust in the loop; deletion of v1/v1.1; permission to build on top.
**Owner:** you (UI/manual). ~30 min.

---

## Phase 1 — GOVERN (lock single-source-of-truth before adding richness)
Do this *before* adding execution features, so drift never gets baked in.

- **1a — Registry-drive thresholds.** GUARDiAN/risk logic must READ from `threshold-registry.json`,
  not inline constants (`risk > 85` etc.). *(SEIS MODIFY #1.)*
- **1b — Keep the Contract Validator in the gate.** Already present in v1.2 — the rule is simply
  *do not drop it.* *(SEIS REJECT #2.)*
- **1c — (parked) contracts → repo.** Move `/contracts` into `commander-console` so `domains.ts`
  derives from `threshold-registry` instead of transcribing it.

**Exit criterion:** no hardcoded threshold anywhere in the gate; one registry, every layer reads it.
**Depends on:** Phase 0 (don't refactor an unproven gate).

---

## Phase 2 — HARDEN THE LEDGER
- **2a — Append-only doctrine, scoped correctly.** Ledger = immutable append-only; **production
  records (PMO/DAR) stay mutable but fully audited**. *(SEIS MODIFY #2 — prevents paralysis.)*
- **2b — Add ledger fields:** `latency_ms`, `retry_count`, `replay_reference`, `verification_hash`
  (we already have `execution_hash`). *(SEIS MERGE #6.)*
- **2c — Read-back verification node:** after the ledger write, re-query the row and confirm the
  hash → `COMPLETE`; mismatch/absent → `FAILED`. Replaces "assumed success." *(SEIS MERGE #7.)*

**Exit criterion:** every execution produces exactly one ledger row, confirmed by read-back.
**Depends on:** Phase 0 (ledger exists + proven).

---

## Phase 3 — RECOVERY (the real missing production requirement)
- Retry (max 3) → compensation action → escalate to Mission Control → `state = RECOVERY`.
- Writes every attempt to the ledger (`retry_count`). *(SEIS MERGE #5.)*

**Exit criterion:** a forced failure retries, then lands in RECOVERY with a full ledger trail — no
silent failure, no orphan state.
**Depends on:** Phase 2 (ledger fields + verification).

---

## Phase 4 — OBSERVABILITY SUBSYSTEMS (can partly parallel Phase 3)
New Notion tables + a rollup workflow + Mission Control surfacing:

- **4a — Execution Queue** (dispatch buffer between intake and execution). *(SEIS MERGE #2.)*
- **4b — Agent Registry** (status / version / last_used). *(SEIS MERGE #3.)*
- **4c — System Health** (success rate, avg latency, recovery rate, ledger integrity %) + the
  rollup that populates it from the ledger. *(SEIS MERGE #4.)*
- **4d — Surface** all three in Mission Control.

**Exit criterion:** Mission Control shows live execution health from real ledger data.
**Depends on:** Phase 2 (health metrics read ledger fields).

---

## Phase 5 — REAL EXECUTION (GATED — the production go-live wall)
- Replace the **simulated** Execute node with real writes: iAgent **requests** → Pulse **executes**
  → ledger **confirms** (agents never write directly). *(SEIS MODIFY #3.)*
- **BLOCKED ON external access:** fresh CRM IQ `loginguid` + live Yardi (Voyager) write API.

Until this gate clears, the entire system above runs correctly on **POC / simulated data** — which
is exactly the manual-export proof-of-concept. This phase is the only thing standing between a
fully-proven DEV system and live production autonomy.

---

## What to IGNORE / not build
- SEIS's global "no updates/no deletes" rule → **scope to the ledger only**.
- Don't rebuild GUARDiAN or Mission Control (they exist).
- Don't embed thresholds in execution nodes (Phase 1 forbids).
- Don't let agents write directly (request-only).

## Production go-live blockers (the honest list)
1. **Phase 0 proof** (near — ~30 min in n8n UI).
2. **Idempotency dedupe store** for `execution_hash` — currently stubbed; required before real
   external writes to honor "no duplicate effects."
3. **External access:** CRM IQ `loginguid` + Yardi write API (Phase 5).
4. **Credential attach + new-DB integration sharing** (UI/manual, Bug 26).
5. **Env separation** (DEV→TRAINING→PROD as a governed action) if going to true production.

## Dependency graph
```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3
                          └────────► Phase 4
Phase 5 (gated on external access) — sequence AFTER 1–3 so real writes are governed + recoverable
```

## One-line read
Phases 0–4 are **buildable now** and produce a fully-proven, governed, observable, self-recovering
system on POC data. Phase 5 — and only Phase 5 — waits on external API access. The work is not
"more architecture"; it's executing this order without re-opening the frozen Core.
