# DanfoDiaries — Claude integration

This repository now includes a small Express API that connects DanfoDiaries to Anthropic Claude.

What is included
- Express server for local API integration
- Claude messages API integration via Anthropic SDK
- Example journaling reflection endpoint
- Example chat endpoint

Quick start
1. Create a local environment file:
   cp .env.example .env
2. Add your Anthropic API key to `.env`:
   ANTHROPIC_API_KEY=your_key_here
3. Install dependencies:
   npm install
4. Start the app:
   npm start
   or use development mode:
   npm run dev

Endpoints
- GET /health
- GET /
- POST /api/chat
- POST /api/journal/reflect
- GET /api/correspondence
- GET /api/correspondence/systems/:id
- POST /api/correspondence/assess
- POST /api/correspondence/reflect

Example: journal reflection request
curl -X POST http://localhost:3000/api/journal/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Reflection on today",
    "mood": "hopeful",
    "content": "I finally completed a difficult task and felt proud of myself. I still have a lot to do, but I feel more confident than I did yesterday."
  }'

Example: chat request
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Help me write a short, encouraging journal conclusion for today.",
    "systemPrompt": "You are a supportive journaling assistant for DanfoDiaries."
  }'

Notes
- The app uses the Anthropic Messages API and uses `claude-sonnet-5-5` by default.
- You can change the model in `.env` with `CLAUDE_MODEL`.
- For production, add auth, rate limiting, and request validation.

Law of Correspondence ("As above, so below")
This feature is built from the "System of Correspondence" design doc and the notes on "The Below".
Each principle in the higher plane (the Above) has a matching process in the lower plane (the Below):

| Level | Above (principle) | Below (process) |
| --- | --- | --- |
| 1 | Culture | Leadership |
| 2 | Standards | Implement |
| 3 | Indoc | Training |
| 4 | Upkeep | Re-iterate |

A second system, `nature` ("Nature to Self"), maps Ecology -> Synergy, Seasonality -> Project Cycles,
Growth -> Development and Balance -> Balanced Scorecard.

- `GET /api/correspondence` returns the full framework: the law, both systems, the properties of a
  robust Below, the health checklist (Coherence, Resilience, Transparency) and the practices
  (The Reset, the Gemba Walk, Direct Reporting).
- `POST /api/correspondence/assess` scores alignment without calling Claude. For each level, rate
  `above` (how clearly the principle is defined) and `below` (how consistently it is practiced) from 1 to 5.
  Each level is classified as `aligned`, `drift` (Below lags Above), `unanchored` (practice without a
  defined principle) or `weak` (both low), and the response includes recommendations.
- `POST /api/correspondence/reflect` asks Claude to read a journal entry through the law: the Below,
  the Above, the correspondences, the drift, one Reset action and a reflective question.

Example: assessment
curl -X POST http://localhost:3000/api/correspondence/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "system": "organization",
    "levels": {
      "culture":   { "above": 5, "below": 4 },
      "standards": { "above": 5, "below": 2 },
      "indoc":     { "above": 3, "below": 3 },
      "upkeep":    { "above": 2, "below": 4 }
    },
    "checklist": { "coherence": 3, "resilience": 4, "transparency": 2 }
  }'

Example: reflection
curl -X POST http://localhost:3000/api/correspondence/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Monday",
    "content": "I say my health matters, but I skipped the gym again and ate at my desk.",
    "system": "nature"
  }'

Tests
npm test
