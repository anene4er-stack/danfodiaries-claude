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

dotenv.config();

export const app = express();
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const port = Number(process.env.PORT || 3000);
const model = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static(publicDir));

app.get('/api', (_req, res) => {
  res.json({
    name: 'DanfoDiaries Claude API',
    status: 'ok',
    endpoints: [
      '/health',
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'danfodiaries-claude' });
});

app.post('/api/chat', async (req, res) => {
  const { message, systemPrompt } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      temperature: 0.4,
      system: systemPrompt || 'You are a helpful writing assistant for DanfoDiaries.',
      messages: [{ role: 'user', content: String(message).trim() }],
    });

    const text = response.content
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('\n')
      .trim();

    res.json({ reply: text || 'No response returned.', raw: response });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: messageText });
  }
});

app.post('/api/journal/reflect', async (req, res) => {
  const { title, content, mood = 'neutral' } = req.body || {};

  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'Journal content is required.' });
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
    const messageText = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: messageText });
  }
});

// Reflections call Claude. Without a key (e.g. a hosted site that only offers
// assessments), answer every reflect request with a clear message instead of an error.
app.post('/api/:law/reflect', (_req, res, next) => {
  if (process.env.ANTHROPIC_API_KEY) return next();
  res.status(503).json({
    error: 'Reflections are not set up on this site yet: no Anthropic API key is configured. Assessments still work.',
  });
});

app.use('/api/correspondence', createCorrespondenceRouter({ anthropic, model }));
app.use('/api/proportionality', createProportionalityRouter({ anthropic, model }));
app.use('/api/cultivation', createCultivationRouter({ anthropic, model }));
app.use('/api/compensation', createCompensationRouter({ anthropic, model }));
app.use('/api/reciprocity', createReciprocityRouter({ anthropic, model }));
app.use('/api/rhythm', createRhythmRouter({ anthropic, model }));
app.use('/api/polarity', createPolarityRouter({ anthropic, model }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`DanfoDiaries Claude app listening on http://localhost:${port}`);
  });
}
