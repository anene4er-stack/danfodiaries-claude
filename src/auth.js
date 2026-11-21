// Verifies Supabase sign-in tokens (JWTs) on the server. Uses only Node's crypto.
//
// Two kinds of Supabase projects are supported:
//  - asymmetric signing keys (ES256 or RS256): the public keys are read from
//    <SUPABASE_URL>/auth/v1/.well-known/jwks.json
//  - the legacy shared secret (HS256): set SUPABASE_JWT_SECRET
//
// Authentication is opt-in with REQUIRE_AUTH=true so the current public site keeps
// working until the page has sign-in turned on. When it is on and the configuration
// is incomplete, requests are refused instead of let through.

import crypto from 'node:crypto';

const b64url = (s) => Buffer.from(s, 'base64url');

export class AuthError extends Error {}

function parseJson(buf) {
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    throw new AuthError('Malformed token.');
  }
}

// Checks signature and claims. `keys` supplies { secret } and/or an async getKey(kid).
export async function verifyToken(token, { secret, getKey, now = () => Date.now() } = {}) {
  if (typeof token !== 'string' || token.length > 4096) throw new AuthError('Malformed token.');
  const parts = token.split('.');
  if (parts.length !== 3) throw new AuthError('Malformed token.');
  const [h, p, s] = parts;
  const header = parseJson(b64url(h));
  const payload = parseJson(b64url(p));
  const signature = b64url(s);
  const signed = Buffer.from(`${h}.${p}`);

  if (header.alg === 'HS256') {
    if (!secret) throw new AuthError('Unsupported token.');
    const expected = crypto.createHmac('sha256', secret).update(signed).digest();
    if (expected.length !== signature.length || !crypto.timingSafeEqual(expected, signature)) {
      throw new AuthError('Invalid token.');
    }
  } else if (header.alg === 'ES256' || header.alg === 'RS256') {
    if (!getKey) throw new AuthError('Unsupported token.');
    const jwk = await getKey(header.kid);
    if (!jwk || (header.alg === 'ES256' && jwk.kty !== 'EC') || (header.alg === 'RS256' && jwk.kty !== 'RSA')) {
      throw new AuthError('Invalid token.');
    }
    const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const ok = header.alg === 'ES256'
      ? crypto.verify('sha256', signed, { key, dsaEncoding: 'ieee-p1363' }, signature)
      : crypto.verify('sha256', signed, key, signature);
    if (!ok) throw new AuthError('Invalid token.');
  } else {
    // "none" and anything else is refused.
    throw new AuthError('Unsupported token.');
  }

  const nowSec = Math.floor(now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) throw new AuthError('Token expired.');
  if (typeof payload.nbf === 'number' && payload.nbf > nowSec + 30) throw new AuthError('Token not yet valid.');
  if (payload.aud !== 'authenticated' && !(Array.isArray(payload.aud) && payload.aud.includes('authenticated'))) {
    throw new AuthError('Wrong audience.');
  }
  if (typeof payload.sub !== 'string' || !payload.sub) throw new AuthError('Missing subject.');
  return { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : undefined };
}

// Reads the project's public keys and keeps them for ten minutes.
export function createJwksFetcher(supabaseUrl, { fetchImpl = globalThis.fetch, ttlMs = 600_000, now = () => Date.now() } = {}) {
  let cache = null;
  return async function getKey(kid) {
    if (!cache || now() - cache.at > ttlMs || (kid && !cache.keys.some((k) => k.kid === kid))) {
      const base = supabaseUrl.replace(/\/+$/, '');
      const res = await fetchImpl(`${base}/auth/v1/.well-known/jwks.json`);
      if (!res.ok) throw new AuthError('Could not load signing keys.');
      const body = await res.json();
      cache = { at: now(), keys: Array.isArray(body.keys) ? body.keys : [] };
    }
    return cache.keys.find((k) => k.kid === kid) || (!kid && cache.keys.length === 1 ? cache.keys[0] : null);
  };
}

// Express middleware factory. Reads the environment at request time so tests can change it.
export function createAuth({ env = process.env, fetchImpl, now } = {}) {
  let jwks = null;
  let jwksFor = null;

  const required = () => String(env.REQUIRE_AUTH || '').toLowerCase() === 'true';

  function keysFromEnv() {
    const secret = env.SUPABASE_JWT_SECRET || undefined;
    const url = env.SUPABASE_URL || undefined;
    if (url && jwksFor !== url) {
      jwks = createJwksFetcher(url, { fetchImpl, now });
      jwksFor = url;
    }
    return { secret, getKey: url ? jwks : undefined };
  }

  async function requireUser(req, res, next) {
    req.user = null;
    if (!required()) return next();

    const { secret, getKey } = keysFromEnv();
    if (!secret && !getKey) {
      console.error('REQUIRE_AUTH is on but SUPABASE_URL / SUPABASE_JWT_SECRET are not set.');
      return res.status(503).json({ error: 'Sign-in is not configured on this site yet.' });
    }

    const header = req.headers?.authorization || '';
    const match = /^Bearer (\S+)$/.exec(header);
    if (!match) return res.status(401).json({ error: 'Please sign in to use this feature.' });

    try {
      req.user = await verifyToken(match[1], { secret, getKey, now });
      return next();
    } catch (error) {
      if (!(error instanceof AuthError)) console.error('Token check failed:', error?.name || 'Error');
      return res.status(401).json({ error: 'Your session is not valid. Please sign in again.' });
    }
  }

  // Public values the web page needs to show a sign-in form. Never includes secrets.
  function publicConfig() {
    const on = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
    return {
      authRequired: required(),
      signIn: on ? { supabaseUrl: env.SUPABASE_URL, supabaseAnonKey: env.SUPABASE_ANON_KEY } : null,
    };
  }

  return { requireUser, publicConfig };
}
