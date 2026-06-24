# SUNNI ENTERPRISE INTELLIGENCE SYSTEM (SEIS)
## v1.0 — Canonical Architecture Contract (LOCKED · 2026-06-22)

Single source of truth for system architecture, naming, execution logic, UI mapping,
agent structure, and the signal system. Any deviation is drift and is invalid.
Changes require an explicit version bump (v2+).

**Related:** `ROADMAP.md` (layer-aligned build order) · `DECISIONS.md` (ADRs — the *why*).

---

## 1. System Identity
- **System name** (`sys_001`): `SUNNI ENTERPRISE INTELLIGENCE SYSTEM (SEIS)`
- **Public/UI name** (`sys_002`): `SUNNi MISSION CONTROL`

## 2. Core Architecture — 5 immutable layers

| # | Layer (canonical) | ID | Function | Hard rule |
|---|---|---|---|---|
| 1 | **Mission Command Center** | `sys_003` | Control — executive oversight + decision authority (monitoring, approvals, prioritization, risk escalation, exec brief) | **Does NOT execute work** |
| 2 | **Pulse Engine** | `sys_004` | Execution — workflow/automation runs (n8n, APIs), task processing, state transitions | **Does NOT decide** |
| 3 | **iAgent Network** | `sys_005` | Agent — distributed execution intelligence. `i` = identity-based execution unit (`sys_006`). Interfaces: iCommander, iCoordinator, iExecution, iIntegration, iIntelligence, iGuardian (see §7.3) | **Agents execute inside Pulse Engine only** |
| 4 | **Intelligence Engine** | `sys_007` | Intelligence — KPI generation, forecasting, risk detection, trend analysis, exec reporting | — |
| 5 | **Market Intelligence Portfolio** | `sys_008` | Market signal ingestion — LinkedIn/web analytics, product feedback, competitor + PMO demand signals | — |

## 3. Global State System (`sys_009`) — the only valid states
`IDLE` · `OBSERVE` (read-only monitoring) · `ACTIVE` · `STREAMING` · `BLOCKED` · `COMPLETE` · `ERROR`

## 4. Flow DSL
- Operator (`sys_010`, immutable): `%--->`
- Directional transition between states / workflow stages / pipeline steps.
- e.g. (`sys_011`) `Tour %---> Follow-up %---> Application` · (`sys_012`) `IDLE %---> ACTIVE %---> STREAMING %---> COMPLETE`

## 5. UI Mapping Layer (visual only — non-logic)
| UI element | Meaning |
|---|---|
| Eye icon | OBSERVE state |
| Green dot | ACTIVE system health |
| Green moving arrow | LIVE `%--->` transition |
| Ribbon | full workflow timeline |
| Color nodes | metadata tagging |

**Critical rule** (`sys_013`): UI elements NEVER control system logic.

## 6. Data Classification (`sys_014`)
**All metrics MUST be explicitly labeled `SIMULATED` or `LIVE`.**
- SIMULATED: mock KPIs, design dashboards, UI placeholders.
- LIVE: API-connected metrics, real workflow state, real analytics feeds.

## 7. Identity System
- **7.1** Agent identity prefix (`sys_015`): `i` = execution identity marker — defines *who executes*; not state, not function, not UI.
- **7.2** Resolution (v1.0, RESOLVED): `i*` names are **architectural interfaces**; the established named agents are the **implementations**. Named agents are NOT replaced — developers code against stable interfaces, users keep the recognizable identities.
- **7.3** Interface → Implementation map (`sys_021`):

| Interface | Implementation | Primary responsibility |
|---|---|---|
| `iCommander` | HORHANiS | Governance, approvals, executive control |
| `iCoordinator` | TRiO | Multi-agent orchestration |
| `iExecution` | TiTO | Task execution and workflow operations |
| `iIntegration` | CiRO | APIs, connectors, synchronization |
| `iIntelligence` | SunNi | Strategic reasoning, synthesis, executive insights |
| `iGuardian` | GUARDiAN | Security, compliance, monitoring, risk |

> Earlier illustrative names (iPulseAgent/iExecutionCore/iCommandNode) are deprecated — superseded by this map.

- **7.4** Registry is **living metadata** (`src/agents/agents.ts`): each `AgentDef` carries role, domain (Governance/Execution/Integration/Intelligence/Security), capabilities[], status, color, version. Mission Control builds agent cards / capability matrices / health / routing from it.

## 8. Relationship Model (`sys_016`)
```
MARKET INTELLIGENCE PORTFOLIO
        ↓
INTELLIGENCE ENGINE
        ↓
PULSE ENGINE
        ↓
iAGENT NETWORK
        ↓
MISSION COMMAND CENTER
        ↓
SUNNi MISSION CONTROL (UI)
```

## 9. Architectural Principles (non-negotiable)
- Separation of concerns (`sys_017`): `Control ≠ Execution ≠ Intelligence ≠ UI ≠ Market Signals`
- Single source of truth (`sys_018`): all system definitions originate from this spec.
- No cross-layer overlap: Command Center doesn't execute · Pulse Engine doesn't decide · Agents don't operate outside Pulse Engine · UI doesn't define logic.

## 10. Summary (`sys_019`)
SEIS = layered AI operating system connecting market signals, intelligence processing,
execution engines, agent networks, and executive control into a unified real-time
decision and workflow orchestration platform.

## 11. Lock (`sys_020`)
Canonical v1 system contract. All implementations, UI, agent behaviors, workflows, and
integrations must conform without deviation unless explicitly versioned v2+.

## 12. Change Governance (`sys_022`)
Routine work flows automatically; high-impact changes require a deliberate decision —
mirroring the Mission Command Center principle (control ≠ execution).

| Change type | Approval |
|---|---|
| Documentation | Auto |
| UI styling | Auto |
| New features | Review |
| Architecture changes | Explicit approval required |
| Deployment (commit + push) | Explicit approval required |

---

## Implementation conformance notes (how the current app maps to this contract)
| Canonical layer | Current implementation |
|---|---|
| Mission Command Center | `MissionControl.tsx` (home), Executive Brief, Approve/Critical queues, PMO governance |
| Pulse Engine | n8n workflows, `ThePulse`/`TheFlow`, Execution Fabric, dispatch + execution feeds |
| iAgent Network | Agent Sandbox. Interfaces→implementations per §7.3: iCommander=HORHANiS, iCoordinator=TRiO, iExecution=TiTO, iIntegration=CiRO, iIntelligence=SunNi, iGuardian=GUARDiAN. |
| Intelligence Engine | PMO Trajectory/Forecast, Financial Sentinel, GUARDiAN risk, Report Center (planned) |
| Market Intelligence Portfolio | SSIE Social Analytics + Connector Adapter → Integration Inbox (see `/contracts` Enterprise Contract Registry) |

Data-classification (`sys_014`): Mission Control runs entirely on LIVE feeds and is badged `LIVE`.
Any panel backed by mock data must carry a `SIMULATED` badge.
