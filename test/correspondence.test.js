import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessCorrespondence, classifyLevel, ValidationError } from '../src/correspondence/assess.js';
import { getFramework, SYSTEMS } from '../src/correspondence/framework.js';
import { createCorrespondenceRouter } from '../src/correspondence/routes.js';

const allAligned = { culture: { above: 5, below: 5 }, standards: { above: 4, below: 4 }, indoc: { above: 4, below: 5 }, upkeep: { above: 5, below: 4 } };

test('framework exposes the four Above -> Below levels from the sketch', () => {
  const pairs = getFramework().systems.organization.levels.map((l) => `${l.above}->${l.below}`);
  assert.deepEqual(pairs, ['Culture->Leadership', 'Standards->Implement', 'Indoc->Training', 'Upkeep->Re-iterate']);
  assert.equal(SYSTEMS.nature.levels.length, 4);
});

test('classifyLevel detects drift, unanchored, weak and aligned', () => {
  assert.equal(classifyLevel(5, 2).status, 'drift');
  assert.equal(classifyLevel(1, 4).status, 'unanchored');
  assert.equal(classifyLevel(2, 2).status, 'weak');
  assert.equal(classifyLevel(4, 5).status, 'aligned');
  assert.equal(classifyLevel(5, 5).likeness, 100);
  assert.equal(classifyLevel(5, 1).likeness, 0);
});

test('aligned system gets a strong verdict and a maintenance Reset', () => {
  const r = assessCorrespondence({ levels: allAligned });
  assert.equal(r.alignment, 88);
  assert.match(r.verdict, /strong correspondence/);
  assert.equal(r.recommendations.length, 1);
  assert.equal(r.recommendations[0].practice, 'The Reset');
});

test('drift and checklist failures produce targeted recommendations', () => {
  const r = assessCorrespondence({
    levels: { ...allAligned, standards: { above: 5, below: 2 } },
    checklist: { coherence: 2, resilience: 5, transparency: 3 },
  });
  assert.equal(r.weakestLevel.id, 'standards');
  assert.match(r.verdict, /Out of correspondence/);
  const practices = r.recommendations.map((x) => x.practice);
  assert.deepEqual(practices, ['The Reset', 'The Gemba Walk', 'Direct Reporting']);
  assert.equal(r.checklist.find((c) => c.id === 'coherence').observation, 'The worker sees tasks as arbitrary "busy work."');
});

test('validation rejects missing levels, bad ratings and unknown systems', () => {
  assert.throws(() => assessCorrespondence({ levels: {} }), ValidationError);
  assert.throws(() => assessCorrespondence({ levels: { ...allAligned, culture: { above: 6, below: 1 } } }), /1 to 5/);
  assert.throws(() => assessCorrespondence({ system: 'x', levels: allAligned }), /Unknown system/);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/correspondence', createCorrespondenceRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/correspondence`;
  try { await fn(base); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework, systems, assess', async () => {
  await withServer({}, async (base) => {
    assert.equal((await (await fetch(base)).json()).law.maxim, 'As above, so below.');
    assert.equal((await fetch(`${base}/systems/nope`)).status, 404);
    assert.equal((await (await fetch(`${base}/systems/nature`)).json()).id, 'nature');
    const ok = await post(`${base}/assess`, { levels: allAligned });
    assert.equal(ok.status, 200);
    assert.equal((await post(`${base}/assess`, { levels: {} })).status, 400);
  });
});

test('HTTP reflect sends the correspondence prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**The Below** ...' }] }; } } };
  await withServer(fake, async (base) => {
    assert.equal((await post(`${base}/reflect`, {})).status, 400);
    const res = await post(`${base}/reflect`, { title: 'Monday', content: 'I keep saying health matters but skipped the gym again.', system: 'nature' });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.reflection, '**The Below** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /Nature to Self/);
    assert.match(captured.messages[0].content, /skipped the gym/);
  });
});
