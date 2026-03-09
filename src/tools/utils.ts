export function buildTextResult(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text
      }
    ]
  };
}

export function formatUsdcFromMicro(value: unknown): string {
  const micro = toNumber(value);
  return (micro / 1_000_000).toFixed(2);
}

export function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

export function getString(value: unknown, key: string): string | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  return typeof record[key] === "string" ? record[key] : undefined;
}

export function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function shortAddress(address: string | undefined, fallback = "unknown"): string {
  if (!address) {
    return fallback;
  }

  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return undefined;
}
