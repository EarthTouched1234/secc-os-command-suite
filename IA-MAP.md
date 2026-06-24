# SUNNi (SEIS) — Information Architecture Map (Capability View)

**Doc class:** Capability Architecture — Versioned (category 2 of 3, per `DECISIONS.md` ADR-008). *What the platform does.*
**Tier:** Documentation (auto per `sys_022`/ADR-006) · **Subordinate to** `ARCHITECTURE.md` (the locked v1.0 contract — Engineering Architecture, category 1).
**Companion to** `ROADMAP.md` (build order) · `DECISIONS.md` (ADRs). Deployment Architecture (category 3 — Property spine, industry rollout) lives in §5 below until it graduates to `DEPLOYMENT.md`.
**Adopted:** 2026-06-23. Reconciles TiTO's 9-layer Enterprise Intelligence Framework with the locked SEIS 5-layer stack.

> This file does **not** change the architecture. It is a navigation/placement map. The locked
> 5 layers in `ARCHITECTURE.md` are the **system stack** (how signal flows through the machine).
> TiTO's 9 layers are a **capability taxonomy** (where an executive's functions live in the UI).
> They are orthogonal: the 9 map *onto* the 5. Any change to the 5 layers still requires a v2 bump.

---

## 1. Two views, one system

| View | What it answers | Owner doc | Changeable? |
|---|---|---|---|
| **System stack** (5 layers) | *How does the machine work?* — signal → intelligence → execution → agents → control → UI | `ARCHITECTURE.md` (LOCKED) | v2 bump only |
| **Capability taxonomy** (9 layers) | *What can the executive do, and where is it?* — nav grouping of features | this file | Documentation tier (auto) |

The capability layers are **presentation/IA only** — they never define logic (`sys_013`). They give every current and future module a clear home so features stop being added organically.

---

## 2. The 9 capability layers → locked 5 SEIS layers

| # | TiTO capability layer | Function | Maps onto SEIS layer(s) |
|---|---|---|---|
| 1 | **Executive** | Oversight, decision authority, exec brief, approvals | Mission Command Center (`sys_003`) |
| 2 | **Strategic** | Portfolio/program/roadmap, objectives, go-to-market, platform strategy | Mission Command Center + Intelligence Engine |
| 3 | **Operational** | Day-to-day execution surfaces: dispatch, queue, tasks, projects, inbox | Pulse Engine (`sys_004`) |
| 4 | **Intelligence** | KPI/forecast/trend/risk synthesis, decisions, outcome attribution | Intelligence Engine (`sys_007`) |
| 5 | **Automation** | Workflow/connector actuation, the execution fabric | Pulse Engine (`sys_004`) |
| 6 | **Knowledge** | Docs, SOPs, lessons learned, knowledge capture | Intelligence Engine (capture) |
| 7 | **Governance** | Zero-trust, risk register, compliance, protected actions | iAgent Network (iGuardian) + Mission Command Center |
| 8 | **Reporting** | Report Center: exec / portfolio / operational / compliance reports | Intelligence Engine (`sys_007`) |
| 9 | **Industry** | Industry Packs — sector configuration over the shared engine | Market Intelligence Portfolio + Contract Registry |

**Cross-layer reality:** the **iAgent Network** (`sys_005`) is not a capability layer — it is the workforce that *staffs* every layer (iCommander/iCoordinator/iExecution/iIntegration/iIntelligence/iGuardian, §7.3). It runs inside the Pulse Engine only.

---

## 3. Lineage (so we don't lose history)

The earlier "5 executive layers (target nav)" were a coarser cut of the same idea; TiTO's 9 split them finer:

| Old superseded 5 (target nav) | → TiTO 9 |
|---|---|
| Executive Intelligence | Executive + Strategic |
| Enterprise Portfolio | Strategic |
| Operations | Operational + Automation |
| Intelligence | Intelligence + Knowledge + Reporting |
| Enterprise Platform | Governance + Industry |

---

## 4. Module placement map (current 19 modules → capability layer)

Primary home shown; ⊕ = also serves a secondary layer. All modules are part of the **shared engine** — they are not industries.

| Module | Capability layer | Data status (`sys_014`) |
|---|---|---|
| `MissionControl` | Executive | LIVE |
| `Approve` | Executive ⊕ Governance | LIVE |
| `Critical` | Executive ⊕ Governance | LIVE |
| `PMO` | Strategic | LIVE |
| `Timeline` (Mission Timeline) | Strategic | LIVE |
| `GTM` | Strategic | SIMULATED (sales assets) |
| `Platform` (10 domains) | Strategic ⊕ Industry | SIMULATED |
| `Execute` | Operational | LIVE |
| `Inbox` | Operational | LIVE |
| `Projects` | Operational | LIVE |
| `Tasks` | Operational | LIVE (localStorage) |
| `ChatBridge` | Operational ⊕ Intelligence | LIVE |
| `Agents` | Operational (iAgent activity) | LIVE |
| `Decisions` (AI Decision Layer) | Intelligence | SIMULATED |
| `Outcomes` (attribution) | Intelligence | SIMULATED |
| `Fabric` (Execution Fabric) | Automation | SIMULATED |
| `Connectors` | Automation | LIVE |
| `Documents` | Knowledge | LIVE (localStorage) |
| `GUARDiAN` | Governance | LIVE |
| *Report Center* (planned, ROADMAP L4) | Reporting | — |

---

## 5. Spine vs Skeletons (Platform Expansion Doctrine, 2026-06-23)

The shared engine (§4) is industry-agnostic. **Industry status** applies only to the **Industry Layer** (Layer 9 — the packs). Per the doctrine *One Live Spine + Many Dormant Skeletons*:

| Industry Pack | Status | Notes |
|---|---|---|
| **Property Management** | **Active — LIVE SPINE** | The reference implementation. Loop being proven end-to-end: `Property %---> CRM IQ %---> Yardi %---> LIE %---> Report Center %---> Executive Brief %---> Approval %---> Action Router %---> Receipt %---> Knowledge Capture %---> SOP`. Currently MODELED/SIMULATED; promotes to Production only on verified live execution. |
| Construction | Design | Skeleton — documented, not Active |
| Healthcare | Design | Skeleton |
| Finance | Design | Skeleton |
| Government | Design | Skeleton |
| Technology / IT | Design | Skeleton |
| Manufacturing | Design | Skeleton |
| Logistics · Retail · Education · Energy · Consulting | Design | Skeletons |

**Platform Expansion Rule:** no industry is promoted to **Production** until the previous industry has a *verified* end-to-end execution loop. Industries may sit in **Design** indefinitely. Property is the only Active industry until its loop runs against real data.

Industry Packs are not bespoke builds — each is a configuration of the frozen **Enterprise Contract Registry** (`/contracts`: domain / metric / threshold registries). "One core engine, tailored per sector" is literally the contract-driven design (see ROADMAP L4 + Connector Adapter notes).

---

## 6. Conformance

- **No architecture change.** The locked 5 SEIS layers (`ARCHITECTURE.md` §2, `sys_003`–`sys_008`) are untouched. This is a capability/nav overlay — Documentation tier, auto per `sys_022`. No ADR or version bump required.
- **`sys_014` honored.** Every module carries an explicit LIVE/SIMULATED status (§4); every panel built later must too.
- **Doctrine honored.** Spine/skeleton status (§5) keeps the platform a mile *deep* (Property live) before a mile wide.
- **Next:** ROADMAP L1 task "re-group top nav into the 5 canonical layers" can now key off this capability map for sub-grouping. Report Center (L4) lands in the Reporting layer; Industry Packs (L4) in the Industry layer.
