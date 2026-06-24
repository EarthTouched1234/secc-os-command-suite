# SEIS — Notion Schema

Two databases. Create them in your Notion workspace, share each with your n8n Notion
integration, and put their IDs into the workflow nodes (see `INSTALL.md`).

## 1. 🧾 Execution Fabric — Audit Ledger
The immutable system of record. One row per execution (success *or* rejection *or* block).

| Property | Type | Notes |
|----------|------|-------|
| Name | title | `{decision_id} · {status} · {timestamp}` |
| Decision ID | text | the decision's id |
| Domain | select | e.g. `Property` |
| Execution Status | select | `success` `partial` `failed` `blocked` `rejected` `verified` |
| GUARDiAN Status | select | `approved` `rejected` `requires_review` |
| Risk Score | number | 0–1 |
| Systems Updated | text | systems touched, or violation list on reject |
| Actions | text | JSON of executed actions (≤2000 chars) |
| Execution Hash | text | idempotency hash |
| Receipt JSON | text | full receipt (≤2000 chars) |
| Environment | select | `DEV` `TRAINING` `PROD` |
| Timestamp | date | ISO-8601 |

**Ledger rule:** append-only. Never update or delete rows — query-verified rows are system truth.

## 2. 📥 Integration Inbox (Quarantine)
Where inbound records land *before* promotion. Only `Validated` rows are promotable.

| Property | Type | Notes |
|----------|------|-------|
| Name | title | record label |
| Source System | select | `crmiq` `yardi` `manual` |
| Entity Type | select | `portfolio` `property_unit` `workorder` … (your domain's types) |
| Program | text | maps to a portfolio program name |
| Property Code | text | entity code |
| Captured At | date | observation date |
| Record Lifecycle | select | `Received` `Validated` `Duplicate` `Rejected` `Promoted` `Archived` |
| Risk Level | select | `green` `yellow` `red` `unknown` |
| Health Score | number | 0–100 |
| Trajectory | select | `improving` `stable` `declining` `unknown` |
| Entity Key | text | date-independent join key |
| Dedupe Key | text | idempotency (entity + date) |
| Promoted To | multi_select | `PMO` `DAR` `LIE` … (set by the promotion step) |
| Payload JSON | text | normalized signal envelope |
| Notes | text | free text |

**Promotion targets** (the DBs the promotion workflows write *into* — yours will vary):
the PMO workflow updates a **Portfolio Register** (program health/RAG); the DAR workflow enriches
a **reporting DB**. Point those node `databaseId`s at your own tables.

> Gotcha (Bug 34): n8n returns Notion **date** properties as objects, not strings. The bundled
> workflows already handle this with a date extractor — preserve it if you edit the code nodes.
