import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ANTHROPIC_API_KEY ||= 'test-key';
const { app } = await import('../src/server.js');

test('the server serves the web page and its assets, and lists endpoints at /api', async () => {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(await page.text(), /<title>DanfoDiaries/);
    for (const asset of ['/app.js', '/styles.css']) assert.equal((await fetch(`${base}${asset}`)).status, 200);
    const api = await (await fetch(`${base}/api`)).json();
    assert.ok(api.endpoints.includes('/api/polarity/assess'));
  } finally {
    server.close();
  }
});
