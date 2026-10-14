import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY not set in environment.');
  process.exit(1);
}

const client = new Anthropic({ apiKey: API_KEY });

const prompt = `
Human: Write a short, warm message about why journaling helps people feel more grounded and reflective for the DanfoDiaries app.

Assistant:
`;

const response = await client.messages.create({
  model: MODEL,
  max_tokens: 400,
  temperature: 0.4,
  messages: [{ role: 'user', content: prompt }],
});

const text = response.content
  .map((part) => (part.type === 'text' ? part.text : ''))
  .join('\n')
  .trim();

console.log(text || 'No response returned.');
