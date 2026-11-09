import express from 'express';
import { getFramework, SYSTEMS } from './framework.js';
import { assessCorrespondence, ValidationError } from './assess.js';
import { buildCorrespondenceSystemPrompt, buildCorrespondenceUserPrompt } from './prompt.js';

// `anthropic` is injected so routes can be tested with a fake client.
export function createCorrespondenceRouter({ anthropic, model }) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json(getFramework());
  });

  router.get('/systems/:id', (req, res) => {
    const system = SYSTEMS[req.params.id];
    if (!system) {
      return res.status(404).json({ error: `Unknown system "${req.params.id}".` });
    }
    res.json(system);
  });

  router.post('/assess', (req, res) => {
    try {
      res.json(assessCorrespondence(req.body || {}));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Assessment failed.' });
    }
  });

  router.post('/reflect', async (req, res) => {
    const { title, content, focus, system = 'organization' } = req.body || {};

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Journal content is required.' });
    }
    if (!SYSTEMS[system]) {
      return res.status(400).json({ error: `Unknown system "${system}".` });
    }

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1200,
        system: buildCorrespondenceSystemPrompt(system),
        messages: [
          {
            role: 'user',
            content: buildCorrespondenceUserPrompt({ title, content: String(content).trim(), focus }),
          },
        ],
      });

      const reflection = response.content
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('\n')
        .trim();

      res.json({
        title: title || 'Untitled entry',
        maxim: 'As above, so below.',
        system,
        reflection: reflection || 'No reflection returned.',
      });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: messageText });
    }
  });

  return router;
}
