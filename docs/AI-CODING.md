# AI coding on this repo with Headroom

[Headroom](https://github.com/headroomlabs-ai/headroom) (Apache-2.0) compresses what an AI coding
agent reads (tool output, logs, file listings, search results) before it is sent to the model.
It runs **on your machine**; nothing is sent anywhere to be compressed. It is a development tool only:
it is not part of the website, the CRM or the Vercel/Hostinger build.

Measured on this repo (file listing + ESLint JSON output as tool results, headroom 0.41.0):
**7,597 → 2,728 tokens (64% fewer)**. Plain chat messages and source you paste are left as they are.

## 1. Install (once per machine)

Needs Python 3.10+. The `headroom` command ships only in the Python package (the npm package
`headroom-ai` is a library and has no CLI).

```bash
# recommended: isolated install with uv  (https://docs.astral.sh/uv/)
uv tool install --python 3.13 "headroom-ai[all]"

# or with pip
pip install "headroom-ai[all]"

headroom --version
```

Turn off the anonymous usage beacon (it is on by default):

```bash
# macOS / Linux: add to ~/.zshrc or ~/.bashrc
export HEADROOM_BEACON=off
# Windows PowerShell (persists for your user)
setx HEADROOM_BEACON off
```

`headroom telemetry` shows its state; `headroom telemetry --show` prints exactly what it would send.

## 2. Use it

### Claude Code: compress everything (recommended)

```bash
npm run ai:claude        # same as: headroom wrap claude
```

This starts a local Headroom proxy on port 8787 and launches Claude Code routed through it, so every
request is compressed automatically. It also registers [Serena](https://github.com/oraios/serena)
(semantic code navigation) for this project only. Undo with `headroom unwrap claude`.

### Claude Code / Cursor: tools only

The repo already contains the MCP config, so once `headroom` is installed:

- **Claude Code** reads `.mcp.json` and asks you to approve the `headroom` server the first time.
- **Cursor** reads `.cursor/mcp.json` (Settings → MCP shows it).

The agent then has `headroom_compress`, `headroom_retrieve` and `headroom_stats` and calls them when
it is about to read something large. If `headroom` isn't installed, the server simply shows as
failed; nothing else is affected.

### Other agents

`headroom wrap codex | aider | cursor | cline | continue | …` (see `headroom wrap --help`).

## 3. Check it is working

```bash
npm run ai:doctor        # headroom doctor: proxy + routing health check
npm run ai:savings       # headroom savings: tokens saved over time
headroom dashboard       # live savings in the browser (proxy must be running)
```

## 4. Learn from mistakes (optional)

```bash
headroom learn           # dry run: what went wrong in past agent sessions here
headroom learn --apply   # writes corrections to CLAUDE.local.md (gitignored)
```

## Notes

- Originals are kept locally (`~/.headroom/`) and the agent can fetch the full text with
  `headroom_retrieve`, so compression is reversible.
- Never paste production secrets (DATABASE_URL, AUTH_SECRET, API keys) into an agent session,
  compressed or not.
- Remove everything: `headroom unwrap claude`, delete `.mcp.json` / `.cursor/mcp.json`, and
  `uv tool uninstall headroom-ai` (or `pip uninstall headroom-ai`).
