import { z } from "zod";

import { HaloClient } from "../halo-client.js";
import { buildTextResult, formatUsdcFromMicro, getString } from "./utils.js";

export const getIntentStatusTool = {
  name: "halo_get_intent_status",
  description: "Check the status of a HALO payment intent, including whether it is approved, settled, or denied.",
  parameters: z.object({
    intentId: z.string().describe("HALO payment intent ID")
  }),
  async handler(params: { intentId: string }, client: HaloClient) {
    const intent = await client.getIntent(params.intentId);
    const amount = formatUsdcFromMicro(intent.amount);
    const recipient = getString(intent, "recipientAddress") ?? getString(intent, "recipient") ?? "unknown";
    const status = getString(intent, "status") ?? "unknown";
    const txHash = getString(intent, "txHash");

    const lines = [`Amount: $${amount}`, `Recipient: ${recipient}`, `Status: ${status}`];

    if (status === "settled" && txHash) {
      lines.push(`Basescan: https://sepolia.basescan.org/tx/${txHash}`);
    }

    return buildTextResult(lines.join("\n"));
  }
};
