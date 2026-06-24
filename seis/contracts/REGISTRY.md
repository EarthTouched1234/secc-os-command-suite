# Enterprise Contract Registry — v2.0 (FROZEN)

The platform constitution. Contracts are **first-class data**, not implied by code.
Every component reads from here rather than defining its own view of the world.

```
/contracts
├── domain-registry.json      — immutable domain IDs (10)            [frozen]
├── metric-registry.json      — canonical metric keys ↔ labels       [frozen]
├── threshold-registry.json   — business rules: health + risk + trend [frozen] · SINGLE SOURCE OF TRUTH
├── observation-contract-v2.json — what a connector may emit          [frozen]
├── connector-contract-v2.json   — registry entry + adapter interface [frozen]
├── decision-contract-v2.json    — signal envelope → Decision Layer   [frozen]
└── outcome-contract-v2.json     — what Outcome Attribution needs     [frozen]
```

## Who reads what

| Component | Reads |
|---|---|
| **Connector Registry / Adapters** | connector-contract, observation-contract, metric-registry (emit compliant observations) |
| **Normalizer** | threshold-registry, domain-registry, metric-registry (score; no hard-coded rules) |
| **Decision Layer** | decision-contract, domain-registry |
| **Execution Fabric** | connector-contract, domain-registry (route) |
| **Outcome Attribution** | outcome-contract, metric-registry (verify, before/after via entity_key) |
| **CIRO** | all (validate state against contracts) |
| **Future AI agents** | all (generate + validate against the same constitution) |

## Freeze policy (v2.0)

Frozen 2026-06-22. Changes require a **version bump** (v2.1 / v3.0) + a migration note —
no silent edits. The promotion workflow is built against frozen v2.0 only.

## P0 closure (this version)

- **Threshold source of truth** → `threshold-registry.json`. Normalizer reads it; no hard-coded numbers. Property reconciled to domains.ts (`occupancy < 92` = red).
- **Canonical metric keys** → `metric-registry.json`. Connectors map source fields → canonical keys via aliases.
- **Domain IDs standardized** → `domain-registry.json`. `id` is the immutable join key everywhere; `name` is display only. (The old ad-hoc "construction" profile is now the platform ID `built`.)

## Intended home

These live in the Codex working tree today. The constitution should be promoted into the
platform repo (`commander-console`) so the TypeScript layers import the same JSON — at which
point `src/platform/domains.ts` riskTriggers derive FROM `threshold-registry.json`, inverting
today's transcription.
