# SECC OS Command Suite

**Enterprise Intelligence Platform for governed decisions, deterministic execution, operational visibility, and auditable outcomes.**

SECC OS connects executive command, intelligence, governed automation, and outcome attribution into one operating environment. This repository contains the Command Suite UI, the SEIS execution kit, enterprise contracts, CIRO state tooling, connector/adaptor work, and supporting architecture and deployment documentation.

> **Truth boundary:** this repository includes proven governed workflows and reference implementations. Real-world external write access is environment- and authorization-dependent. Do not interpret a demo, simulated metric, or reference connector as authorization for production mutation.

## Start here

- **Live product experience:** `public/seis-landing.html`
- **Command Suite application:** `src/`
- **Canonical architecture:** `ARCHITECTURE.md`
- **Architecture decisions:** `DECISIONS.md`
- **Deployment model:** `DEPLOYMENT.md`
- **Production gate:** `PRODUCTION-READINESS-CHECKLIST.md`
- **SEIS install kit:** `seis/`
- **Enterprise contracts:** `contracts/`
- **n8n workflows:** `n8n/`
- **CIRO runtime/state:** `ciro/` and `memory/`

## Platform map

```text
Enterprise signals / connected systems
                |
                v
      Intelligence + decisioning
                |
                v
      GUARDiAN governance gates
                |
                v
   SEIS deterministic execution
                |
                v
      Verification + CIRO outcome
                |
                v
       Executive Mission Control
```

This is a navigation view, not a replacement for the locked architecture contract. When implementation or terminology differs across historical artifacts, the repository's governed architecture/contracts and recorded decisions are the authority.

## Core capabilities

| Capability | Purpose |
| --- | --- |
| Mission Control | Executive visibility across programs, operations, risk, and execution |
| Intelligence | KPI, trajectory, risk, forecast, and decision support |
| GUARDiAN | Governance, policy enforcement, validation, and safety gates |
| SEIS | Deterministic execution pipeline with verification and audit |
| CIRO | Runtime state, integration/outcome attribution, and system-truth recording |
| Integration Inbox | Quarantine and validation boundary before governed promotion |
| Enterprise PMO | Portfolio/program governance and operational reporting |
| Connector Adapter | Normalizes authorized external/manual inputs into governed contracts |

## SEIS execution kit

The deployable SEIS kit lives in `seis/`. Its verified pipeline is:

```text
Trigger -> Guardian Gate -> Contract Validator -> Execute OR Reject
                                              -> Verify -> CIRO Feedback -> Audit Ledger
```

The bundled property workflow is a **reference implementation**, not the identity of the platform. See `seis/README.md` and `seis/INSTALL.md` for installation and proof steps.

## Governance and contracts

The repository uses explicit contracts and registries to keep execution deterministic and auditable. Before modifying runtime behavior, review `ARCHITECTURE.md`, `DECISIONS.md`, `contracts/`, `seis/contracts/`, and `PRODUCTION-READINESS-CHECKLIST.md`.

Architecture changes require explicit approval. UI styling and documentation work must not silently redefine runtime behavior.

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run build
npm run lint
```

CIRO state tooling:

```bash
npm run ciro
```

## Repository guide

```text
.
├── src/                    Command Suite React application
├── public/                 Static product/landing assets
├── seis/                   Deployable SEIS installation kit
├── n8n/                    Governed workflow blueprints
├── contracts/              Enterprise contract registry
├── ciro/                   CIRO state/runtime tooling
├── memory/                 Generated/recorded system state
├── outputs/                Analysis and integration artifacts
├── ARCHITECTURE.md         Locked architecture contract
├── DECISIONS.md            Architecture decision record
├── DEPLOYMENT.md           Deployment architecture
└── PRODUCTION-READINESS-CHECKLIST.md
```

## Production boundary

A workflow being active or a UI being deployed does **not** by itself mean external enterprise writes are production-authorized. Production readiness is governed by `PRODUCTION-READINESS-CHECKLIST.md`, including security, audit, rollback, recovery, monitoring, idempotency, documentation, and executive approval.

## Status

The Command Suite and product experience are actively evolving under controlled change governance. Presentation work may improve how the platform is explained; it must not create a second architecture or overstate runtime capability.

---

**SECC OS** · Enterprise Intelligence Platform  
Governed intelligence. Deterministic execution. Verifiable outcomes.
