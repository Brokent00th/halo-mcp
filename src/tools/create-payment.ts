import { z } from "zod";

import { HaloClient } from "../halo-client.js";
import { buildTextResult, getString } from "./utils.js";

export const createPaymentTool = {
  name: "halo_create_payment",
  description:
    "Create a HALO payment intent for a USDC transfer. HALO evaluates each payment against spending mandates and FIRE fraud scoring before execution. Payments above configured thresholds require biometric approval in the Nexus app. Possible statuses include auto_approved, pending_approval, and rejected.",
  parameters: z.object({
    amount: z.number().positive().describe("Amount in USDC e.g. 5.00"),
    recipient: z.string().describe("0x address"),
    description: z.string().optional().describe("What is this payment for?")
  }),
  async handler(
    params: {
      amount: number;
      recipient: string;
      description?: string;
    },
    client: HaloClient
  ) {
    const intent = await client.createIntent(params.amount, params.recipient, {
      description: params.description
    });

    const status = getString(intent, "status") ?? "unknown";
    const reason = getString(intent, "reason") ?? getString(intent, "message") ?? "No reason provided";
    const intentId = getString(intent, "id") ?? "unknown";

    if (status === "pending_approval") {
      return buildTextResult(`Payment of $${params.amount.toFixed(2)} requires approval. User must approve on Nexus.`);
    }

    if (status === "rejected") {
      return buildTextResult(`Payment rejected: ${reason}`);
    }

    if (status === "auto_approved") {
      return buildTextResult(
        `Payment created: $${params.amount.toFixed(2)} -> ${params.recipient}. Status: auto_approved. Intent: ${intentId}`
      );
    }

    return buildTextResult(
      `Payment created: $${params.amount.toFixed(2)} -> ${params.recipient}. Status: ${status}. Intent: ${intentId}`
    );
  }
};
