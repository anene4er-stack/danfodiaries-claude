---
name: check-live-site
description: Check that the live DanfoDiaries site on Netlify (danfodiaries-laws.netlify.app) is up after a deploy or merge, and diagnose failures, especially reflection errors, from Netlify's function logs. Use when asked to check, verify or test the live site or a deploy, or when visitors report errors.
---

# Check the live DanfoDiaries site

The site is the Netlify project **danfodiaries-laws**:

- Site id: `723bee60-4aa5-4a3e-b561-faa75f52bada`
- URL: https://danfodiaries-laws.netlify.app
- Admin: https://app.netlify.com/projects/danfodiaries-laws

Netlify builds `main` from GitHub (`anene4er-stack/danfodiaries-claude`). The static page comes from `public/`. The API is a single function, `netlify/functions/api.mjs`, which wraps the Express app in `src/server.js`.

## 1. Make sure the site can be reached

The cloud session's network must allow `danfodiaries-laws.netlify.app`. The personal environment **danfodiaries** allows it. If `curl` fails with `CONNECT tunnel failed, response 403`, the session isn't on that environment. Do this:

1. Call `get_environment`.
2. If **danfodiaries** is listed in `saved_for_session_repositories`, move this session onto it with `switch_environment`.

Don't treat a blocked request as "the site is down".

## 2. Probe the site

```bash
B=https://danfodiaries-laws.netlify.app
for u in / /app.js /styles.css /api /api/config /health /api/rhythm; do
  echo "$u $(curl -s -o /dev/null -w '%{http_code}' $B$u)"
done
curl -s $B/ | grep -o '<title>[^<]*'
curl -s $B/health; echo
# Assessment: runs without Claude, so it costs nothing
curl -s -w ' %{http_code}\n' -X POST -H 'Content-Type: application/json' \
  -d '{"scale":"anxiety-excitement","position":2}' $B/api/polarity/assess | tail -c 200
# Reflection: calls Claude once if a valid key is set
curl -s -D - -w '\n%{http_code}\n' -X POST -H 'Content-Type: application/json' \
  -d '{"content":"A short test entry."}' $B/api/rhythm/reflect | grep -iE '^x-nf-request-id|^\{|^[0-9]{3}$'
```

What a healthy site returns:

- Every GET returns 200.
- The page title is "DanfoDiaries · The Laws".
- `/health` returns `{"status":"ok",...}`.
- The assessment returns 200 with JSON.

## 3. Read the reflection result

| Status and message | Meaning |
|---|---|
| 200 with `title` and `reflection` | Works. |
| 503 "Reflections are not set up on this site yet" | No `ANTHROPIC_API_KEY` is set on Netlify. This is expected if the owner chose assessments only. |
| 401 "Please sign in…" or 503 "Sign-in is not configured…" | `REQUIRE_AUTH=true` is on. This is the app's own sign-in check (`src/auth.js`), not Anthropic. |
| 429 | The per-visitor rate limit was hit (10 per minute). Wait and retry. |
| 502 "Something went wrong while contacting the assistant." | Anthropic refused the call. The real reason is only in the logs, so go to step 4. |

## 4. Find the real cause in Netlify's logs

Use the Netlify MCP tool `netlify-observability-services-reader`. Timestamps are in milliseconds; get the current time with `echo $(( $(date +%s) * 1000 ))`.

- **Logs by text:** call `get-request-logs` with the site id, a `from_ts` and `to_ts` window, and the filter `{"field":"LogText","op":"=","value":"Assistant request failed"}`. The server logs `Assistant request failed: <name> <status> <reason>`.
- **One request:** call `get-request-detail` with the `x-nf-request-id` from step 2.

How to read the status:

- **401:** the key is invalid, revoked or expired. Use the `danfodiaries-api-key-rotation` skill if it's available. Otherwise tell the owner to replace `ANTHROPIC_API_KEY` under Project configuration → Environment variables, then redeploy.
- **400:** the request was rejected, for example a parameter the model no longer accepts or an unknown model. Check the `CLAUDE_MODEL` value and the request in the router's `reflect` handler.
- **429 or 529:** Anthropic's rate limit or overload. Retry later.

## 5. Check which code is live

Netlify's `get-project` can report an empty `currentDeploy` even while the site is serving. Don't rely on it. Instead, compare the live files with `main`:

```bash
git fetch -q origin main
diff <(curl -s $B/app.js) <(git show origin/main:public/app.js) && echo "live app.js matches main"
```

If they differ, the newest deploy is still building or has failed. Ask the owner to look at https://app.netlify.com/projects/danfodiaries-laws/deploys.

## Rules

- Never print, read back or change `ANTHROPIC_API_KEY` or any other secret. Report only whether a key is present and what Anthropic answered.
- Don't change visitor access (public or private) or environment variables unless the owner asks.
- Report each check as passed or failed, with the status code. Say plainly which checks you couldn't run.
