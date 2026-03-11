import { describe, it, expect } from 'vitest';

const BASE = 'https://halo-backend-production-cac9.up.railway.app';
const FAKE_KEY = 'halo_sk_test_fake_key_for_testing_000000';

function authHeaders() {
  return {
    Authorization: `Bearer ${FAKE_KEY}`,
    'Content-Type': 'application/json',
  };
}

function expectAuthGuarded(status: number) {
  expect(status).toBeGreaterThanOrEqual(401);
  expect(status).toBeLessThan(500);
}

describe('HALO API guardrails for MCP tools (live backend)', () => {
  it('createIntent (POST /api/v1/intents) is auth-guarded', async () => {
    const r = await fetch(`${BASE}/api/v1/intents`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        amountMicroUsdc: '100000',
        recipientAddress: '0x0000000000000000000000000000000000000001',
        type: 'payment',
        idempotencyKey: `test-${Date.now()}`,
      }),
    });

    expectAuthGuarded(r.status);
  });

  it('getIntentStatus (GET /api/v1/intents/:id) is auth-guarded', async () => {
    const r = await fetch(`${BASE}/api/v1/intents/int_test_fake`, {
      headers: {
        Authorization: `Bearer ${FAKE_KEY}`,
      },
    });

    expectAuthGuarded(r.status);
  });

  it('getBalance (GET /api/v1/wallet/balance) is auth-guarded', async () => {
    const r = await fetch(`${BASE}/api/v1/wallet/balance`, {
      headers: {
        Authorization: `Bearer ${FAKE_KEY}`,
      },
    });

    expectAuthGuarded(r.status);
  });

  it('listMandates (GET /api/v1/mandates) is auth-guarded', async () => {
    const r = await fetch(`${BASE}/api/v1/mandates`, {
      headers: {
        Authorization: `Bearer ${FAKE_KEY}`,
      },
    });

    expectAuthGuarded(r.status);
  });

  it('recentTransactions (GET /api/v1/transactions) is auth-guarded', async () => {
    const r = await fetch(`${BASE}/api/v1/transactions?limit=5`, {
      headers: {
        Authorization: `Bearer ${FAKE_KEY}`,
      },
    });

    expectAuthGuarded(r.status);
  });

  it('emergencyFreeze (POST /api/v1/deployer/kill-switch) is auth-guarded', async () => {
    const r = await fetch(`${BASE}/api/v1/deployer/kill-switch`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ scope: 'all' }),
    });

    expectAuthGuarded(r.status);
  });

  it('health endpoint works', async () => {
    const r = await fetch(`${BASE}/health`);
    expect(r.ok).toBe(true);
    const d = await r.json();
    expect(d.status).toBe('ok');
  });
});

describe('MCP build artifacts', () => {
  it('server bundle exists', async () => {
    const fs = await import('node:fs');
    const indexPath = new URL('../dist/index.js', import.meta.url).pathname;
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  it('halo-client module imports', async () => {
    const { HaloClient } = await import('../dist/halo-client.js');
    expect(HaloClient).toBeDefined();
  });

  it('all 6 tool modules import', async () => {
    const toolModules = await Promise.all([
      import('../dist/tools/create-payment.js'),
      import('../dist/tools/get-intent-status.js'),
      import('../dist/tools/check-balance.js'),
      import('../dist/tools/list-mandates.js'),
      import('../dist/tools/recent-transactions.js'),
      import('../dist/tools/emergency-freeze.js'),
    ]);

    expect(toolModules).toHaveLength(6);
  });
});
