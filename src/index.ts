#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { HaloClient } from "./halo-client.js";
import { checkBalanceTool } from "./tools/check-balance.js";
import { createPaymentTool } from "./tools/create-payment.js";
import { emergencyFreezeTool } from "./tools/emergency-freeze.js";
import { getIntentStatusTool } from "./tools/get-intent-status.js";
import { listMandatesTool } from "./tools/list-mandates.js";
import { recentTransactionsTool } from "./tools/recent-transactions.js";

async function main() {
  let client: HaloClient;

  try {
    client = new HaloClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown initialization error";
    console.error(`Failed to initialize HALO MCP Server: ${message}`);
    console.error("Set HALO_API_KEY in the environment before starting the server.");
    process.exit(1);
    return;
  }

  const server = new McpServer({
    name: "halo-payments",
    version: "0.1.0"
  });

  server.tool(
    createPaymentTool.name,
    createPaymentTool.description,
    createPaymentTool.parameters.shape,
    async (params) => createPaymentTool.handler(params, client)
  );

  server.tool(
    checkBalanceTool.name,
    checkBalanceTool.description,
    checkBalanceTool.parameters.shape,
    async (params) => checkBalanceTool.handler(params, client)
  );

  server.tool(
    listMandatesTool.name,
    listMandatesTool.description,
    listMandatesTool.parameters.shape,
    async (params) => listMandatesTool.handler(params, client)
  );

  server.tool(
    getIntentStatusTool.name,
    getIntentStatusTool.description,
    getIntentStatusTool.parameters.shape,
    async (params) => getIntentStatusTool.handler(params, client)
  );

  server.tool(
    recentTransactionsTool.name,
    recentTransactionsTool.description,
    recentTransactionsTool.parameters.shape,
    async (params) => recentTransactionsTool.handler(params, client)
  );

  server.tool(
    emergencyFreezeTool.name,
    emergencyFreezeTool.description,
    emergencyFreezeTool.parameters.shape,
    async (params) => emergencyFreezeTool.handler(params, client)
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HALO MCP Server running on stdio");
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
