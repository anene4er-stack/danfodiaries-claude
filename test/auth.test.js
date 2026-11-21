import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyToken, createJwksFetcher, createAuth, AuthError } from '../src/auth.js';
import { createRateLimiter } from '../src/security.js';

const NOW = 1_800_000_000_000; // fixed clock, in ms
const now = () => NOW;
const sec = NOW / 1000;
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const claims = (extra = {}) => ({ sub: 'user-1', email: 'a@b.co', aud: 'authenticated', exp: sec + 3600, ...extra });

const hs256 = (payload, secret = 's3cret', header = { alg: 'HS256', typ: 'JWT' }) => {
  const body = `${b64(header)}.${b64(payload)}`;
  return `${body}.${crypto.createHmac('sha256', secret).update(body).digest('base64url')}`;
};
const asym = (alg, payload, privateKey, kid = 'k1') => {
  const body = `${b64({ alg, typ: 'JWT', kid })}.${b64(payload)}`;
  const sig = alg === 'ES256'
    ? crypto.sign('sha256', Buffer.from(body), { key: privateKey, dsaEncoding: 'ieee-p1363' })
    : crypto.sign('sha256', Buffer.from(body), privateKey);
  return `${body}.${sig.toString('base64url')}`;
};

test('HS256 tokens: valid, wrong secret, tampered, expired, wrong audience, missing subject', async () => {
  const user = await verifyToken(hs256(claims()), { secret: 's3cret', now });
  assert.deepEqual(user, { id: 'user-1', email: 'a@b.co' });

  await assert.rejects(verifyToken(hs256(claims(), 'other'), { secret: 's3cret', now }), AuthError);
  const [h, , s] = hs256(claims()).split('.');
  await assert.rejects(verifyToken(`${h}.${b64(claims({ sub: 'admin' }))}.${s}`, { secret: 's3cret', now }), /Invalid/);
  await assert.rejects(verifyToken(hs256(claims({ exp: sec - 1 })), { secret: 's3cret', now }), /expired/);
  await assert.rejects(verifyToken(hs256(claims({ exp: undefined })), { secret: 's3cret', now }), /expired/);
  await assert.rejects(verifyToken(hs256(claims({ aud: 'anon' })), { secret: 's3cret', now }), /audience/);
  await assert.rejects(verifyToken(hs256(claims({ sub: undefined })), { secret: 's3cret', now }), /subject/);
});

test('tokens with alg none, unknown algs, or no configured keys are refused', async () => {
  const none = `${b64({ alg: 'none' })}.${b64(claims())}.`;
  await assert.rejects(verifyToken(none, { secret: 's3cret', now }), AuthError);
  await assert.rejects(verifyToken(hs256(claims(), 's3cret', { alg: 'HS512' }), { secret: 's3cret', now }), AuthError);
  await assert.rejects(verifyToken(hs256(claims()), { now }), AuthError); // no secret configured
  for (const bad of ['', 'abc', 'a.b', 'a.b.c.d', 'x'.repeat(5000), null, 42]) {
    await assert.rejects(verifyToken(bad, { secret: 's3cret', now }), AuthError);
  }
});

test('ES256 and RS256 tokens are checked against the published public keys', async () => {
  const ec = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const ecJwk = { ...ec.publicKey.export({ format: 'jwk' }), kid: 'k1' };
  const rsaJwk = { ...rsa.publicKey.export({ format: 'jwk' }), kid: 'k2' };
  const getKey = async (kid) => [ecJwk, rsaJwk].find((k) => k.kid === kid) || null;

  assert.equal((await verifyToken(asym('ES256', claims(), ec.privateKey, 'k1'), { getKey, now })).id, 'user-1');
  assert.equal((await verifyToken(asym('RS256', claims(), rsa.privateKey, 'k2'), { getKey, now })).id, 'user-1');

  const other = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  await assert.rejects(verifyToken(asym('ES256', claims(), other.privateKey, 'k1'), { getKey, now }), /Invalid/);
  await assert.rejects(verifyToken(asym('ES256', claims(), ec.privateKey, 'unknown'), { getKey, now }), /Invalid/);
  // a token claiming RS256 must not verify against an EC key (algorithm confusion)
  await assert.rejects(verifyToken(asym('RS256', claims(), rsa.privateKey, 'k1'), { getKey, now }), /Invalid/);
  // an HS256 token cannot be checked with a public key
  await assert.rejects(verifyToken(hs256(claims()), { getKey, now }), AuthError);
});

test('the JWKS fetcher caches keys and reloads for an unknown key id', async () => {
  let calls = 0;
  let keys = [{ kid: 'a', kty: 'EC' }];
  const fetchImpl = async (url) => {
    calls += 1;
    assert.equal(url, 'https://proj.supabase.co/auth/v1/.well-known/jwks.json');
    return { ok: true, json: async () => ({ keys }) };
  };
  const getKey = createJwksFetcher('https://proj.supabase.co/', { fetchImpl, now });
  assert.equal((await getKey('a')).kid, 'a');
  assert.equal((await getKey('a')).kid, 'a');
  assert.equal(calls, 1);
  keys = [{ kid: 'a', kty: 'EC' }, { kid: 'b', kty: 'EC' }];
  assert.equal((await getKey('b')).kid, 'b');
  assert.equal(calls, 2);
});

function run(middleware, headers = {}) {
  const req = { headers };
  const res = { code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
  return new Promise((resolve) => {
    Promise.resolve(middleware(req, res, () => resolve({ req, res, passed: true }))).then(() => resolve({ req, res, passed: false }));
  });
}

test('middleware: off by default, fails closed when misconfigured, and checks tokens when on', async () => {
  const quiet = console.error;
  console.error = () => {};
  try {
    const off = await run(createAuth({ env: {}, now }).requireUser);
    assert.equal(off.passed, true);
    assert.equal(off.req.user, null);

    const misconfigured = await run(createAuth({ env: { REQUIRE_AUTH: 'true' }, now }).requireUser);
    assert.equal(misconfigured.passed, false);
    assert.equal(misconfigured.res.code, 503);

    const { requireUser } = createAuth({ env: { REQUIRE_AUTH: 'true', SUPABASE_JWT_SECRET: 's3cret' }, now });
    const none = await run(requireUser);
    assert.equal(none.res.code, 401);
    assert.equal((await run(requireUser, { authorization: 'Basic abc' })).res.code, 401);
    const bad = await run(requireUser, { authorization: `Bearer ${hs256(claims(), 'wrong')}` });
    assert.equal(bad.res.code, 401);
    assert.doesNotMatch(JSON.stringify(bad.res.body), /signature|secret|Invalid token/i);
    const good = await run(requireUser, { authorization: `Bearer ${hs256(claims())}` });
    assert.equal(good.passed, true);
    assert.equal(good.req.user.id, 'user-1');
  } finally {
    console.error = quiet;
  }
});

test('public config exposes only the URL and anon key, never secrets', () => {
  const env = { REQUIRE_AUTH: 'true', SUPABASE_URL: 'https://p.supabase.co', SUPABASE_ANON_KEY: 'anon', SUPABASE_JWT_SECRET: 's3cret', ANTHROPIC_API_KEY: 'sk-x' };
  const cfg = createAuth({ env }).publicConfig();
  assert.deepEqual(cfg, { authRequired: true, signIn: { supabaseUrl: 'https://p.supabase.co', supabaseAnonKey: 'anon' } });
  assert.doesNotMatch(JSON.stringify(cfg), /s3cret|sk-x/);
  assert.deepEqual(createAuth({ env: {} }).publicConfig(), { authRequired: false, signIn: null });
});

test('rate limits are counted per signed-in user, not per shared address', () => {
  const limit = createRateLimiter({ max: 1, now });
  const call = (user) => {
    const res = { code: 200, status(c) { this.code = c; return this; }, json() { return this; }, set() { return this; } };
    let passed = false;
    limit({ user, headers: {}, socket: { remoteAddress: '10.0.0.1' } }, res, () => { passed = true; });
    return passed;
  };
  assert.equal(call({ id: 'u1' }), true);
  assert.equal(call({ id: 'u2' }), true, 'a different user on the same address is separate');
  assert.equal(call({ id: 'u1' }), false);
});
