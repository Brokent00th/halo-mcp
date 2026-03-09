import { z } from "zod";

import { HaloClient } from "../halo-client.js";
import { buildTextResult } from "./utils.js";

export const emergencyFreezeTool = {
  name: "halo_emergency_freeze",
  description: "EMERGENCY - freeze all agents and deny all pending payments immediately. Use this only when unauthorized activity is suspected. Requires confirm=true.",
  parameters: z.object({
    confirm: z.boolean().describe("Must be true to execute")
  }),
  async handler(params: { confirm: boolean }, client: HaloClient) {
    if (!params.confirm) {
      return buildTextResult("NOT executed. Set confirm=true.");
    }

    const result = await client.killSwitch("all");
    const suspendedAgents = Number(result.suspendedAgents ?? result.agentsSuspended ?? 0);
    const frozenWallets = Number(result.frozenWallets ?? result.walletsFrozen ?? 0);
    const deniedPending = Number(result.deniedPending ?? result.pendingDenied ?? 0);

    return buildTextResult(
      `Emergency freeze executed.\nSuspended agents: ${suspendedAgents}\nFrozen wallets: ${frozenWallets}\nDenied pending: ${deniedPending}`
    );
  }
};
