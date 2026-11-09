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

Web page
Run `npm start` and open http://localhost:3000 in your browser. There is a tab for each law. Each tab
has an assessment form, pre-filled with an example so you can run it straight away, and a reflection
box where Claude reads a journal entry through that law. Results are shown as readable text, with the
full JSON underneath. Reflections need `ANTHROPIC_API_KEY` in `.env`.

Endpoints
- GET /health
- GET /api (lists the endpoints; the web page is served at /)
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
- GET /api/compensation
- POST /api/compensation/assess
- POST /api/compensation/reflect
- GET /api/reciprocity
- POST /api/reciprocity/assess
- POST /api/reciprocity/reflect
- GET /api/rhythm
- POST /api/rhythm/assess
- POST /api/rhythm/reflect
- GET /api/polarity
- POST /api/polarity/assess
- POST /api/polarity/reflect

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

Law of Compensation ("What you give, you get")
Built from the notes in the "Law of Compensation" Drive folder. The law is cause and effect applied to
abundance: the seeds you sow come back as the harvest, as infallibly as gravitation. Its core formula:

    Total Harvest = (Quality of Seed x Volume of Input) x Stewardship Factor

Stewardship is the multiplier: at 0 the harvest is 0 no matter how many seeds you sow, at 1 you get
exactly what you put in, and above 1 small inputs are protected until they compound.

- `GET /api/compensation` returns the framework: the law, the harvest formula, the Key to Symbols, the
  Seed and Harvest mechanism, the Dynamics of Flow (Gratitude vs. Bypass), the Volume Mandate, Stewardship
  and its audit, the Feedback Loop, the 4-Stage Process, the Abundance Cycle, the Mirror Audit and the
  Shadow. It shares the Terms of Service and the effort/return curve with the Law of Cultivation.
- `POST /api/compensation/assess` runs the numbers for one cycle (for example, one week) without calling
  Claude. Send `seedQuality` (1-5), `seedsPerWeek`, `germinating` (how many got a response),
  `targetHarvests`, `stewardship` (0-5, mapped to a factor of 0, 0.5, 0.75, 1, 1.5 or 2) and
  `cycleComplete` (has the cycle had time to mature?). It returns:
  - the harvest index from the formula (relative: compare it cycle to cycle);
  - the Volume Mandate math: germination rate and how many seeds you need to reach the target
    (10% germination and 50 harvests means 500 seeds);
  - the Calibration Protocol verdict: `no-sowing`, `successful` (codify your Golden Seed), `lag-phase`
    (noise, not signal: do not pivot yet), `zero-stewardship`, `weak-seed` or `insufficient-volume`;
  - the weekly Diagnostic Audit (Input Quality, Input Volume, Stewardship, The Yield) and recommendations.
  Optional: `audit` answers the Stewardship Audit (`weedsLowYield`, `reinvestsHarvest`, `governance`:
  `reacting` or `setting-terms`), and `receivesWithGratitude` checks the Flow.
- `POST /api/compensation/reflect` asks Claude to read a journal entry through the law: Seed and Harvest,
  the formula, Noise or Signal, the Mirror Audit (Stop, Trace, Re-Calibrate), the Flow, one recalibration
  and a reflective question.

Example: assessment
curl -X POST http://localhost:3000/api/compensation/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "seedQuality": 4,
    "seedsPerWeek": 20,
    "germinating": 1,
    "targetHarvests": 5,
    "stewardship": 2,
    "cycleComplete": true,
    "audit": { "weedsLowYield": true, "reinvestsHarvest": false, "governance": "reacting" },
    "receivesWithGratitude": true
  }'

Example: reflection
curl -X POST http://localhost:3000/api/compensation/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Pitches",
    "content": "I sent 20 pitches this week and only one person replied. I am starting to think nobody wants what I make."
  }'

Law of Reciprocity ("The same measure you use is the measure returned to you")
There is no single Reciprocity note in Drive, so this is built from the sections on it inside other notes:
the Law of Reciprocity (Leadership & Human Exchange) in the Law of Cultivation guide, the Unified Theory of
Universal Reciprocity, the Mirror Principle, and Reciprocity in the Law of Rhythm Peak notes. Where the
Law of Compensation is about your work, this law is about your relationships and the people you lead:
"You get what you pay for." The reward you offer sets the effort you receive.

- `GET /api/reciprocity` returns the framework: the law, the Quality Feedback Loop, the three things you
  offer others (Environment, Appreciation, Resources), the Mirror (including Audit the Measure), the Flow
  (shared with the Law of Compensation) and Goodwill at the Peak.
- `POST /api/reciprocity/assess` audits up to 20 relationships without calling Claude. For each, rate what
  you `offered` (`environment`, `appreciation`, `resources`, 1-5) and what you `received` back (1-5).
  Optional per relationship: `measureMatches` (would you accept the measure you use on them?) and
  `gratitude` (do you acknowledge what they give?). Optional overall: `inPeak`.
  Each relationship is classified as `good-measure`, `balanced`, `sloppy-reward` (low reward, low effort),
  `overdrawn` (they give far more than you offer) or `unreturned` (you give far more than comes back).
  The Mirror reports your average offer vs. return, and flags a pattern when the same offer is your
  lowest in most relationships, since the common factor is what you bring.
- `POST /api/reciprocity/reflect` asks Claude to read a journal entry through the law: the exchange, the
  reward offered, the Mirror, Audit the Measure, the Flow, one generous seed and a reflective question.

Example: assessment
curl -X POST http://localhost:3000/api/reciprocity/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "relationships": [
      { "name": "Team", "offered": { "environment": 4, "appreciation": 2, "resources": 3 }, "received": 2 },
      { "name": "Partner", "offered": { "environment": 4, "appreciation": 2, "resources": 5 }, "received": 3, "gratitude": false },
      { "name": "Mentor", "offered": { "environment": 3, "appreciation": 3, "resources": 2 }, "received": 5, "measureMatches": true }
    ],
    "inPeak": true
  }'

Example: reflection
curl -X POST http://localhost:3000/api/reciprocity/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Team meeting",
    "content": "Nobody on my team volunteered for the new project. I always have to push them. I cannot remember the last time I thanked them for anything."
  }'

Law of Rhythm ("This too shall pass")
Built from the Law of Rhythm notes: everything moves in cycles, and any structure that rises must fall.
The Master aligns with the season and keeps their internal Frequency steady.

| Season | Stage | Aligned focus | Trap |
| --- | --- | --- | --- |
| Peak | Maximum Potential Energy | Stewardship | Growth Addiction |
| Descending | Harvest and Consolidation | Consolidation | The Force Trap |
| Valley | Foundation and Regeneration | Restoration | The Guilt Loop |
| Ascending | Initialization and Planting | Experimentation | The Haste Trap |

- `GET /api/rhythm` returns the framework: the law and its mantras, each season (markers, objectives,
  trap, Frequency drift and anchor, master thought, success metrics, checklist), the Attachment,
  Awareness and Alignment strategies, the Frequency Guards, Rhythm Mastery and the daily practice cards.
- `POST /api/rhythm/assess` locates you in the cycle without calling Claude.
  - Name your `season`, or send `signals` (`momentum` 1-5 and `trend`: `rising`, `steady` or `falling`)
    to have it diagnosed. Medium momentum holding steady sits between seasons, so you are asked to name it.
  - `activity` is what you are doing: `executing`, `consolidating`, `restoring`, `experimenting` or
    `pushing` (forcing results, launching all-in). Alignment is `aligned`, `trap` (pushing falls into the
    season's trap), `overreaching` (burnout risk), `under-using` (missed opportunity) or `mismatched`.
  - Optional: `frequency` (`actingFromValues` 1-5, `keptRoutine`) checks for Frequency Drift;
    `attachments` (`name`, `trend`: `rising`, `stable` or `falling`, `wouldCollapseWithIt`) runs the
    Falling Structure Test; `monthsInSeason` suggests a Forced Valley or Forced Peak after 3 months.
  - Returns the season, alignment, frequency, attachments, recommendations and the daily practice cards.
- `POST /api/rhythm/reflect` asks Claude to read a journal entry through the law: the season, with or
  against the tide, Frequency, attachments, the master thought, one seasonal action and a reflective question.

Example: assessment
curl -X POST http://localhost:3000/api/rhythm/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "signals": { "momentum": 4, "trend": "falling" },
    "activity": "pushing",
    "frequency": { "actingFromValues": 3, "keptRoutine": true },
    "attachments": [
      { "name": "Side project", "trend": "falling", "wouldCollapseWithIt": false },
      { "name": "Writing group", "trend": "rising" }
    ],
    "monthsInSeason": 2
  }'

Example: reflection
curl -X POST http://localhost:3000/api/rhythm/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Quiet month",
    "content": "No new clients for weeks. I keep sending cold emails and thinking about lowering my prices. I feel useless."
  }'

Law of Polarity ("Everything is on a continuum")
Built from the Law of Polarity notes: opposites are the same thing at different degrees, so you do not
destroy a negative state; you move along its scale to the opposite pole. Replace, don't suppress, because
whatever you focus on, you feed. The notes also cover Selective Attention, Perception as Projection
(the Mirror Effect) and the language of agency.

The scales from the notes (low pole -> high pole): Anxiety -> Excitement, Fear -> Courage,
Criticism -> Insight, Scarcity -> Abundance, Separation -> Connection, Shame -> Data,
Apathy -> Craftsmanship, Impatience -> Preparation, Resistance -> Utilization.

- `GET /api/polarity` returns the framework: the law, the nine scales and how to shift each one, pattern
  interrupts, the Attentional Budget and its seven leaks with their fixes, the Mirror Effect (Shadow,
  Golden Shadow, Envy Audit, Lens, the Contribution Question), the language swaps, the agency tools
  (the stimulus-response gap, the Weather Report, the Observer Self, the Calibration Loop) and the daily
  checklist.
- `POST /api/polarity/assess` runs without calling Claude. Send a `scale` and your `position` on it
  (1 = at the low pole, 5 = at the high pole). Optional:
  - `attention`: `signalHours`, `noiseHours`, `openLoops` and `leaks` (`notifications`, `task-switching`,
    `rumination`, `worry`, `social-media`, `news`, `clutter`). You are `leaking` when noise hours match
    or exceed signal hours.
  - `mirror`: a `trait` in someone else and your `reaction` (`irritation`, `admiration` or `envy`), plus
    `pattern` if you react this way to many people (the Lens Effect).
  - `selfTalk`: text to run the Agency Audit on. It finds phrases like "I have to", "I am stressed",
    "I'm a failure", "this is a problem" and "is killing me", and suggests the swap from the notes.
  It returns where you are on the scale, the attention audit, the mirror reading, the language findings,
  recommendations and the daily checklist.
- `POST /api/polarity/reflect` asks Claude to read a journal entry through the law: the pole, the
  frequency, the mirror, attention leaks, the shift, one pattern interrupt and a reflective question. The
  prompt tells Claude that a reframe is never a substitute for support when an entry describes a crisis.

Example: assessment
curl -X POST http://localhost:3000/api/polarity/assess \
  -H 'Content-Type: application/json' \
  -d '{
    "scale": "anxiety-excitement",
    "position": 2,
    "attention": { "signalHours": 3, "noiseHours": 4, "openLoops": 5, "leaks": ["notifications"] },
    "mirror": { "trait": "confidence", "reaction": "admiration" },
    "selfTalk": "I have to give this talk and I am so nervous."
  }'

Example: reflection
curl -X POST http://localhost:3000/api/polarity/reflect \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Before the talk",
    "content": "My presentation is tomorrow and my heart is racing. Everyone else on the panel seems so confident."
  }'

Tests
npm test
