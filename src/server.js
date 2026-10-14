import dotenv from 'dotenv';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'DanfoDiaries Claude API',
    status: 'ok',
    endpoints: ['/health', '/api/journal/reflect', '/api/chat']
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
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
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
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
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

app.listen(port, () => {
  console.log(`DanfoDiaries Claude app listening on http://localhost:${port}`);
});
