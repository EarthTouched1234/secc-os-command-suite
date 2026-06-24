# How a Raw Export Becomes a Trusted Record

*The governance differentiator. This is what separates GUARDiAN PMO Command from a dashboard.*

A spreadsheet can show numbers. The hard part of enterprise software is **proving the numbers
are trustworthy** — that a bad export, a duplicate, or a malformed row can never quietly poison
the system of record. That's what this pipeline does. Nothing reaches a production report
until it has passed every gate.

```
   CRM IQ export (manual)
        │
        ▼
   ┌──────────────────┐
   │ CONNECTOR ADAPTER │  reads an allow-list of aggregate fields only.
   │                   │  Tenant/prospect PII is dropped, never forwarded.
   └──────────────────┘
        │  adapter-neutral observation
        ▼
   ┌──────────────────┐
   │   NORMALIZER      │  maps source fields → canonical metric keys
   │                   │  (OccPct → occupied_pct). Scores health/risk/trend
   │                   │  from the FROZEN threshold registry — no guesses.
   └──────────────────┘
        │  decision-contract record
        ▼
   ┌──────────────────────────────┐
   │  INTEGRATION INBOX (QUARANTINE)│  every record lands here FIRST, flagged.
   │  Received·Validated·Duplicate  │  Production is never written directly.
   │  ·Rejected·Promoted·Archived   │
   └──────────────────────────────┘
        │  only "Validated" rows are eligible
        ▼
   ┌──────────────────┐
   │ CONTRACT VALIDATOR│  hard gate. A record missing its identity key, using a
   │  (frozen v2.0)    │  non-canonical metric name, or an out-of-range value is
   │                   │  REJECTED before promotion — and still audited.
   └──────────────────┘
        │  passes
        ▼
   ┌──────────────────┐      ┌────────────────────┐
   │  GUARDiAN GATE    │ ───▶ │ PROMOTION (enrich)  │ ──▶ PMO + DAR (system of record)
   │  policy / safety  │      │ UPDATE-only,         │
   │  human authority  │      │ never mints records  │
   └──────────────────┘      └────────────────────┘
```

---

## Worked example — one real record, walked through the gates

**Input:** a Jun 17 box-score line for The Eddy — `occupied_pct 95.8, leased_pct 94.2,
workorders_overdue 5`.

| Gate | Check | Result |
|------|-------|--------|
| Connector | PII fields present? | Dropped — only aggregate metrics forwarded ✅ |
| Normalizer | `OccPct` → canonical `occupied_pct`; score vs threshold registry | 95.8 > 92 → **Green**, trend **improving** ✅ |
| Inbox | Lands in quarantine, lifecycle = **Validated** | Not yet in production ✅ |
| **Contract Validator** | identity key present? metric canonical? value in range? | All pass → `contract_valid` ✅ |
| GUARDiAN | policy / safety / human-authority check | Approved (read-only enrichment, no money/identity change) ✅ |
| Promotion | match existing DAR for Property+Date → **enrich** | DAR updated; Inbox row flipped to **Promoted** ✅ |

**Now show the client the *rejection* path — this is the moment it clicks:**

A malformed record (`domain` written as the display name, metric named `Occupancy %` instead of
the canonical key, missing identity key, confidence `1.7`) hits the same gate and is **stopped**:

```
status: REJECTED_CONTRACT_VIOLATION   (never reached the report)
violations:
  - missing_field:entity_key
  - domain_must_be_id_not_name:'Property, Facilities & Asset Operations' -> 'property'
  - metric_not_canonical:'Occupancy %' -> 'occupied_pct'
  - confidence_out_of_range:'1.7'
```

> It didn't crash. It didn't corrupt the DAR. It **refused, explained why, and logged it.**
> That is the difference between a tool and a governed system.

---

## The two safety rules behind it

1. **Enrich, never mint.** Promotion only *updates* a record that already exists (a program in
   the portfolio, the day's DAR). A data feed can never invent a program or fabricate a report.
   No match → the row waits for a human.
2. **One source of truth.** All thresholds, metric names, and domain IDs live in a **frozen
   contract registry (v2.0)**. Every layer reads from it. There is no second place for a number
   to drift.
