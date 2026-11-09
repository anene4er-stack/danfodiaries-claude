import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ANTHROPIC_API_KEY ||= 'test-key';
const { default: handler, config } = await import('../netlify/functions/api.mjs');

const context = { requestId: 'test', site: {}, deploy: {}, account: {}, server: {}, params: {}, cookies: { get() {}, set() {}, delete() {} } };

test('the Netlify function routes /api and /health', () => {
  assert.deepEqual(config.path, ['/api', '/api/*', '/health']);
});

test('the Netlify function runs an assessment through the Express app', async () => {
  const res = await handler(
    new Request('https://example.netlify.app/api/rhythm/assess', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ season: 'valley', activity: 'restoring' }),
    }),
    context,
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.season.id, 'valley');
  assert.equal(body.alignment.status, 'aligned');
});

test('the Netlify function returns validation errors and the endpoint list', async () => {
  const bad = await handler(new Request('https://example.netlify.app/api/rhythm/assess', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  }), context);
  assert.equal(bad.status, 400);
  const list = await handler(new Request('https://example.netlify.app/api'), context);
  assert.ok((await list.json()).endpoints.includes('/api/rhythm/assess'));
});

test('without an API key, reflections answer 503 with a clear message', async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const res = await handler(new Request('https://example.netlify.app/api/cultivation/reflect', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: 'Hello' }),
    }), context);
    assert.equal(res.status, 503);
    assert.match((await res.json()).error, /not set up on this site yet/);
  } finally {
    process.env.ANTHROPIC_API_KEY = saved;
  }
});
