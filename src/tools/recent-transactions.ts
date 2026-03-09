import { z } from "zod";

import { HaloClient } from "../halo-client.js";
import { asRecord, buildTextResult, formatUsdcFromMicro, getString, shortAddress } from "./utils.js";

export const recentTransactionsTool = {
  name: "halo_recent_transactions",
  description: "View recent HALO payment transactions with status, amount, recipient, and settlement hash details.",
  parameters: z.object({
    limit: z.number().min(1).max(50).default(10).optional().describe("Number of transactions to return (1-50)")
  }),
  async handler(params: { limit?: number }, client: HaloClient) {
    const transactions = await client.getTransactions(params.limit ?? 10);

    if (transactions.length === 0) {
      return buildTextResult("No recent transactions.");
    }

    const lines = transactions.map((item) => {
      const transaction = asRecord(item) ?? {};
      const amount = formatUsdcFromMicro(transaction.amount);
      const recipient =
        shortAddress(getString(transaction, "recipientAddress") ?? getString(transaction, "recipient"), "unknown");
      const status = getString(transaction, "status") ?? "unknown";
      const txHash = shortAddress(getString(transaction, "txHash"), "pending");
      return `$${amount} -> ${recipient} [${status}] tx:${txHash}`;
    });

    return buildTextResult(lines.join("\n"));
  }
};
