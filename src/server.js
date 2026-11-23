import dotenv from 'dotenv';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'node:url';
import { createCorrespondenceRouter } from './correspondence/routes.js';
import { createProportionalityRouter } from './proportionality/routes.js';
import { createCultivationRouter } from './cultivation/routes.js';
import { createCompensationRouter } from './compensation/routes.js';
import { createReciprocityRouter } from './reciprocity/routes.js';
import { createRhythmRouter } from './rhythm/routes.js';
import { createPolarityRouter } from './polarity/routes.js';
import {
  MAX_BODY, MAX_CHAT_CHARS, CHAT_SYSTEM_PROMPT, checkLengths, sendSafeError,
  createRateLimiter, securityHeaders, errorHandler,
} from './security.js';
import { createAuth } from './auth.js';

dotenv.config();

export const app = express();
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const port = Number(process.env.PORT || 3000);
const model = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

// The Anthropic client is created on first use, so a missing key never breaks
// startup or the assessments. Routes are given this wrapper instead of a client.
let client = null;
export const anthropic = {
  messages: {
    create: (...args) => {
      if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });
      return client.messages.create(...args);
    },
  },
};

// Anything that calls Claude is limited per visitor.
// Sign-in is checked first (when REQUIRE_AUTH=true), so limits can be counted per user.
const auth = createAuth();
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const aiLimiter = [auth.requireUser, limiter];
const requireKey = (_req, res, next) => {
  if (process.env.ANTHROPIC_API_KEY?.trim()) return next();
  res.status(503).json({
    error: 'Reflections are not set up on this site yet: no Anthropic API key is configured. Assessments still work.',
  });
};

app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json({ limit: MAX_BODY }));
app.use(express.static(publicDir));

app.get('/api', (_req, res) => {
  res.json({
    name: 'DanfoDiaries Claude API',
    status: 'ok',
    endpoints: [
      '/health',
      '/api/config',
      '/api/journal/reflect',
      '/api/chat',
      '/api/correspondence',
      '/api/correspondence/systems/:id',
      '/api/correspondence/assess',
      '/api/correspondence/reflect',
      '/api/proportionality',
      '/api/proportionality/assess',
      '/api/proportionality/reflect',
      '/api/cultivation',
      '/api/cultivation/assess',
      '/api/cultivation/reflect',
      '/api/compensation',
      '/api/compensation/assess',
      '/api/compensation/reflect',
      '/api/reciprocity',
      '/api/reciprocity/assess',
      '/api/reciprocity/reflect',
      '/api/rhythm',
      '/api/rhythm/assess',
      '/api/rhythm/reflect',
      '/api/polarity',
      '/api/polarity/assess',
      '/api/polarity/reflect',
    ]
  });
});

app.get('/api/config', (_req, res) => {
  res.json(auth.publicConfig());
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'danfodiaries-claude' });
});

app.post('/api/chat', ...aiLimiter, requireKey, async (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  if (message.length > MAX_CHAT_CHARS) {
    return res.status(400).json({ error: `Message must be ${MAX_CHAT_CHARS} characters or fewer.` });
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      temperature: 0.4,
      system: CHAT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message.trim() }],
    });

    const text = response.content
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('\n')
      .trim();

    res.json({ reply: text || 'No response returned.' });
  } catch (error) {
    sendSafeError(res, error);
  }
});

app.post('/api/journal/reflect', ...aiLimiter, requireKey, async (req, res) => {
  const { title, content, mood = 'neutral' } = req.body || {};

  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'Journal content is required.' });
  }
  const lengthError = checkLengths({ title, content });
  if (lengthError) return res.status(400).json({ error: lengthError });
  if (typeof mood !== 'string' || mood.length > 30) {
    return res.status(400).json({ error: 'Mood must be a short text value.' });
  }

  try {
    const prompt = `
You are a thoughtful journaling assistant for DanfoDiaries.

Title: ${title || 'Untitled entry'}
Mood: ${mood}
Entry:
${content}

Provide:
1. A warm, supportive summary of the entry.
2. 3 reflective questions the writer can consider.
3. A short affirmation.
`;

    const response = await anthropic.messages.create({
      model,
      max_tokens: 700,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }],
    });

    const reflection = response.content
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('\n')
      .trim();

    res.json({
      title: title || 'Untitled entry',
      mood,
      reflection: reflection || 'No reflection returned.'
    });
  } catch (error) {
    sendSafeError(res, error);
  }
});

// Reflections call Claude. Without a key (e.g. a hosted site that only offers
// assessments), answer every reflect request with a clear message instead of an error.
app.post('/api/:law/reflect', ...aiLimiter, requireKey);

app.use('/api/correspondence', createCorrespondenceRouter({ anthropic, model }));
app.use('/api/proportionality', createProportionalityRouter({ anthropic, model }));
app.use('/api/cultivation', createCultivationRouter({ anthropic, model }));
app.use('/api/compensation', createCompensationRouter({ anthropic, model }));
app.use('/api/reciprocity', createReciprocityRouter({ anthropic, model }));
app.use('/api/rhythm', createRhythmRouter({ anthropic, model }));
app.use('/api/polarity', createPolarityRouter({ anthropic, model }));

app.use(errorHandler);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`DanfoDiaries Claude app listening on http://localhost:${port}`);
  });
}
