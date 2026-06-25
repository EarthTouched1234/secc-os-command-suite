# SECC OS — Public Architecture & System Context

> **Public-safe doc.** Architecture, doctrine, and system context for agents and collaborators.
> Secrets, API keys, credential IDs, raw webhook endpoints, and internal database IDs are **intentionally excluded** — they live only in the local `CLAUDE.md` and the secrets manager. Never add them here.

## What SECC OS is

**SECC OS is the enterprise operating system for AI-driven execution.**
It unifies governance, decision intelligence, and orchestration into a single platform, ensuring every automated action runs with **verifiable control**.

- **Headline:** Run your organization like an operating system.
- **Hero promise:** Govern AI safely (pre-execution gating) · Run complex workflows (deterministic engine) · Audit every execution (immutable ledger).
- Category: Enterprise Intelligence / operating system — the layer above PMO and BI, not either one.

## Architecture — the 8-layer altitude pyramid

Each layer is a capability of the same platform, sharing one governance substrate, decision intelligence, and audit ledger. Nothing operates outside the system.

**Strategic Tier · Visibility**
- 01 Executive — board & leadership oversight
- 02 Portfolio — cross-program alignment
- 03 Program — initiative tracking

**Operational Tier · Management**
- 04 Project — delivery & resourcing
- 05 Operational — day-to-day coordination

**Execution Tier · Action & Audit**
- 06 Decision — reasoning & simulation
- 07 Execution — **SEIS**, the deterministic execution engine
- 08 Outcome — verified results & **CIRO** feedback

**GUARDiAN — the governance substrate.** Cross-cutting fabric, *not* a layer: every layer runs on the same pre-execution gating, policy enforcement, and immutable audit ledger. The human keeps exclusive launch authority over financial, architectural, and security changes (the "Golden Rule"). Autonomy never means unaccountable.

## Core subsystems (conceptual)

- **SEIS** — deterministic execution layer (developer-facing). Validation enforced before execution; no silent failures; immutable audit ledger of every run.
- **GUARDiAN PMO Command** — enterprise governance engine: portfolio register, RAG scoring, gate snapshots, predictive trajectory (velocity + acceleration), financial sentinel, PMBOK® 8th gate mapping.
- **Command Suite** — Mission Control web app (React/Vite → GitHub Pages): dashboards, ChatBridge, PMO, GUARDiAN, Launch KPIs, and more.
- **Agent Sandbox** — multi-agent conversation engine with session memory and a governance/quality gate.
- **Revenue Engine** — lead intake → qualification → proposal → close → nurture pipeline.
- **Intelligence engines** — domain modules (e.g., leasing, social content, credit, beats/creative) following the same capture → classify → route → execute → track → report pattern.

## AI agent council

| Agent | Role |
|---|---|
| HORHANiS | Burden reduction & triage; risk |
| TRiO | Strategic operations & routing; analytics |
| TiTO | Content & writing; brand/marketing |
| CiRO | Technical builds & debugging; platform engineering |
| SunNi | 360° executive intelligence; Mission Control |
| GUARDiAN | Security, governance, validation |
| TRiAGE | Intake routing |

## Launch organization (operating model)

The council runs as a launch organization of **9 Launch Divisions**, each with a lead agent, a primary KPI, measurable deliverables, and a daily report to Mission Control:

Executive Strategy · Intelligence & Analytics · Brand Studio · Marketing Operations · Sales Operations · Digital Experience · Quality & Governance · Platform Engineering · Knowledge & Learning.

- **Operating Spine** — a daily Mission Control digest aggregates each division's status + KPI into one executive summary.
- **Launch KPI dashboard** — waitlist signups + funnel, site pageviews + conversion (first-party beacon), division execution rollup, portfolio RAG. Un-instrumented metrics are shown as explicitly un-wired, never faked.
- **Report format (10-point):** Objective · Findings · Recommendations · Risks · Priority · Business Impact · Executive Summary · Evidence · Confidence (0–100%) · Next Action.

## Operating doctrine

- **Truth gate (sacred):** never claim *fully autonomous execution across customer systems*. Deterministic workflow execution (SEIS) and governance/intelligence/reporting are shipped today; autonomous write-back into external enterprise systems is on the roadmap. Position honestly; demos match reality.
- **Language discipline:** "verifiable" not "absolute"; "audit every execution" not "every decision" (the Decision Layer is modeled, not yet production-wired).
- **Industry-agnostic:** Property Management is the live reference implementation — proof of capability, not the platform's identity. Target domains span Property, Construction, Healthcare, Manufacturing, Government, Finance, Technology.
- **Inverted economics:** a fixed roster of expert agents absorbs administrative load; scope scales up while cost scales down.
- **Redundancy mandate:** critical artifacts mirror across Notion (knowledge/ops), GitHub (code/docs), iCloud (Apple-ecosystem vault), and email — any one system can fail without stopping operations.

## Tech stack (non-sensitive)

n8n (workflow orchestration) · Notion (data + knowledge base) · React + Vite → GitHub Pages (Command Suite + landing) · Cloudflare Worker (API proxy) · Railway (browser-automation service) · latest Claude + OpenAI models.

- Command Suite: `https://earthtouched1234.github.io/secc-os-command-suite/`
- Landing: `https://earthtouched1234.github.io/secc-os-command-suite/seis-landing.html`

## Naming conventions

Always write **SECC OS** in public copy (`SECC-OS` only in code/IDs). Product/agent marks keep the intentional lowercase **i**: GUARDiAN, CiRO, TiTO, TRiO. Brand palette: Midnight black, Solar Gold accent, Trajectory Blue; type Sora / Inter / JetBrains Mono.
