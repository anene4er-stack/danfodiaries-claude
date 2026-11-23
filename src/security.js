// Shared protections for the API: input limits, rate limiting and safe errors.
// No imports on purpose, so it can be tested without Express.

export const MAX_BODY = '32kb';
export const MAX_CONTENT_CHARS = 8000;
export const MAX_TITLE_CHARS = 200;
export const MAX_FOCUS_CHARS = 500;
export const MAX_CHAT_CHARS = 4000;

// Instructions for /api/chat live on the server only. Clients cannot change them.
export const CHAT_SYSTEM_PROMPT = 'You are a helpful writing assistant for DanfoDiaries.';

export const GENERIC_ERROR = 'Something went wrong while contacting the assistant. Please try again shortly.';

// Returns an error message when a text field is not a string or is too long, otherwise null.
export function checkLengths({ title, content, focus }) {
  const checks = [
    ['Journal content', content, MAX_CONTENT_CHARS],
    ['Title', title, MAX_TITLE_CHARS],
    ['Focus', focus, MAX_FOCUS_CHARS],
  ];
  for (const [label, value, max] of checks) {
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return `${label} must be text.`;
    if (value.length > max) return `${label} must be ${max} characters or fewer.`;
  }
  return null;
}

// Replies with a generic message. Provider details are logged on the server only.
export function sendSafeError(res, error) {
  // For rejected credentials, also log Anthropic's short reason (it never contains the key).
  const reason = [401, 403].includes(error?.status) ? String(error?.error?.error?.message || '').slice(0, 120) : '';
  console.error('Assistant request failed:', error?.name || 'Error', error?.status || '', reason);
  return res.status(502).json({ error: GENERIC_ERROR });
}

// Who the request is from: the signed-in user if there is one, otherwise the network address.
// Netlify sets the address header itself, so clients cannot forge it.
function clientKey(req) {
  if (req.user?.id) return `user:${req.user.id}`;
  const header = req.headers?.['x-nf-client-connection-ip'];
  return (typeof header === 'string' && header) || req.socket?.remoteAddress || 'unknown';
}

// Fixed-window limiter held in memory. It is best effort: each serverless instance
// counts separately, so a shared store is needed for strict quotas (planned with accounts).
export function createRateLimiter({ windowMs = 60_000, max = 10, now = () => Date.now() } = {}) {
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const t = now();
    const key = clientKey(req);
    let entry = hits.get(key);
    if (!entry || t >= entry.resetAt) {
      entry = { count: 0, resetAt: t + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    if (hits.size > 5000) {
      for (const [k, v] of hits) if (t >= v.resetAt) hits.delete(k);
    }

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - t) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    next();
  };
}

export function securityHeaders(_req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('X-Frame-Options', 'DENY');
  next();
}

// Final error handler: oversized or malformed bodies get a clear, safe answer.
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large.' });
  }
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  console.error('Unhandled error:', err?.name || 'Error');
  return res.status(500).json({ error: 'Internal server error.' });
}
