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
- GET /api/proportionality
- POST /api/proportionality/assess
- POST /api/proportionality/reflect
- GET /api/cultivation
- POST /api/cultivation/assess
- POST /api/cultivation/reflect

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

Law of Proportionality ("The volume of the harvest is determined by the scale of the seed")
Built from the Law of Proportionality notes: the move from Linear Effort (the Spear) to Systemic Scale
(the Net). If the harvest is consistently small, the bottleneck is the size of the field, not your work ethic.

Input Surface Area has three dimensions:

| Dimension | Definition | How to increase |
| --- | --- | --- |
| Reach | People, markets or problems exposed to your Seed | Repeatable content, networks, distribution platforms |
| Diversity | Different types of Seeds planted at once | A stack of assets, not one skill |
| Availability | How long your Seeds stay active | Move from synchronous to asynchronous work |

- `GET /api/proportionality` returns the framework: the law, the Spear and the Net, the three dimensions,
  the benefits of surface area, the "Wide and Shallow" trap, the workflow (Validate the Seed, Systematize
  the Sowing, Audit the Nexus) and the three Nexus Questions.
- `POST /api/proportionality/assess` scores your field without calling Claude. Rate `depth` (seed quality),
  `nexus` (core intent), `reach`, `diversity` and `availability` from 1 to 5. Surface area is
  Reach x Diversity x Availability as a percentage, so one weak dimension shrinks the whole field.
  The diagnosis follows the workflow order (do not scale garbage):
  `wide-and-shallow`, `validate-seed`, `spear`, `nexus-at-risk`, `widening` or `net`.
  Optional `tests` answer the Leverage Test (`activeOnlyWhenAwake`: true/false) and the Diversification Test
  (`primarySourceLoss`: `total-collapse`, `major-setback` or `minor-setback`); the Bottleneck Test is
  answered from the ratings.
- `POST /api/proportionality/reflect` asks Claude to read a journal entry through the law: Spear or Net,
  the Seed, the three dimensions, the Nexus Questions, one step to widen the field and a reflective question.

Example: assessment
curl -X POST http://localhost:3000/api/proportionality/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "depth": 5, "nexus": 4,
    "reach": 2, "diversity": 3, "availability": 2,
    "tests": { "activeOnlyWhenAwake": true, "primarySourceLoss": "total-collapse" }
  }'

Example: reflection
curl -X POST http://localhost:3000/api/proportionality/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Cake orders",
    "content": "My cakes sell out every Sunday, but I only sell to friends at church and I bake every order myself."
  }'

Law of Cultivation ("Whatever you don't cultivate, you will lose")
Built from the Law of Cultivation notes: work is the only currency that produces a yield, and a gift
left "in a box" loses its value. The flow is Task -> Effort -> Compensation -> Reward, where effort is
the multiplier: a "+" effort amplifies the reward and a "-" effort reduces it.

Each field (a talent, relationship or project) is on one of three paths:

| Effort | Path | Result |
| --- | --- | --- |
| `cultivate` | The Diligent Path | Good Reward, moving through Incubation -> Transition -> Harvest |
| `neglect` | The Slothful Path | Bad Reward: the field is "in a box" |
| `shortcut` | The Extractionist Path | Task without work: the Ownership Clause reclaims the reward |

- `GET /api/cultivation` returns the framework: the axiom, the flow, the three paths, Extractionist vs.
  Cultivator, the Terms of Service (Proportionality, Non-Delegation, Lag-Time, Ownership), the
  Cultivation Cycle, the Reception Protocol, the force multipliers (Leverage, Reinvestment levels,
  the Nexus Audit) and Reciprocity.
- `POST /api/cultivation/assess` audits your fields without calling Claude. Send 1 to 20 `fields`, each
  with a `name`, an `effort` and, for cultivated fields, `returns` (`none`, `growing` or `massive`), which
  places it in the Cultivation Cycle. Optional inputs:
  `reinvestment` (`consume`, `seeds` or `soil`: Levels 1-3), `containerBreaksAt10x` (true/false: the
  Reception audit) and `leverage` (any of `technology`, `people`, `content`).
  The response gives your cultivation rate, a profile (`cultivator`, `cultivator-with-boxes`,
  `steward-at-risk` or `extractionist`), each field's state, your boxes and recommendations.
- `POST /api/cultivation/reflect` asks Claude to read a journal entry through the law: the fields, the
  effort sign, the cycle phase, the most relevant Term of Service, one unit of cultivation for today and
  a reflective question.

Example: assessment
curl -X POST http://localhost:3000/api/cultivation/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": [
      { "name": "Writing", "effort": "cultivate", "returns": "none" },
      { "name": "Guitar", "effort": "neglect" },
      { "name": "Family", "effort": "cultivate", "returns": "massive" }
    ],
    "reinvestment": "consume",
    "containerBreaksAt10x": true,
    "leverage": []
  }'

Example: reflection
curl -X POST http://localhost:3000/api/cultivation/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Sunday",
    "content": "I wrote every morning this week but nobody is reading yet. I have not touched my guitar in months."
  }'

Tests
npm test
