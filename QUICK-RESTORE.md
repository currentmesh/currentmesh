# Quick Restoration Guide

**For New Agent**: Follow this guide to restore CurrentMesh on a new droplet.

---

## ⚠️ GitHub Alone is NOT Enough

You need:
1. ✅ GitHub access (code)
2. ✅ This guide (setup steps)
3. ✅ Environment variables (secrets - see `.ai/ENVIRONMENT-VARIABLES-TEMPLATE.md`)
4. ✅ Database credentials
5. ✅ API keys

---

## Quick Steps

1. **Clone repo**: `git clone https://github.com/currentmesh/currentmesh.git`
2. **Install dependencies**: See `.ai/AGENT-HANDOFF-GUIDE.md`
3. **Configure environment**: Copy from `.ai/ENVIRONMENT-VARIABLES-TEMPLATE.md`
4. **Setup MCP servers**: Configure `~/.cursor/mcp.json`
5. **Setup Nginx**: Run `./scripts/nginx-setup-http.sh`
6. **Start services**: Use PM2 or npm scripts

---

## Full Guide

See `.ai/AGENT-HANDOFF-GUIDE.md` for complete restoration instructions.

---

**This guide + GitHub + Environment variables = Complete restoration** ✅
