import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkLengths, createRateLimiter, errorHandler, sendSafeError, GENERIC_ERROR,
  MAX_CONTENT_CHARS, MAX_TITLE_CHARS,
} from '../src/security.js';

function fakeRes() {
  return {
    code: 200, body: null, headers: {}, headersSent: false,
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
    set(k, v) { this.headers[k] = v; return this; },
  };
}
const req = (ip) => ({ headers: ip ? { 'x-nf-client-connection-ip': ip } : {}, socket: { remoteAddress: '10.0.0.1' } });

test('checkLengths accepts normal text and rejects long or non-text fields', () => {
  assert.equal(checkLengths({ title: 'Hi', content: 'Today was fine.', focus: 'work' }), null);
  assert.equal(checkLengths({ content: 'x' }), null);
  assert.match(checkLengths({ content: 'x'.repeat(MAX_CONTENT_CHARS + 1) }), /Journal content must be/);
  assert.match(checkLengths({ content: 'x', title: 'y'.repeat(MAX_TITLE_CHARS + 1) }), /Title must be/);
  assert.match(checkLengths({ content: { a: 1 } }), /must be text/);
  assert.match(checkLengths({ content: 'x', focus: 42 }), /Focus must be text/);
});

test('rate limiter blocks after the limit, per client, and resets after the window', () => {
  let t = 1000;
  const limit = createRateLimiter({ windowMs: 60_000, max: 3, now: () => t });
  const run = (ip) => { const res = fakeRes(); let passed = false; limit(req(ip), res, () => { passed = true; }); return { res, passed }; };

  for (let i = 0; i < 3; i++) assert.equal(run('1.1.1.1').passed, true);
  const blocked = run('1.1.1.1');
  assert.equal(blocked.passed, false);
  assert.equal(blocked.res.code, 429);
  assert.equal(blocked.res.headers['Retry-After'], '60');
  assert.equal(run('2.2.2.2').passed, true, 'another client is not affected');

  t += 60_000;
  assert.equal(run('1.1.1.1').passed, true, 'allowed again after the window');
});

test('rate limiter falls back to the socket address when no proxy header is present', () => {
  const limit = createRateLimiter({ max: 1 });
  const res = fakeRes();
  let n = 0;
  limit(req(), res, () => n++);
  limit(req(), res, () => n++);
  assert.equal(n, 1);
  assert.equal(res.code, 429);
});

test('sendSafeError never exposes provider details', () => {
  const quiet = console.error;
  console.error = () => {};
  try {
    const res = fakeRes();
    sendSafeError(res, Object.assign(new Error('401 invalid x-api-key sk-ant-secret'), { status: 401 }));
    assert.equal(res.code, 502);
    assert.deepEqual(res.body, { error: GENERIC_ERROR });
    assert.doesNotMatch(JSON.stringify(res.body), /sk-ant|x-api-key|401/);
  } finally {
    console.error = quiet;
  }
});

test('errorHandler answers 413 for large bodies and 400 for bad JSON', () => {
  const quiet = console.error;
  console.error = () => {};
  try {
    const big = fakeRes();
    errorHandler({ type: 'entity.too.large' }, {}, big, () => {});
    assert.equal(big.code, 413);
    const bad = fakeRes();
    errorHandler({ type: 'entity.parse.failed' }, {}, bad, () => {});
    assert.equal(bad.code, 400);
    const other = fakeRes();
    errorHandler(new Error('db password is hunter2'), {}, other, () => {});
    assert.equal(other.code, 500);
    assert.doesNotMatch(JSON.stringify(other.body), /hunter2/);
  } finally {
    console.error = quiet;
  }
});
