#!/usr/bin/env python3
"""
SEIS uninstaller — removes the SEIS workflows from n8n. Mirrors install.py.

Removes the n8n workflows SEIS created (matched by name). **Does NOT delete your Notion data** —
the Audit Ledger and Inbox hold your records; the script leaves them untouched and just tells you
their IDs so you can archive them by hand if you want a full teardown.

Config (env):
  SEIS_N8N_URL       e.g. https://yourco.app.n8n.cloud  (no trailing slash)
  SEIS_N8N_API_KEY   n8n public API key

Usage:
  python3 uninstall.py --dry-run     list what would be removed, change nothing
  python3 uninstall.py               deactivate + delete the SEIS workflows
"""
import os, sys, json, glob, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))

def cfg(k):
    v = os.environ.get(k)
    if not v: sys.exit(f"ERROR: missing required env var {k}")
    return v

def http(method, url, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data,
        headers={"X-N8N-API-KEY": key, "Content-Type": "application/json"}, method=method)
    try:
        r = urllib.request.urlopen(req, timeout=40)
        return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]

def seis_workflow_names():
    names = []
    for f in sorted(glob.glob(os.path.join(HERE, "workflows", "*.json"))):
        try: names.append(json.load(open(f))["name"])
        except Exception: pass
    return names

def main():
    dry = "--dry-run" in sys.argv
    base = cfg("SEIS_N8N_URL"); key = cfg("SEIS_N8N_API_KEY")
    targets = set(seis_workflow_names())
    if not targets:
        sys.exit("ERROR: no bundled workflows found in ./workflows — run from the seis/ directory.")

    print("SEIS uninstaller —", "DRY RUN (no changes)" if dry else "LIVE REMOVAL")
    print("  targeting workflows:")
    for n in sorted(targets): print("   -", n)

    code, resp = http("GET", f"{base}/api/v1/workflows?limit=250", key)
    if not isinstance(resp, dict):
        sys.exit(f"ERROR listing workflows: {code} {resp}")
    found = [w for w in resp.get("data", []) if w.get("name") in targets]
    if not found:
        print("\nNothing to remove — no matching SEIS workflows on this instance.")
        return

    print(f"\nMatched {len(found)} workflow(s):")
    for w in found:
        if dry:
            print(f"   would remove: {w['name']} ({w['id']}, active={w.get('active')})")
        else:
            http("POST", f"{base}/api/v1/workflows/{w['id']}/deactivate", key)
            dc, _ = http("DELETE", f"{base}/api/v1/workflows/{w['id']}", key)
            print(f"   removed: {w['name']} ({w['id']}) -> HTTP {dc}")

    print("\nNotion data is preserved. To fully tear down, archive these DBs by hand in Notion:")
    print("   - 🧾 Execution Fabric — Audit Ledger")
    print("   - 📥 Integration Inbox (Quarantine)")
    if dry:
        print("\nDry run OK — re-run without --dry-run to remove.")

if __name__ == "__main__":
    main()
