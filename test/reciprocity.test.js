import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessReciprocity, classifyExchange, ValidationError } from '../src/reciprocity/assess.js';
import { getFramework } from '../src/reciprocity/framework.js';
import { createReciprocityRouter } from '../src/reciprocity/routes.js';

const rel = (name, environment, appreciation, resources, received, extra = {}) => ({
  name, offered: { environment, appreciation, resources }, received, ...extra,
});

test('framework exposes the offer dimensions and reuses the Compensation flow states', () => {
  const f = getFramework();
  assert.deepEqual(f.offerDimensions.map((d) => d.id), ['environment', 'appreciation', 'resources']);
  assert.equal(f.flow.bypass.receiver, 'Self-Absorbed');
  assert.match(f.law.maxim, /same measure/);
});

test('classifyExchange', () => {
  assert.equal(classifyExchange(2, 4).status, 'overdrawn');
  assert.equal(classifyExchange(4.5, 2).status, 'unreturned');
  assert.equal(classifyExchange(2, 2).status, 'sloppy-reward');
  assert.equal(classifyExchange(4, 4).status, 'good-measure');
  assert.equal(classifyExchange(3, 3).status, 'balanced');
});

test('per-relationship recommendations, the measure and the flow', () => {
  const r = assessReciprocity({
    relationships: [
      rel('Ada', 2, 2, 3, 2, { measureMatches: false }),
      rel('Bayo', 3, 2, 3, 5, { gratitude: false }),
      rel('Chi', 5, 4, 5, 2),
    ],
  });
  const byName = Object.fromEntries(r.relationships.map((x) => [x.name, x]));
  assert.equal(byName.Ada.rewardInput, 2.3);
  assert.equal(byName.Ada.status, 'sloppy-reward');
  assert.equal(byName.Ada.weakestOffer.id, 'environment');
  assert.equal(byName.Bayo.status, 'overdrawn');
  assert.equal(byName.Bayo.flow, 'bypass');
  assert.equal(byName.Chi.status, 'unreturned');
  assert.equal(r.mirror.pattern, null);
  assert.deepEqual(r.recommendations.map((x) => x.practice), [
    'You Get What You Pay For',
    'Repay the Account',
    'Check the Ground',
    'Audit the Measure',
    'Restore the Flow',
  ]);
});

test('the mirror finds the offer you keep shortchanging', () => {
  const r = assessReciprocity({
    relationships: [rel('A', 4, 2, 4, 3), rel('B', 5, 1, 4, 2), rel('C', 4, 3, 5, 3), rel('D', 5, 5, 4, 5)],
    inPeak: true,
  });
  assert.equal(r.mirror.pattern.dimension, 'appreciation');
  assert.equal(r.mirror.pattern.count, 3);
  assert.equal(r.recommendations[0].practice, 'The Mirror');
  // B is sloppy on appreciation, which the Mirror already covers, so it gets no separate entry.
  assert.ok(!r.recommendations.some((x) => x.practice === 'You Get What You Pay For'));
  assert.equal(r.recommendations.at(-1).practice, 'Build Goodwill at the Peak');
});

test('healthy exchanges get the Good Measure', () => {
  const r = assessReciprocity({ relationships: [rel('Team', 4, 5, 4, 4, { measureMatches: true, gratitude: true })] });
  assert.equal(r.relationships[0].status, 'good-measure');
  assert.equal(r.relationships[0].flow, 'flow');
  assert.deepEqual(r.recommendations.map((x) => x.practice), ['The Good Measure']);
});

test('validation', () => {
  assert.throws(() => assessReciprocity({}), ValidationError);
  assert.throws(() => assessReciprocity({ relationships: [{ name: 'A', received: 3 }] }), /offered/);
  assert.throws(() => assessReciprocity({ relationships: [rel('A', 6, 3, 3, 3)] }), /environment/);
  assert.throws(() => assessReciprocity({ relationships: [rel('', 3, 3, 3, 3)] }), /name/);
  assert.throws(() => assessReciprocity({ relationships: [rel('A', 3, 3, 3, 3, { gratitude: 'yes' })] }), /true or false/);
  assert.throws(() => assessReciprocity({ relationships: [rel('A', 3, 3, 3, 3)], inPeak: 1 }), /inPeak/);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/reciprocity', createReciprocityRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/reciprocity`;
  try { await fn(url); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework and assess', async () => {
  await withServer({}, async (url) => {
    assert.match((await (await fetch(url)).json()).law.maxim, /same measure/);
    assert.equal((await post(`${url}/assess`, { relationships: [rel('A', 3, 3, 3, 3)] })).status, 200);
    assert.equal((await post(`${url}/assess`, {})).status, 400);
  });
});

test('HTTP reflect sends the reciprocity prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**The Exchange** ...' }] }; } } };
  await withServer(fake, async (url) => {
    assert.equal((await post(`${url}/reflect`, {})).status, 400);
    const res = await post(`${url}/reflect`, { content: 'My team never goes the extra mile for me.' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reflection, '**The Exchange** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /Appreciation/);
    assert.match(captured.messages[0].content, /extra mile/);
  });
});
