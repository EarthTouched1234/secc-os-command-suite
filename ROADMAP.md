# SUNNI (SEIS) — Layer-Aligned Implementation Roadmap (v1.x)

Build order follows the locked architecture (`ARCHITECTURE.md`). Each layer is a
milestone. Principle: **reuse existing assets, don't duplicate** (single source of truth).
Every new metric panel carries a `LIVE` or `SIMULATED` badge (`sys_014`).

Legend: ✅ done · 🔜 next · ⬜ planned · ♻ reuses existing asset

---

## v1.0.0 — Architecture Locked · Mission Control Foundation
- ✅ `ARCHITECTURE.md` canonical contract (LOCKED)
- ✅ iAgent interface→implementation map (`src/agents/agents.ts`, §7.3)
- ✅ Mission Control home screen (live feeds, `● LIVE` badge)
- ✅ SUNNi · Mission Control rebrand + sun logo
- ✅ Change Governance rule (`sys_022`)
- 🔜 Final browser review → **commit + deploy as `v1.0.0`** (explicit approval gate)

---

## LAYER 1 — Mission Command Center (polish to v1.1)
*Control/oversight. Does not execute.*
- ⬜ Make Mission Control count tiles **clickable** → deep-link to their tab (Approvals→Approve, Risks→GUARDiAN, Programs→PMO).
- ⬜ **Decision Queue** panel ♻ `fetchPendingActions()` (Action Store) — approvals awaiting SunNi, inline approve.
- ⬜ **Executive Brief** as natural language ♻ Agent Sandbox (iIntelligence/SunNi) synthesizing the live KPIs into "Good afternoon, SunNi…".
- ⬜ Re-group top nav into the 5 canonical layers (pure IA, no new data).

## LAYER 2 — Pulse Engine
*Execution. Does not decide.*
- ⬜ Surface canonical states (`sys_009`: IDLE/OBSERVE/ACTIVE/STREAMING/BLOCKED/COMPLETE/ERROR) on executions ♻ n8n `systemExecs`.
- ⬜ **Execution Timeline / Queue** view ♻ `TheFlow` + dispatch feed.
- ⬜ `%--->` pipeline visualization (e.g. `Lead %---> Tour %---> Application`).

## LAYER 3 — iAgent Network
*Distributed execution; agents run inside Pulse Engine only.*
- ✅ Interface registry (`agents.ts`).
- ⬜ Adopt `agentName()`/`agentColor()` across components (replace ad-hoc agent color maps).
- ⬜ Agent detail view: interface, implementation, responsibility, SLA ♻ `SLA_TARGETS`, live activity.

## LAYER 4 — Intelligence Engine
*Execution data → insight.*
- ⬜ **Report Center** shell: Executive (CEO/COO/CFO/CIO/PMO) · Portfolio · Operational reports.
- ⬜ **Industry Packs** ♻ Enterprise Contract Registry (`/contracts`: domain/metric/threshold) — packs are a presentation layer over the 10 domains, KPIs/thresholds load from contracts.
- ⬜ Forecasting/trend surfaces ♻ PMO Trajectory + Financial Sentinel + GUARDiAN risk.

## LAYER 5 — Market Intelligence Portfolio
*External signal ingestion.*
- ⬜ Register **Market Intelligence** portfolio in PMO Portfolio Register (programs: LinkedIn, Website, PMO Demand, Customer Research, Competitor, Product Feedback). ♻ existing Register.
- ⬜ **LinkedIn → SSIE** Social Analytics (seed real week; connector later). ♻ SSIE DB — no new store.
- ⬜ New Connector Adapters (website / GitHub / waitlist / demo) → Integration Inbox → promote. ♻ Connector Adapter + Integration Inbox (frozen v2.0).
- ⬜ **Market Intelligence Snapshot** panel on Mission Control (`LIVE` from SSIE).

---

## Deploy gates (per `sys_022`)
`v1.0.0` ships when: architecture locked ✅ · iAgent map resolved ✅ · roadmap established ✅ · UI reviewed (pending). Each later layer milestone = its own reviewed deploy.
