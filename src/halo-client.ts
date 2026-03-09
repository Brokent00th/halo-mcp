const DEFAULT_BASE_URL = "https://halo-backend-production-cac9.up.railway.app";
const FINAL_INTENT_STATUSES = new Set(["settled", "denied", "rejected", "failed"]);

type JsonRecord = Record<string, unknown>;

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function getString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function getNestedErrorMessage(payload: unknown): string | undefined {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload;
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  const directMessage =
    getString(payload, "message") ??
    getString(payload, "error") ??
    getString(payload, "detail");

  if (directMessage) {
    return directMessage;
  }

  const nestedError = payload.error;
  if (isRecord(nestedError)) {
    return (
      getString(nestedError, "message") ??
      getString(nestedError, "detail") ??
      getString(nestedError, "error")
    );
  }

  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class HaloClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options?: { baseUrl?: string; apiKey?: string }) {
    const apiKey = options?.apiKey ?? process.env.HALO_API_KEY;
    if (!apiKey) {
      throw new Error("HALO_API_KEY is required");
    }

    this.baseUrl = (options?.baseUrl ?? process.env.HALO_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    for (const [key, value] of Object.entries(options.searchParams ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    const raw = await response.text();
    const payload = raw.length > 0 ? this.parseResponse(raw) : null;

    if (!response.ok) {
      throw new Error(getNestedErrorMessage(payload) ?? `HALO request failed with ${response.status}`);
    }

    return payload as T;
  }

  private parseResponse(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  async createIntent(
    amountUsdc: number,
    recipientAddress: string,
    metadata?: Record<string, unknown>
  ): Promise<JsonRecord> {
    const amount = Math.round(amountUsdc * 1_000_000).toString();
    const idempotencyKey = `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return this.request<JsonRecord>("/api/v1/intents", {
      method: "POST",
      body: {
        amount,
        recipientAddress,
        metadata,
        idempotencyKey,
        type: "payment"
      }
    });
  }

  async getIntent(intentId: string): Promise<JsonRecord> {
    return this.request<JsonRecord>(`/api/v1/intents/${intentId}`);
  }

  async getBalance(): Promise<JsonRecord> {
    return this.request<JsonRecord>("/api/v1/wallet/balance");
  }

  async listMandates(): Promise<unknown[]> {
    return this.request<unknown[]>("/api/v1/mandates");
  }

  async listAgents(): Promise<unknown[]> {
    return this.request<unknown[]>("/api/v1/agents");
  }

  async getTransactions(limit = 20): Promise<unknown[]> {
    return this.request<unknown[]>("/api/v1/transactions", {
      searchParams: { limit }
    });
  }

  async killSwitch(
    scope: "all" | "wallet" | "agents",
    options?: { walletId?: string; agentIds?: string[] }
  ): Promise<JsonRecord> {
    return this.request<JsonRecord>("/api/v1/deployer/kill-switch", {
      method: "POST",
      body: {
        scope,
        ...options
      }
    });
  }

  async waitForSettlement(intentId: string, timeoutMs = 120_000): Promise<JsonRecord> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const intent = await this.getIntent(intentId);
      const status = getString(intent, "status")?.toLowerCase();

      if (status && FINAL_INTENT_STATUSES.has(status)) {
        return intent;
      }

      await sleep(3_000);
    }

    throw new Error(`Timed out waiting for intent ${intentId} to settle after ${timeoutMs}ms`);
  }
}
