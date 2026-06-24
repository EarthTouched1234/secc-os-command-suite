#!/usr/bin/env python3
"""
SEIS scripted installer.

Provisions SEIS on a fresh n8n + Notion:
  1. creates the Notion databases (Audit Ledger + Integration Inbox)
  2. patches the bundled workflows (swap DB IDs, attach your Notion credential)
  3. creates + activates them via the n8n API
  4. verifies by firing a valid + an invalid decision and checking the ledger

Pure stdlib. No dependencies.

Config via environment variables (see install.config.example):
  SEIS_N8N_URL            e.g. https://yourco.app.n8n.cloud   (no trailing slash)
  SEIS_N8N_API_KEY        n8n public API key
  SEIS_NOTION_TOKEN       Notion integration token (Bearer)
  SEIS_NOTION_PARENT      Notion parent PAGE id (where the DBs are created)
  SEIS_N8N_NOTION_CRED_ID id of the n8n Notion (OAuth2) credential to attach
  SEIS_N8N_NOTION_CRED_NAME (optional) credential display name [default: "Notion"]
  SEIS_PMO_DB             (optional) promotion target: portfolio/PMO database id
  SEIS_DAR_DB             (optional) promotion target: reporting/DAR database id

Usage:
  python3 install.py --dry-run     validate + show the plan, mutate nothing
  python3 install.py               full install
  python3 install.py --verify-only <webhook_base>   re-run the verify test only
"""
import os, sys, json, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
WF = os.path.join(HERE, "workflows")
NOTION_VER = "2022-06-28"

# DB ids hardcoded in the bundled workflows -> logical slot. Both dashed/undashed handled.
AUDIT_IDS = ["002cc2e2-7033-4abd-9797-0af99d8c2cec", "002cc2e270334abd97970af99d8c2cec"]
INBOX_IDS = ["07a654a3826b4678b64076138283993a", "07a654a3-826b-4678-b640-76138283993a"]
PMO_IDS   = ["3716457b-e0ff-4900-af01-1236c517f9f4", "3716457be0ff4900af011236c517f9f4"]
DAR_IDS   = ["2f0e31250bc746dd8f584aafc7cdcb78", "2f0e3125-0bc7-46dd-8f58-4aafc7cdcb78"]

def cfg(k, required=True, default=None):
    v = os.environ.get(k, default)
    if required and not v:
        sys.exit(f"ERROR: missing required env var {k}  (see install.config.example)")
    return v

def http(method, url, headers, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req, timeout=45)
        return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:400]

def sel(*names): return {"options": [{"name": n} for n in names]}

AUDIT_SCHEMA = {
    "Name": {"title": {}},
    "Decision ID": {"rich_text": {}},
    "Domain": {"select": sel("Property")},
    "Execution Status": {"select": sel("success","partial","failed","blocked","rejected","verified")},
    "GUARDiAN Status": {"select": sel("approved","rejected","requires_review")},
    "Risk Score": {"number": {}},
    "Systems Updated": {"rich_text": {}},
    "Actions": {"rich_text": {}},
    "Execution Hash": {"rich_text": {}},
    "Receipt JSON": {"rich_text": {}},
    "Environment": {"select": sel("DEV","TRAINING","PROD")},
    "Timestamp": {"date": {}},
}
INBOX_SCHEMA = {
    "Name": {"title": {}},
    "Source System": {"select": sel("crmiq","yardi","manual")},
    "Entity Type": {"select": sel("portfolio","property_unit","workorder","project","asset","unknown")},
    "Program": {"rich_text": {}},
    "Property Code": {"rich_text": {}},
    "Captured At": {"date": {}},
    "Record Lifecycle": {"select": sel("Received","Validated","Duplicate","Rejected","Promoted","Archived")},
    "Risk Level": {"select": sel("green","yellow","red","unknown")},
    "Health Score": {"number": {}},
    "Trajectory": {"select": sel("improving","stable","declining","unknown")},
    "Entity Key": {"rich_text": {}},
    "Dedupe Key": {"rich_text": {}},
    "Promoted To": {"multi_select": sel("PMO","DAR","LIE","Analytics","Decision History")},
    "Payload JSON": {"rich_text": {}},
    "Notes": {"rich_text": {}},
}

def create_notion_db(token, parent, title, schema):
    code, resp = http("POST", "https://api.notion.com/v1/databases",
        {"Authorization": f"Bearer {token}", "Notion-Version": NOTION_VER,
         "Content-Type": "application/json"},
        {"parent": {"type": "page_id", "page_id": parent},
         "title": [{"type": "text", "text": {"content": title}}],
         "properties": schema})
    if code != 200 or not isinstance(resp, dict):
        sys.exit(f"ERROR creating Notion DB '{title}': {code} {resp}")
    return resp["id"]

def patch_workflow(path, subs, cred_id, cred_name):
    raw = open(path).read()
    for olds, new in subs:
        if new:
            for o in olds:
                raw = raw.replace(o, new)
    wf = json.loads(raw)
    n_cred = 0
    for node in wf["nodes"]:
        if node["type"] == "n8n-nodes-base.notion":
            node["credentials"] = {"notionOAuth2Api": {"id": cred_id, "name": cred_name}}
            n_cred += 1
    return wf, n_cred

def n8n(method, base, key, path, body=None):
    return http(method, f"{base}/api/v1{path}",
        {"X-N8N-API-KEY": key, "Content-Type": "application/json"}, body)

def create_and_activate(base, key, wf):
    body = {"name": wf["name"], "nodes": wf["nodes"], "connections": wf["connections"],
            "settings": wf.get("settings", {"executionOrder": "v1"})}
    code, resp = n8n("POST", base, key, "/workflows", body)
    if not isinstance(resp, dict) or not resp.get("id"):
        return None, f"{code} {resp}"
    wid = resp["id"]
    n8n("POST", base, key, f"/workflows/{wid}/activate")
    return wid, "active"

def verify(webhook_base, token, audit_id):
    valid = {"decision_id":"SEIS-INSTALL-OK","entity_key":"install|x|portfolio","domain":"property",
             "metric":"occupied_pct","value":95.0,"confidence":0.9,
             "recommended_action":"install verification","routing":{"systems":["Install"]}}
    bad = {"decision_id":"SEIS-INSTALL-REJ","domain":"property","metric":"Occupancy %",
           "confidence":1.7,"recommended_action":"x","routing":{"systems":["Install"]}}
    out = {}
    for label, payload in (("valid", valid), ("invalid", bad)):
        c, r = http("POST", f"{webhook_base}/webhook/secc-os/execution-fabric",
                    {"Content-Type": "application/json"}, payload)
        out[label] = r if isinstance(r, dict) else str(r)[:160]
        time.sleep(2)
    # check ledger
    c, r = http("POST", f"https://api.notion.com/v1/databases/{audit_id}/query",
        {"Authorization": f"Bearer {token}", "Notion-Version": NOTION_VER, "Content-Type":"application/json"},
        {"filter": {"property": "Decision ID", "rich_text": {"contains": "SEIS-INSTALL"}}})
    rows = len(r.get("results", [])) if isinstance(r, dict) else 0
    return out, rows

def main():
    dry = "--dry-run" in sys.argv
    if "--verify-only" in sys.argv:
        i = sys.argv.index("--verify-only")
        wb = sys.argv[i+1]
        token = cfg("SEIS_NOTION_TOKEN"); audit = cfg("SEIS_AUDIT_DB")
        res, rows = verify(wb, token, audit)
        print(json.dumps(res, indent=2)); print(f"ledger rows (SEIS-INSTALL*): {rows} (expect 2)")
        return

    n8n_url = cfg("SEIS_N8N_URL"); n8n_key = cfg("SEIS_N8N_API_KEY")
    token = cfg("SEIS_NOTION_TOKEN"); parent = cfg("SEIS_NOTION_PARENT")
    cred_id = cfg("SEIS_N8N_NOTION_CRED_ID"); cred_name = cfg("SEIS_N8N_NOTION_CRED_NAME", False, "Notion")
    pmo_db = cfg("SEIS_PMO_DB", False); dar_db = cfg("SEIS_DAR_DB", False)

    print("SEIS installer —", "DRY RUN (no changes)" if dry else "LIVE INSTALL")
    print(f"  n8n: {n8n_url}\n  notion parent: {parent}\n  cred: {cred_name} ({cred_id})")
    print(f"  promotion targets: PMO={pmo_db or 'NOT SET'} DAR={dar_db or 'NOT SET'}")

    if dry:
        # validate workflows load + patch without mutating
        for f in ("execution-fabric-property-v1.2.json","inbox-promotion-pmo-v1.json","inbox-promotion-dar-v1.json"):
            wf, nc = patch_workflow(os.path.join(WF, f),
                [(AUDIT_IDS,"DRY_AUDIT"),(INBOX_IDS,"DRY_INBOX"),(PMO_IDS,pmo_db),(DAR_IDS,dar_db)],
                cred_id, cred_name)
            print(f"  ✓ {wf['name']}: {len(wf['nodes'])} nodes, cred attached to {nc} Notion node(s)")
        print("\nPlan: create 2 Notion DBs (Audit Ledger, Inbox) + create/activate 3 workflows + verify.")
        print("Promotion workflows activate only if PMO/DAR targets are set.")
        print("Dry run OK — set the env vars and re-run without --dry-run.")
        return

    # 1. Notion DBs
    audit = create_notion_db(token, parent, "🧾 Execution Fabric — Audit Ledger", AUDIT_SCHEMA)
    inbox = create_notion_db(token, parent, "📥 Integration Inbox (Quarantine)", INBOX_SCHEMA)
    print(f"  created Audit Ledger: {audit}\n  created Inbox: {inbox}")

    # 2-3. execution fabric (core)
    wf, _ = patch_workflow(os.path.join(WF,"execution-fabric-property-v1.2.json"),
        [(AUDIT_IDS, audit)], cred_id, cred_name)
    wid, st = create_and_activate(n8n_url, n8n_key, wf)
    print(f"  Execution Fabric: {wid} ({st})")

    # promotion workflows (need targets to activate)
    for f, tgt in (("inbox-promotion-pmo-v1.json", pmo_db), ("inbox-promotion-dar-v1.json", dar_db)):
        wf, _ = patch_workflow(os.path.join(WF, f),
            [(INBOX_IDS, inbox), (PMO_IDS, pmo_db), (DAR_IDS, dar_db)], cred_id, cred_name)
        body = {"name": wf["name"], "nodes": wf["nodes"], "connections": wf["connections"],
                "settings": wf.get("settings", {"executionOrder":"v1"})}
        code, resp = n8n("POST", n8n_url, n8n_key, "/workflows", body)
        wid = resp.get("id") if isinstance(resp, dict) else None
        if wid and tgt:
            n8n("POST", n8n_url, n8n_key, f"/workflows/{wid}/activate"); state="active"
        else:
            state = "created INACTIVE (set promotion target + activate in UI)"
        print(f"  {wf['name']}: {wid} ({state})")

    # 4. verify
    print("  verifying (firing valid + invalid decision)…")
    res, rows = verify(n8n_url, token, audit)
    ok = res.get("valid",{}).get("status")=="verified" and "REJECTED" in str(res.get("invalid",{}).get("status",""))
    print(f"  valid -> {res.get('valid',{}).get('status')}; invalid -> {res.get('invalid',{}).get('status')}")
    print(f"  ledger rows: {rows} (expect 2)")
    print("\n✅ SEIS installed and verified." if (ok and rows>=2) else "\n⚠️ Installed; verify output above — check ledger.")
    print(f"   Save this for --verify-only:  export SEIS_AUDIT_DB={audit}")

if __name__ == "__main__":
    main()
