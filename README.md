# @halo/mcp-server

Give your AI agent the ability to make payments.

`@halo/mcp-server` is an MCP (Model Context Protocol) server that exposes HALO payment tools to any MCP-compatible AI agent. Once configured, the agent can discover tools automatically and use them to create payment intents, inspect balances, review mandates, check payment status, inspect recent transactions, and trigger the HALO kill switch.

## Quick Start

### Claude Desktop

Update `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "halo-payments": {
      "command": "npx",
      "args": ["@halo/mcp-server"],
      "env": {
        "HALO_API_KEY": "your_halo_api_key"
      }
    }
  }
}
```

### Claude Code

Update `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "halo-payments": {
      "command": "npx",
      "args": ["@halo/mcp-server"],
      "env": {
        "HALO_API_KEY": "your_halo_api_key"
      }
    }
  }
}
```

## Usage Example

Example flow:

1. User: "Pay 5 USDC to `0xabc...` for API credits."
2. Agent calls `halo_create_payment`.
3. HALO evaluates mandates and FIRE fraud scoring.
4. If the payment is above an approval threshold, HALO returns `pending_approval`.
5. User approves the payment in the Nexus mobile app.
6. Agent calls `halo_get_intent_status` until the payment is settled.

## Tools

| Tool | Description |
| --- | --- |
| `halo_create_payment` | Create a HALO payment intent with mandate and fraud controls applied. |
| `halo_check_balance` | Check wallet balance, available funds, and locked funds. |
| `halo_list_mandates` | List the spending rules governing payments. |
| `halo_get_intent_status` | Inspect the status and settlement details of a payment intent. |
| `halo_recent_transactions` | View recent payment transactions and settlement hashes. |
| `halo_emergency_freeze` | Trigger the HALO emergency kill switch to freeze activity. |

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `HALO_API_KEY` | Yes | None | Bearer token used to authenticate every HALO API request. |
| `HALO_BASE_URL` | No | `https://halo-backend-production-cac9.up.railway.app` | Override the HALO backend base URL. |

## Architecture

```text
+--------+      +-----+      +-----------------+      +-------+      +-----------------------------------+
| Agent  | ---> | MCP | ---> | HALO MCP Server | ---> | HTTPS | ---> | HALO Backend                      |
+--------+      +-----+      +-----------------+      +-------+      | Mandates / FIRE / Approval / CDP |
                                                                      +-----------------------------------+
```

## Development

```bash
git clone https://github.com/Brokent00th/halo-mcp.git
cd halo-mcp
npm install
HALO_API_KEY=your_halo_api_key npm run dev
```

## License

MIT
