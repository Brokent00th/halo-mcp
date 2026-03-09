import { z } from "zod";

import { HaloClient } from "../halo-client.js";
import { buildTextResult, formatUsdcFromMicro, getString } from "./utils.js";

export const checkBalanceTool = {
  name: "halo_check_balance",
  description: "Check USDC balance including the available balance after subtracting funds locked for pending approvals.",
  parameters: z.object({}),
  async handler(_: Record<string, never>, client: HaloClient) {
    const balance = await client.getBalance();

    const total = formatUsdcFromMicro(balance.total ?? balance.totalBalance ?? balance.balance);
    const available = formatUsdcFromMicro(balance.available ?? balance.availableBalance);
    const locked = formatUsdcFromMicro(balance.locked ?? balance.lockedBalance);
    const address = getString(balance, "address") ?? getString(balance, "walletAddress") ?? "unknown";

    return buildTextResult(
      `Total: $${total}\nAvailable: $${available}\nLocked: $${locked}\nAddress: ${address}\nNetwork: Base Sepolia`
    );
  }
};
