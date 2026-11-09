import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessCultivation, classifyField, ValidationError } from '../src/cultivation/assess.js';
import { getFramework } from '../src/cultivation/framework.js';
import { createCultivationRouter } from '../src/cultivation/routes.js';

test('framework exposes the flow, the terms of service and the cycle', () => {
  const f = getFramework();
  assert.deepEqual(f.flow.map((x) => x.name), ['Task', 'Effort', 'Compensation', 'Reward']);
  assert.deepEqual(f.terms.map((t) => t.id), ['proportionality', 'non-delegation', 'lag-time', 'ownership']);
  assert.deepEqual(f.cycle.map((c) => c.id), ['incubation', 'transition', 'harvest']);
  assert.equal(f.forceMultipliers.reinvestment.soil.level, 3);
});

test('classifyField maps effort and returns to a path and phase', () => {
  assert.equal(classifyField({ effort: 'neglect', returns: 'massive' }).state, 'boxed');
  assert.equal(classifyField({ effort: 'shortcut', returns: 'massive' }).state, 'unowned');
  assert.equal(classifyField({ effort: 'cultivate', returns: 'none' }).state, 'incubation');
  assert.match(classifyField({ effort: 'cultivate', returns: 'none' }).note, /no visible return/);
  assert.equal(classifyField({ effort: 'cultivate', returns: 'growing' }).state, 'transition');
  assert.equal(classifyField({ effort: 'cultivate', returns: 'massive' }).phase.output, 'Massive return');
});

test('boxes, shortcuts, small containers and consumption each get a recommendation', () => {
  const r = assessCultivation({
    fields: [
      { name: 'Writing', effort: 'cultivate', returns: 'none' },
      { name: 'Guitar', effort: 'neglect' },
      { name: 'Side hustle', effort: 'shortcut', returns: 'growing' },
      { name: 'Family', effort: 'cultivate', returns: 'massive' },
    ],
    reinvestment: 'consume',
    containerBreaksAt10x: true,
    leverage: [],
  });
  assert.equal(r.cultivationRate, 50);
  assert.equal(r.profile.id, 'steward-at-risk');
  assert.deepEqual(r.boxes, ['Guitar']);
  assert.deepEqual(r.recommendations.map((x) => x.practice), [
    'Audit Your Boxes',
    'The Ownership Clause',
    'The Lag-Time Clause',
    'Strengthen the Container',
    'Reinvestment: Level 2 (Growth)',
    'Leverage (Systemic Sowing)',
  ]);
  assert.match(r.recommendations[0].action, /Guitar today/);
});

test('profiles: cultivator, cultivator with boxes, extractionist', () => {
  const c = (effort) => ({ name: effort, effort, returns: 'growing' });
  assert.equal(assessCultivation({ fields: [c('cultivate')] }).profile.id, 'cultivator');
  assert.equal(assessCultivation({ fields: [c('cultivate'), c('cultivate'), c('neglect')] }).profile.id, 'cultivator-with-boxes');
  assert.equal(assessCultivation({ fields: [c('cultivate'), c('neglect')] }).profile.id, 'steward-at-risk');
  assert.equal(assessCultivation({ fields: [c('cultivate'), c('shortcut')] }).profile.id, 'extractionist');
});

test('a fully tended, reinvested system gets the Nexus Audit', () => {
  const r = assessCultivation({
    fields: [{ name: 'Bakery', effort: 'cultivate', returns: 'massive' }],
    reinvestment: 'soil',
    containerBreaksAt10x: false,
    leverage: ['technology', 'people'],
  });
  assert.equal(r.container, 'ready');
  assert.equal(r.recommendations.length, 1);
  assert.equal(r.recommendations[0].practice, 'The Nexus Audit');
});

test('validation', () => {
  const ok = [{ name: 'A', effort: 'cultivate' }];
  assert.throws(() => assessCultivation({}), ValidationError);
  assert.throws(() => assessCultivation({ fields: [{ name: '', effort: 'cultivate' }] }), /name/);
  assert.throws(() => assessCultivation({ fields: [{ name: 'A', effort: 'rest' }] }), /effort/);
  assert.throws(() => assessCultivation({ fields: [{ name: 'A', effort: 'cultivate', returns: 'lots' }] }), /returns/);
  assert.throws(() => assessCultivation({ fields: ok, reinvestment: 'spend' }), /reinvestment/);
  assert.throws(() => assessCultivation({ fields: ok, containerBreaksAt10x: 'no' }), /true or false/);
  assert.throws(() => assessCultivation({ fields: ok, leverage: ['luck'] }), /leverage/);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/cultivation', createCultivationRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/cultivation`;
  try { await fn(url); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework and assess', async () => {
  await withServer({}, async (url) => {
    assert.match((await (await fetch(url)).json()).law.maxim, /don't cultivate/);
    assert.equal((await post(`${url}/assess`, { fields: [{ name: 'A', effort: 'cultivate' }] })).status, 200);
    assert.equal((await post(`${url}/assess`, {})).status, 400);
  });
});

test('HTTP reflect sends the cultivation prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**The Fields** ...' }] }; } } };
  await withServer(fake, async (url) => {
    assert.equal((await post(`${url}/reflect`, {})).status, 400);
    const res = await post(`${url}/reflect`, { content: "I haven't touched my guitar in months." });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reflection, '**The Fields** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /Lag-Time Clause/);
    assert.match(captured.messages[0].content, /guitar/);
  });
});
