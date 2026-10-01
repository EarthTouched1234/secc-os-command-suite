# Flight Deck — Buyer Demo Runbook

**Purpose:** one controlled path from the SECC OS platform story to a concrete, governed proof.  
**Target length:** 10–12 minutes.  
**Rule:** distinguish seeded/reference data, verified platform behavior, and roadmap capability at every step.

## 1. Open with the platform — 60 seconds

Open the SECC OS landing experience.

> SECC OS is an Enterprise Intelligence Platform. It turns operational signals into governed decisions, deterministic execution, verified outcomes, and executive visibility. Property is the reference implementation we're using to make that concrete today.

Do not begin with DAR, leasing, or a feature list. Establish the platform first.

## 2. Show Mission Control — 90 seconds

Show the executive view and explain the operating spine:

```text
Signal -> Intelligence -> Governance -> Execution -> Verification -> Executive visibility
```

Frame Mission Control as the place an executive sees health, trajectory, exceptions, execution state, and governed outcomes. Any illustrative UI metric must remain labeled or described as illustrative/simulated unless its source is verified live.

## 3. Drop into the Property proof — 2 minutes

Open `01_DAR-sample-report.md`. Explain that the dataset is a controlled proof on seeded historical property records, not live customer telemetry.

Show the recognizable operational result first: occupancy/leasing, traffic, work orders, and the resulting management signal. The point is not the property report itself; the point is that operational data can be transformed into a governed management artifact without manual status assembly.

## 4. Show why the result is trustworthy — 3 minutes

Open `02_governed-promotion.md`. Walk this exact boundary:

```text
Manual/authorized input
  -> Connector Adapter
  -> Normalizer
  -> Integration Inbox (quarantine)
  -> Contract Validator
  -> GUARDiAN policy gate
  -> UPDATE-only promotion
  -> PMO / DAR
  -> audit trail
```

Show both paths: a valid record that is promoted and a malformed record that is rejected and logged. Land the two rules: **enrich, never mint** and **one governed contract source of truth**.

## 5. Connect it to SEIS + CIRO — 90 seconds

Explain the execution proof without implying unrestricted external-system autonomy:

- **GUARDiAN** determines whether the request clears governance/policy gates.
- **SEIS** provides deterministic execution behavior: validate before execute; reject invalid requests; record outcomes.
- **CIRO** records runtime/system truth and closes the outcome-attribution loop.
- A successful internal/reference execution does not imply production authorization to mutate an external customer system.

## 6. Scale from one program to enterprise — 90 seconds

Open `03_PMO-and-scale.md`. Move from The Eddy as one governed program to the portfolio concept. Explain that domain configuration changes metrics, thresholds, and contracts; the governance/execution framework remains reusable.

Do not describe roadmap industry packs as deployed customer implementations.

## 7. Close — 60 seconds

> What you saw is the operating model: take an operational signal, govern it before it can affect a system of record, execute deterministically, verify the outcome, and expose the result to leadership. We start with a controlled reference implementation, then connect authorized enterprise systems behind the same gates.

CTA: **Book a Flight Deck discovery session** to map one existing workflow into the governed operating spine.

## Truth matrix

| Claim | Demo status | How to present it |
| --- | --- | --- |
| SECC OS platform experience | Deployed | Show directly |
| Property dataset | Seeded historical/reference records | Say so explicitly |
| DAR output | Demonstrable reference artifact | Show directly; do not call live telemetry |
| Integration Inbox + governed promotion | Implemented workflow/reference proof | Show gate behavior |
| SEIS contract validation/execution/audit pattern | Implemented | Demonstrate deterministic pass/reject behavior |
| GUARDiAN governance | Implemented governance layer | Describe specific gates/policies shown |
| CIRO state/outcome attribution | Implemented system component | Show recorded state/outcome evidence where available |
| External CRM/Yardi production write-back | Not currently authorized | Roadmap/customer deployment step |
| Other industry packs | Configurable/modelled roadmap | Do not imply deployed customer proof |

## Demo operator checklist

- [ ] Landing page loads from current deployment
- [ ] Mission Control view available
- [ ] `01_DAR-sample-report.md` ready
- [ ] `02_governed-promotion.md` ready
- [ ] `03_PMO-and-scale.md` ready
- [ ] Valid promotion proof/evidence available
- [ ] Rejection-path proof/evidence available
- [ ] No screen exposes credentials, tokens, PII, or private tenant/prospect data
- [ ] Every simulated/reference view is identified as such
- [ ] Demo CTA and lead intake path tested
- [ ] Do not perform an external production write during the demo unless separately authorized and the Production Readiness gate is satisfied

## Buyer questions

**Is this live customer telemetry?**  
No. This reference demo uses controlled seeded historical records. The platform and governed workflows are demonstrable; external customer-system write access is a separate authorized deployment step.

**What happens to bad data?**  
It lands in quarantine, fails validation or governance when appropriate, is not promoted, and leaves an auditable rejection trail.

**Can it work outside property?**  
The platform architecture is domain-neutral. New domains require their own governed metrics, thresholds, contracts, connectors, and validation before they should be represented as deployed.

**Does AI have unrestricted authority?**  
No. Governance gates and human launch authority remain part of the operating model for protected/high-impact actions.

---

**Demo sequence:** Platform -> Mission Control -> Property proof -> Governance -> SEIS/CIRO -> Enterprise scale -> Discovery CTA.