# n8n Blueprints

Importable workflow JSON. These are **artifacts, not running workflows** — none is active
until imported into n8n and given credentials. Import: n8n → Import from File → attach the
Notion credential in the UI (Bug 26: cross-project creds can't attach via API).

## Current

| File | Workflow | Webhook |
|------|----------|---------|
| `execution-fabric-property-v1.2.json` | Execution Fabric v1.2 (Property + Contract Gate + Audit) | `POST /webhook/secc-os/execution-fabric` |
| `inbox-promotion-pmo-v1.json` | Inbox Promotion (Validated → PMO) | `POST /webhook/connector/promote` |
| `inbox-promotion-dar-v1.json` | Inbox Promotion (Validated → LIE DAR) | `POST /webhook/connector/promote-dar` |

## Superseded (kept intentionally — see policy)

| File | Superseded by | Difference |
|------|---------------|-----------|
| `execution-fabric-property-v1.json` | v1.2 | no audit, no contract gate |
| `execution-fabric-property-v1.1.json` | v1.2 | added Notion audit; **no contract gate** |

## Deletion policy (decision, 2026-06-24)

**Keep `v1` / `v1.1` until `v1.2` has ONE clean end-to-end run in the n8n DEV project**
(import → attach credential → fire one decision → see it gate, execute, write the audit row).

Rationale: v1.2 is a functional superset, but **no version has run live yet** — so v1.2 is
well-built, not yet *proven*. Until it runs once, v1.1 (no contract gate) is a zero-effort
fallback to isolate whether the gate is the culprit if v1.2 misbehaves on first import. Git
history preserves all versions regardless, so deletion is reversible.

**Gate for deletion = a fact ("v1.2 ran live once"), not a feeling.** Once true, delete
v1 + v1.1 — they become pure clutter.
