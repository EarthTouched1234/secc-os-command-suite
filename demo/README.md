# GUARDiAN PMO Command — Client Demo Package

*Proof-of-concept on real seeded property data. Manual-export model — no live credentials, no fake "live" claims.*

## The one-line pitch

> **You're not buying a property tool. You're buying a management engine — and here it is running on property today.**

A governance layer (PMO) sits **above** the operational work. The property example is the
*worked proof*; the same engine adapts to any vertical that produces measurable execution data.

```
                ┌─────────────────────────────────────────────┐
                │   PMO GOVERNANCE LAYER  (universal)          │
                │   health · RAG · trajectory · risk · gates   │
                └─────────────────────────────────────────────┘
                        ▲                ▲                ▲
                ┌───────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐
                │  PROPERTY     │  │  ENERGY/SCADA│  │  CONSTRUCTION│
                │  (live demo)  │  │  (adaptable) │  │  (adaptable) │
                └──────────────┘  └─────────────┘  └─────────────┘
```

The thing that makes it enterprise-grade is **not** the dashboards — it's that every number
that reaches a report has passed a **governed pipeline**: quarantine → validation →
contract gate → promotion. Bad data cannot silently corrupt the system of record.

## What's in this package

| File | What it shows the client | Audience |
|------|--------------------------|----------|
| `01_DAR-sample-report.md` | A finished Daily Activity Report they'd recognize — real numbers | Property ops / regional manager |
| `02_governed-promotion.md` | How a raw export becomes a trusted record — the governance differentiator | Ops + IT / risk |
| `03_PMO-and-scale.md` | The portfolio view + how the same engine scales to other verticals | Executive / buyer |
| `04_demo-script.md` | A 10-minute click-through narrative | You, presenting |

## Data basis (honesty note for internal use)

All numbers come from the **seeded static dataset** in Notion (The Eddy at Riverview Landing,
Jun 4–17 2026; 13 prospects). This is a controlled proof-of-concept. The connector that would
pull this automatically from CRM IQ exists and is tested, but runs on **manual export** today —
a fresh session token automates it later. Nothing here is presented as live telemetry.
