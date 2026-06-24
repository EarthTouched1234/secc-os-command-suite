# Architecture Decision Records (ADRs)

Lightweight log of *why* — the reasoning behind decisions, not just the current state.
The current state lives in `ARCHITECTURE.md`; this file preserves the rationale.
Status: `Accepted` · `Superseded` · `Proposed`.

---

### ADR-001 — Architecture locked (v1.0)
**Status:** Accepted · 2026-06-22
**Context:** The system had two competing 5-layer framings; naming, layers, and vocabulary were drifting.
**Decision:** Adopt a single canonical contract (`ARCHITECTURE.md`, SEIS v1.0) as the single source of truth (`sys_018`). Deviation = drift = invalid; changes require a version bump.
**Consequences:** Every implementation/UI/agent/workflow must conform. Removes ambiguity; adds a versioning obligation.

### ADR-002 — Public interface renamed to "SUNNi · Mission Control"
**Status:** Accepted · 2026-06-22
**Context:** Header read "HORHANiS · Commander Console"; HORHANiS is one agent, not the system.
**Decision:** System = SUNNI ENTERPRISE INTELLIGENCE SYSTEM (SEIS); UI = SUNNi Mission Control (`sys_001/002`). Native edition always inherits current brand so the rename can't be masked by cached editions.
**Consequences:** Clear separation of product vs agent identity. Added a brand-consistent sun logo (placeholder for an official asset).

### ADR-003 — iAgent abstraction (interfaces over implementations)
**Status:** Accepted · 2026-06-22
**Context:** `i*` names and established agent names were competing.
**Decision:** `i*` names are architectural **interfaces**; named agents are **implementations** (`sys_021`, §7.3). Encoded in `src/agents/agents.ts`. Named agents are NOT replaced.
**Consequences:** Developers code against stable interfaces; users keep recognizable identities; implementations can evolve without breaking consumers. Deprecates iPulseAgent/iExecutionCore/iCommandNode.

### ADR-004 — LIVE/SIMULATED telemetry policy
**Status:** Accepted · 2026-06-22
**Context:** Every dashboard eventually faces "is this real data?"
**Decision:** All metrics MUST be explicitly labeled `LIVE` or `SIMULATED` (`sys_014`). Mission Control runs on live feeds and is badged `● LIVE`.
**Consequences:** Consistent, scalable trust signal. Any mock-backed panel must carry a `SIMULATED` badge.

### ADR-005 — `%--->` adopted as the canonical flow operator
**Status:** Accepted · 2026-06-22
**Context:** Need one notation for state/stage/pipeline transitions.
**Decision:** `%--->` is the immutable flow DSL operator (`sys_010`). e.g. `Lead %---> Tour %---> Application`.
**Consequences:** One shared vocabulary for flows across docs, UI, and pipelines.

### ADR-006 — Change Governance classification
**Status:** Accepted · 2026-06-22
**Context:** Claude is actively modifying the codebase; high-impact changes need deliberate decisions.
**Decision:** (`sys_022`) Documentation + UI styling = auto · New features = review · Architecture changes + Deployment = explicit approval.
**Consequences:** Routine work flows; architecture/deploy gated — mirrors the Mission Command Center control principle.

### ADR-007 — Agent registry as living metadata
**Status:** Accepted · 2026-06-22
**Context:** The registry was a bare interface→implementation lookup.
**Decision:** Extend `AgentDef` with role, domain, capabilities, status, color, version. The registry is the single source Mission Control builds agent cards / capability matrices / health views / routing from.
**Consequences:** New agent surfaces derive from one place; richer metadata to maintain. Declared `status` is a baseline; live runtime state (`sys_009`) overlays from feeds.

### ADR-008 — Architecture documents classified into three categories
**Status:** Accepted · 2026-06-23
**Context:** ADR-001 locked the *engineering* architecture (SEIS 5-layer stack). A separate *capability* framework (TiTO's 9 layers) then arrived, and deployment concerns (industry packs, the Property reference loop, rollout) are a third distinct thing. Treating these three as one document is what caused the original drift — they answer different questions and change at different rates.
**Decision:** Every architecture document is classified as exactly one of:
1. **Engineering Architecture — Locked.** *How the platform works:* signal flow, contracts, runtime behavior, interfaces, the layer separation rules. Home: `ARCHITECTURE.md`. Changes require a v2+ bump (`sys_011` lock).
2. **Capability Architecture — Versioned.** *What the platform does:* business capabilities, navigation, product modules, feature taxonomy. Home: `IA-MAP.md`. Documentation tier (`sys_022` auto) — evolves freely; references the locked contract, never edits it.
3. **Deployment Architecture — Living.** *Where and for whom it runs:* industry packs, customer implementations, reference loops, rollout strategy. Currently the **Platform Expansion Doctrine** (Property = live spine, others = Design) co-located in `IA-MAP.md` §5; graduates to a dedicated `DEPLOYMENT.md` when Track B (the real Property loop) begins producing content. Most living of the three.
**Consequences:** A reader immediately knows which *kind* of architecture they're looking at and what its change rules are. Engineering stability, ADR integrity, version history, and approval gates are preserved while product and deployment vision evolve independently. Categories 2 and 3 always *sit on top of* and reference category 1 — they may never modify the locked contract. No new empty docs are created ahead of content (DEPLOYMENT.md waits for the Property loop).
