import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessProportionality, diagnose, fieldSize, surfaceAreaPercent, ValidationError } from '../src/proportionality/assess.js';
import { getFramework } from '../src/proportionality/framework.js';
import { createProportionalityRouter } from '../src/proportionality/routes.js';

const base = { depth: 4, nexus: 4, reach: 4, diversity: 4, availability: 4 };

test('framework exposes the three surface-area dimensions and the workflow', () => {
  const f = getFramework();
  assert.deepEqual(f.dimensions.map((d) => d.id), ['reach', 'diversity', 'availability']);
  assert.deepEqual(f.workflow.map((w) => w.id), ['validate-seed', 'systematize-sowing', 'audit-nexus']);
  assert.equal(f.nexusQuestions.length, 3);
});

test('surface area is the product of the three dimensions', () => {
  assert.equal(surfaceAreaPercent({ reach: 5, diversity: 5, availability: 5 }), 100);
  assert.equal(surfaceAreaPercent({ reach: 5, diversity: 5, availability: 1 }), 20);
  assert.equal(fieldSize(64), 'wide');
  assert.equal(fieldSize(51), 'moderate');
  assert.equal(fieldSize(22), 'narrow');
});

test('diagnose follows the workflow order', () => {
  assert.equal(diagnose({ depth: 2, nexus: 5, field: 'wide' }).id, 'wide-and-shallow');
  assert.equal(diagnose({ depth: 2, nexus: 5, field: 'narrow' }).id, 'validate-seed');
  assert.equal(diagnose({ depth: 5, nexus: 5, field: 'narrow' }).id, 'spear');
  assert.equal(diagnose({ depth: 5, nexus: 2, field: 'wide' }).id, 'nexus-at-risk');
  assert.equal(diagnose({ depth: 5, nexus: 5, field: 'moderate' }).id, 'widening');
  assert.equal(diagnose({ depth: 5, nexus: 5, field: 'wide' }).id, 'net');
});

test('a strong seed on a small field is a scale problem, not a skill problem', () => {
  const r = assessProportionality({ depth: 5, nexus: 5, reach: 2, diversity: 3, availability: 3, tests: { activeOnlyWhenAwake: true, primarySourceLoss: 'total-collapse' } });
  assert.equal(r.diagnosis.id, 'spear');
  assert.equal(r.weakestDimension.id, 'reach');
  const tests = Object.fromEntries(r.nexusQuestions.map((t) => [t.id, t]));
  assert.equal(tests.bottleneck.answer, 'scale');
  assert.equal(tests.leverage.passed, false);
  assert.match(tests.diversification.note, /surface area is zero/);
  assert.deepEqual(r.recommendations.map((x) => x.step), [
    'Systematize the Sowing (Surface Area): Reach',
    'Systematize the Sowing (Surface Area): Availability',
    'Systematize the Sowing (Surface Area): Diversity',
  ]);
});

test('a weak seed is validated first; a healthy net gets a maintenance step', () => {
  const weak = assessProportionality({ ...base, depth: 2 });
  assert.equal(weak.diagnosis.id, 'wide-and-shallow');
  assert.equal(weak.recommendations[0].step, 'Validate the Seed (Depth)');

  const net = assessProportionality({ depth: 5, nexus: 5, reach: 5, diversity: 4, availability: 5 });
  assert.equal(net.diagnosis.id, 'net');
  assert.equal(net.recommendations.length, 1);
  assert.equal(net.recommendations[0].step, 'Audit the Nexus');
});

test('validation rejects bad ratings and test answers', () => {
  assert.throws(() => assessProportionality({ ...base, reach: 0 }), ValidationError);
  assert.throws(() => assessProportionality({ ...base, depth: undefined }), /depth/);
  assert.throws(() => assessProportionality({ ...base, tests: { activeOnlyWhenAwake: 'yes' } }), /true or false/);
  assert.throws(() => assessProportionality({ ...base, tests: { primarySourceLoss: 'oops' } }), /one of/);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/proportionality', createProportionalityRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/proportionality`;
  try { await fn(url); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework and assess', async () => {
  await withServer({}, async (url) => {
    assert.match((await (await fetch(url)).json()).law.maxim, /scale of the seed/);
    assert.equal((await post(`${url}/assess`, base)).status, 200);
    assert.equal((await post(`${url}/assess`, {})).status, 400);
  });
});

test('HTTP reflect sends the proportionality prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**Spear or Net** ...' }] }; } } };
  await withServer(fake, async (url) => {
    assert.equal((await post(`${url}/reflect`, {})).status, 400);
    const res = await post(`${url}/reflect`, { content: 'I only sell my cakes to friends at church.' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reflection, '**Spear or Net** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /Input Surface Area/);
    assert.match(captured.messages[0].content, /cakes to friends/);
  });
});
