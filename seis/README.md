# SEIS — Deterministic Execution Layer for n8n

*A module of GUARDiAN OS. This directory is the deployable install kit.*

SEIS wraps your n8n workflows in a **governed execution pipeline**: every request passes two
hard gates before it can act, and **every outcome — success or rejection — is written to an
immutable audit ledger.** No silent failures, no ungoverned execution.

## What SEIS is (and isn't)
- **It is:** the governance wrapper — Guardian Gate (risk) → Contract Validator (structure) →
  Execute → Verify → Feedback → Audit. Proven live: a valid decision executes + audits; an
  invalid one is hard-stopped at the contract gate and *still* audited.
- **It is not:** your business logic. The `Execute` node is a **placeholder you wire to your own
  systems** (CRM, DB, API, email…). SEIS governs *whether* and *records that* it ran — you decide
  *what* runs. That's why SEIS installs without any external-system access of its own.

## The verified pipeline
```
Trigger → Guardian Gate → Contract Validator → Execute OR Reject
                                                   ↓
                              Verify → CIRO Feedback → Audit Ledger (always written)
```

## What's in the box
```
seis/
├── README.md            ← you are here
├── install.py           ← scripted installer (provisions DBs, imports, activates, verifies)
├── uninstall.py         ← clean removal (deletes the SEIS workflows; preserves your Notion data)
├── install.config.example ← copy → fill in your n8n + Notion details
├── INSTALL.md           ← scripted + manual setup on a fresh n8n + Notion
├── notion-schema.md     ← the Notion databases to create (Audit Ledger, Integration Inbox)
├── workflows/           ← 3 import-ready n8n workflows
│   ├── execution-fabric-property-v1.2.json   (the governed execution pipeline)
│   ├── inbox-promotion-pmo-v1.json           (governed promotion → portfolio/PMO)
│   └── inbox-promotion-dar-v1.json           (governed promotion → reporting/DAR)
└── contracts/           ← the frozen Enterprise Contract Registry v2.0 (the "constitution")
    ├── REGISTRY.md
    ├── domain-registry.json · metric-registry.json · threshold-registry.json
    └── decision/observation/connector/outcome-contract-v2.json
```

## Customize for your domain
The bundled execution fabric ships configured for the **property** domain as a worked example.
To adapt: edit the inlined contract snapshot in the `Contract Validator` node (or point it at
your own `contracts/`), and replace the `Execute Property Actions` node with your real actions.
Everything else — the gates, verification, audit — is domain-neutral.

## Proven, not theoretical
This kit is the exact set that ran end-to-end on a live n8n + Notion instance: valid execution
receipt + contract-rejection receipt both written to the ledger. See `INSTALL.md` step 5 to
reproduce the proof on your own instance.
