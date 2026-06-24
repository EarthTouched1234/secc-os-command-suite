# n8n Blueprints

Source-of-truth JSON for the governed execution workflows. **Deployed + active** in n8n as of
2026-06-24 (created via API with the Notion credential attached).

## Deployed (active)

| File | Workflow | Live ID | Webhook |
|------|----------|---------|---------|
| `execution-fabric-property-v1.2.json` | Execution Fabric v1.2 (Property + Contract Gate + Audit) | `TAebEuqGJMRFmaTI` | `POST /webhook/secc-os/execution-fabric` |
| `inbox-promotion-pmo-v1.json` | Inbox Promotion (Validated → PMO) | `WNvJCSRbIcdgdJeN` | `POST /webhook/connector/promote` |
| `inbox-promotion-dar-v1.json` | Inbox Promotion (Validated → LIE DAR) | `UI9O6Xz6VmloJy8y` | `POST /webhook/connector/promote-dar` |

- Audit ledger: 🧾 Execution Fabric — Audit Log (`002cc2e2…`)
- Notion credential: account 31 (`UQMCFpPT6IB8emgh`, key `notionOAuth2Api`)
- Run / verify: `../demo/TIER1-RUNBOOK.md`

## Removed (2026-06-24)
`execution-fabric-property-v1.json` and `execution-fabric-property-v1.1.json` deleted — superseded
by v1.2 (which adds the contract validation gate). The retired live `v1` workflow
(`sR584Aa19e1GVV7t`) was also deleted from n8n.

**Deletion gate met:** v1.2 ran live end-to-end — the Audit Log holds `D-TEST-001` (success) and
`D-TEST-002` (REJECTED_CONTRACT_VIOLATION). v1.2 is now *proven*, not just built, so the older
versions are pure clutter.

**Copies preserved (3 places):**
- `/Users/sunni/n8n-backup-2026-06-24/retired-execution-fabric-v1/` (live export + both blueprints)
- git history
- tag `architecture-freeze-v1.0`
