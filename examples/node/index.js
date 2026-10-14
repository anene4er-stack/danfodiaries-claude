import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-2';

if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY not set in environment.\nSet it in your shell or copy .env.example to .env and fill it.');
  process.exit(1);
}

const endpoint = 'https://api.anthropic.com/v1/complete';

async function callClaude(prompt) {
  const body = {
    model: MODEL,
    prompt,
    max_tokens: 300,
    temperature: 0.2
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data;
}

(async () => {
  const prompt = `Human: Write a short friendly summary (2-3 sentences) of why people enjoy journaling for the "DanfoDiaries" project.\n\nAssistant:`;

  try {
    const response = await callClaude(prompt);
    console.log('Raw response:', JSON.stringify(response, null, 2));

    // Many Anthropic responses put the assistant text in `completion` or similar fields depending on API version.
    if (response.completion) {
      console.log('\nAssistant output:\n', response.completion);
    } else if (response.choices && response.choices.length) {
      console.log('\nAssistant output:\n', response.choices.map(c => c.text || c.completion).join('\n'));
    } else {
      console.log('\nFull response object:\n', response);
    }
  } catch (err) {
    console.error('Error calling Claude:', err.message);
  }
})();
