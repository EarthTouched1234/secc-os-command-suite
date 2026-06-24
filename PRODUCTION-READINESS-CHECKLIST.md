# Production Readiness Checklist

*The final gate before any real-world (live external write) deployment. No item is skippable.*
*This is a gate, not a roadmap — it answers "is it safe to go live," not "what do we build."*

## Gate items
- [ ] **Governance complete** — Contract Validator in the gate; thresholds read from the registry (no hardcoded values)
- [ ] **Security complete** — GUARDiAN enforcing; no agent direct writes (request-only); secrets not in code
- [ ] **Baseline / rollback complete** — current n8n workflows exported; repo tagged; restore path verified
- [ ] **Audit complete** — every execution writes exactly one immutable ledger row; verified by read-back
- [ ] **Recovery tested** — a forced failure retries → compensates → escalates → lands in RECOVERY with a full trail
- [ ] **Monitoring tested** — System Health + Connector Registry show live status; Mission Control can explain a failure
- [ ] **Performance tested** — latency captured; no rate-limit / TPM breach under expected load
- [ ] **Idempotency proven** — `execution_hash` dedupe store prevents duplicate external effects
- [ ] **Documentation updated** — runbook + architecture + connector contracts current
- [ ] **Executive approval** — Cartez/SunNi sign-off (the Golden Rule: human holds launch authority)
- [ ] **PRODUCTION READY** — all above checked

## Current status (2026-06-24)
**Not yet at the gate.** Blocking facts:
- Phase 0 (prove the loop) has **not run once** — most items above are untestable until it does.
- External write access (CRM IQ `loginguid` / Yardi API) is absent — so "go live" = POC/DEV only for now.
- Idempotency dedupe store is **stubbed** — must be built before any real external write.

The checklist becomes actionable the moment Phase 0 produces its first execution receipt.
