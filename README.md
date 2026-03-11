# HALO MCP Server

Connect any MCP-compatible AI tool to HALO's Agentic Banking OS.

## Compatible With
- Claude Desktop
- Claude Code
- Cursor
- Antigravity
- Any MCP client

## Install

### Claude Desktop
Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "halo": {
      "command": "npx",
      "args": ["-y", "github:Brokent00th/halo-mcp"],
      "env": { "HALO_API_KEY": "halo_sk_test_your_key" }
    }
  }
}
```

### Claude Code / Cursor
Add to MCP settings:
- Server: `github:Brokent00th/halo-mcp`
- Env: `HALO_API_KEY=halo_sk_test_your_key`

## Available Tools
| Tool | Description |
|------|-------------|
| halo_create_payment | Send USDC to any address |
| halo_check_balance | Check wallet balance |
| halo_list_mandates | View spending rules |
| halo_get_intent_status | Check payment status |
| halo_recent_transactions | View payment history |
| halo_emergency_freeze | Freeze all agents immediately |

## Setup
1. Create account: https://halo-dashboard.vercel.app
2. Create agent -> copy API key
3. Configure MCP client with key
4. Ask Claude: "Check my HALO balance"

## Links
- HALO Dashboard: https://halo-dashboard.vercel.app
- Quick Start: https://github.com/Brokent00th/halo-mvp/blob/main/docs/QUICKSTART.md
- API Reference: https://github.com/Brokent00th/halo-mvp/blob/main/docs/API-REFERENCE.md
