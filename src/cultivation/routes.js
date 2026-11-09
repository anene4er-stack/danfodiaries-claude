import express from 'express';
import { getFramework, LAW } from './framework.js';
import { assessCultivation, ValidationError } from './assess.js';
import { buildCultivationSystemPrompt, buildCultivationUserPrompt } from './prompt.js';

// `anthropic` is injected so routes can be tested with a fake client.
export function createCultivationRouter({ anthropic, model }) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json(getFramework());
  });

  router.post('/assess', (req, res) => {
    try {
      res.json(assessCultivation(req.body || {}));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Assessment failed.' });
    }
  });

  router.post('/reflect', async (req, res) => {
    const { title, content, focus } = req.body || {};

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Journal content is required.' });
    }

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1200,
        system: buildCultivationSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: buildCultivationUserPrompt({ title, content: String(content).trim(), focus }),
          },
        ],
      });

      const reflection = response.content
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('\n')
        .trim();

      res.json({
        title: title || 'Untitled entry',
        maxim: LAW.maxim,
        reflection: reflection || 'No reflection returned.',
      });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: messageText });
    }
  });

  return router;
}
