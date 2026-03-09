import { z } from "zod";

import { HaloClient } from "../halo-client.js";
import { asRecord, buildTextResult, getString } from "./utils.js";

function formatMandates(items: unknown[], predicate: (scope: string) => boolean): string[] {
  return items
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== undefined)
    .filter((item) => predicate((getString(item, "scope") ?? getString(item, "type") ?? "other").toLowerCase()))
    .map((item, index) => {
      const name = getString(item, "name") ?? getString(item, "title") ?? `Mandate ${index + 1}`;
      const scope = getString(item, "scope") ?? getString(item, "type") ?? "unknown";
      const limit = getString(item, "limit") ?? getString(item, "amount") ?? getString(item, "threshold") ?? "n/a";
      const status = getString(item, "status") ?? "active";
      return `- ${name} [${scope}] limit: ${limit} status: ${status}`;
    });
}

export const listMandatesTool = {
  name: "halo_list_mandates",
  description: "List the spending rules that govern agent payments, including global, agent-specific, and system limits.",
  parameters: z.object({}),
  async handler(_: Record<string, never>, client: HaloClient) {
    const mandates = await client.listMandates();

    if (mandates.length === 0) {
      return buildTextResult("No mandates configured.");
    }

    const global = formatMandates(mandates, (scope) => scope.includes("global"));
    const system = formatMandates(mandates, (scope) => scope.includes("system"));
    const agentSpecific = formatMandates(
      mandates,
      (scope) => !scope.includes("global") && !scope.includes("system")
    );

    const sections = [
      "Global Mandates:",
      global.length > 0 ? global.join("\n") : "- None",
      "",
      "System Mandates:",
      system.length > 0 ? system.join("\n") : "- None",
      "",
      "Agent-Specific Mandates:",
      agentSpecific.length > 0 ? agentSpecific.join("\n") : "- None"
    ];

    return buildTextResult(sections.join("\n"));
  }
};
