import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessCompensation, stewardshipFor, ValidationError } from '../src/compensation/assess.js';
import { getFramework } from '../src/compensation/framework.js';
import { createCompensationRouter } from '../src/compensation/routes.js';

const base = { seedQuality: 4, seedsPerWeek: 100, germinating: 10, targetHarvests: 50, stewardship: 3, cycleComplete: true };

test('framework exposes the formula and reuses the Cultivation terms', () => {
  const f = getFramework();
  assert.match(f.harvestFormula.expression, /Quality of Seed x Volume of Input\) x Stewardship Factor/);
  assert.deepEqual(f.termsOfService.map((t) => t.id), ['proportionality', 'non-delegation', 'lag-time', 'ownership']);
  assert.equal(f.feedbackLoop.weeklyAudit.length, 4);
  assert.equal(f.process.length, 4);
});

test('stewardship factor: 0 wipes out, 3 breaks even, 5 multiplies', () => {
  assert.deepEqual(stewardshipFor(0), { rating: 0, factor: 0, level: 'negligent' });
  assert.equal(stewardshipFor(2).level, 'leaking');
  assert.equal(stewardshipFor(3).factor, 1);
  assert.equal(stewardshipFor(5).level, 'multiplier');
});

test('the Volume Mandate math from the notes: 10% germination and 50 harvests needs 500 seeds', () => {
  const r = assessCompensation(base);
  assert.equal(r.volume.germinationRate, 10);
  assert.equal(r.volume.seedsNeeded, 500);
  assert.equal(r.volume.volumeGap, 400);
  assert.equal(r.harvest.index, 400);
  assert.equal(r.calibration.id, 'insufficient-volume');
  assert.match(r.calibration.action, /about 500 seeds/);
  assert.match(r.calibration.action, /harvests\. If germination is low/);
});

test('calibration order: no sowing, success, lag phase, zero stewardship, weak seed', () => {
  assert.equal(assessCompensation({ ...base, seedsPerWeek: 0, germinating: 0 }).calibration.id, 'no-sowing');
  assert.equal(assessCompensation({ ...base, germinating: 60 }).calibration.id, 'successful');
  assert.equal(assessCompensation({ ...base, cycleComplete: false }).calibration.id, 'lag-phase');
  assert.equal(assessCompensation({ ...base, stewardship: 0 }).calibration.id, 'zero-stewardship');
  assert.equal(assessCompensation({ ...base, seedQuality: 2 }).calibration.id, 'weak-seed');
  const none = assessCompensation({ ...base, germinating: 0 });
  assert.equal(none.volume.seedsNeeded, null);
  assert.match(none.calibration.action, /Sow 10x/);
});

test('weekly audit and stewardship, flow and audit recommendations', () => {
  const r = assessCompensation({
    ...base,
    stewardship: 2,
    audit: { weedsLowYield: false, reinvestsHarvest: false, governance: 'reacting' },
    receivesWithGratitude: false,
  });
  assert.deepEqual(r.weeklyAudit.map((a) => a.passed), [true, false, false, false]);
  assert.equal(r.flow.id, 'bypass');
  assert.deepEqual(r.recommendations.map((x) => x.practice), [
    'The Calibration Protocol',
    'Raise the Stewardship Factor',
    'The Leakage Test',
    'The Preservation Test',
    'The Governance Test',
    'Restore the Flow',
  ]);
});

test('a successful, healthy cycle points to the Abundance Cycle', () => {
  const r = assessCompensation({ ...base, germinating: 50, stewardship: 4, receivesWithGratitude: true });
  assert.equal(r.flow.id, 'flow');
  assert.deepEqual(r.recommendations.map((x) => x.practice), ['The Calibration Protocol', 'The Abundance Cycle']);
  assert.match(r.recommendations[0].action, /Golden Seed/);
});

test('validation', () => {
  assert.throws(() => assessCompensation({}), ValidationError);
  assert.throws(() => assessCompensation({ ...base, germinating: 101 }), /germinating/);
  assert.throws(() => assessCompensation({ ...base, stewardship: 6 }), /stewardship/);
  assert.throws(() => assessCompensation({ ...base, targetHarvests: 0 }), /targetHarvests/);
  assert.throws(() => assessCompensation({ ...base, cycleComplete: 'yes' }), /true or false/);
  assert.throws(() => assessCompensation({ ...base, audit: { governance: 'chaos' } }), /governance/);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/compensation', createCompensationRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/compensation`;
  try { await fn(url); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework and assess', async () => {
  await withServer({}, async (url) => {
    assert.equal((await (await fetch(url)).json()).law.maxim, 'What you give, you get.');
    assert.equal((await post(`${url}/assess`, base)).status, 200);
    assert.equal((await post(`${url}/assess`, {})).status, 400);
  });
});

test('HTTP reflect sends the compensation prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**Seed and Harvest** ...' }] }; } } };
  await withServer(fake, async (url) => {
    assert.equal((await post(`${url}/reflect`, {})).status, 400);
    const res = await post(`${url}/reflect`, { content: 'I sent 20 pitches and nobody replied this week.' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reflection, '**Seed and Harvest** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /Stewardship Factor/);
    assert.match(captured.messages[0].content, /20 pitches/);
  });
});
