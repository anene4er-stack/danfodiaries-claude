import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessRhythm, checkAlignment, classifyAttachment, diagnoseSeason, ValidationError } from '../src/rhythm/assess.js';
import { getFramework, SEASONS } from '../src/rhythm/framework.js';
import { createRhythmRouter } from '../src/rhythm/routes.js';

const season = (id) => SEASONS.find((s) => s.id === id);

test('framework exposes the four seasons in cycle order with their traps', () => {
  const f = getFramework();
  assert.deepEqual(f.seasons.map((s) => s.id), ['peak', 'descending', 'valley', 'ascending']);
  assert.deepEqual(f.seasons.map((s) => s.trap.name), ['Growth Addiction', 'The Force Trap', 'The Guilt Loop', 'The Haste Trap']);
  assert.deepEqual(f.seasons.map((s) => s.alignedFocus), ['Stewardship', 'Consolidation', 'Restoration', 'Experimentation']);
  assert.equal(f.frequency.guards.length, 4);
});

test('diagnoseSeason from momentum and trend', () => {
  assert.equal(diagnoseSeason({ momentum: 5, trend: 'steady' }), 'peak');
  assert.equal(diagnoseSeason({ momentum: 4, trend: 'falling' }), 'descending');
  assert.equal(diagnoseSeason({ momentum: 1, trend: 'falling' }), 'valley');
  assert.equal(diagnoseSeason({ momentum: 2, trend: 'rising' }), 'ascending');
  assert.equal(diagnoseSeason({ momentum: 3, trend: 'rising' }), 'ascending');
  assert.equal(diagnoseSeason({ momentum: 3, trend: 'falling' }), 'descending');
  assert.equal(diagnoseSeason({ momentum: 3, trend: 'steady' }), null);
});

test('checkAlignment: aligned, trap, overreaching, under-using, mismatched', () => {
  assert.equal(checkAlignment(season('valley'), 'restoring').status, 'aligned');
  const trap = checkAlignment(season('descending'), 'pushing');
  assert.equal(trap.status, 'trap');
  assert.equal(trap.trap, 'The Force Trap');
  assert.equal(checkAlignment(season('valley'), 'executing').status, 'overreaching');
  assert.equal(checkAlignment(season('peak'), 'restoring').status, 'under-using');
  assert.match(checkAlignment(season('descending'), 'experimenting').note, /close your loops/);
  assert.match(checkAlignment(season('ascending'), 'consolidating').note, /stalls the momentum/);
});

test('the Falling Structure Test', () => {
  assert.equal(classifyAttachment({ trend: 'falling', wouldCollapseWithIt: true }).action, 'detach');
  assert.equal(classifyAttachment({ trend: 'falling', wouldCollapseWithIt: false }).action, 'prune');
  assert.equal(classifyAttachment({ trend: 'stable' }).action, 'reassess');
  assert.equal(classifyAttachment({ trend: 'rising' }).action, 'keep');
});

test('a misaligned Valley with drift and a falling attachment', () => {
  const r = assessRhythm({
    signals: { momentum: 1, trend: 'steady' },
    activity: 'pushing',
    frequency: { actingFromValues: 2, keptRoutine: false },
    attachments: [{ name: 'Old job', trend: 'falling', wouldCollapseWithIt: true }],
    monthsInSeason: 4,
  });
  assert.equal(r.season.id, 'valley');
  assert.equal(r.season.source, 'diagnosed');
  assert.match(r.season.doNotJudge, /lazy/);
  assert.equal(r.alignment.trap, 'The Guilt Loop');
  assert.equal(r.frequency.status, 'drifting');
  assert.match(r.frequency.note, /Self-Loathing Spiral/);
  assert.deepEqual(r.recommendations.map((x) => x.practice), [
    'Realign with the Season',
    'Frequency Guards',
    'Detachment Execution',
    'Re-Attachment',
    'Create a Forced Peak',
  ]);
  assert.match(r.recommendations[1].action, /Immutable Routine/);
});

test('an aligned Peak gets its focus, a Forced Valley after a long sprint, and the exit question', () => {
  const r = assessRhythm({
    season: 'peak',
    activity: 'executing',
    frequency: { actingFromValues: 5, keptRoutine: true },
    attachments: [{ name: 'Mastermind group', trend: 'rising' }],
    monthsInSeason: 3,
  });
  assert.equal(r.alignment.status, 'aligned');
  assert.equal(r.frequency.status, 'anchored');
  assert.match(r.frequency.note, /Stewardship/);
  assert.deepEqual(r.recommendations.map((x) => x.practice), ['Peak: Stewardship', 'Create a Forced Valley', 'The Exit Mentality']);
  assert.ok(r.dailyCards.morning.length);
});

test('validation', () => {
  assert.throws(() => assessRhythm({ activity: 'executing' }), /season or signals/);
  assert.throws(() => assessRhythm({ season: 'winter', activity: 'executing' }), /season must be/);
  assert.throws(() => assessRhythm({ signals: { momentum: 3, trend: 'steady' }, activity: 'executing' }), /Name the phase/);
  assert.throws(() => assessRhythm({ signals: { momentum: 3, trend: 'up' }, activity: 'executing' }), /trend/);
  assert.throws(() => assessRhythm({ season: 'peak', activity: 'napping' }), /activity/);
  assert.throws(() => assessRhythm({ season: 'peak', activity: 'executing', frequency: { actingFromValues: 9 } }), /actingFromValues/);
  assert.throws(() => assessRhythm({ season: 'peak', activity: 'executing', attachments: [{ name: 'A', trend: 'down' }] }), /trend/);
  assert.throws(() => assessRhythm({ season: 'peak', activity: 'executing', monthsInSeason: -1 }), ValidationError);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/rhythm', createRhythmRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/rhythm`;
  try { await fn(url); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework and assess', async () => {
  await withServer({}, async (url) => {
    assert.equal((await (await fetch(url)).json()).law.maxim, 'This too shall pass.');
    assert.equal((await post(`${url}/assess`, { season: 'valley', activity: 'restoring' })).status, 200);
    assert.equal((await post(`${url}/assess`, {})).status, 400);
  });
});

test('HTTP reflect sends the rhythm prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**The Season** ...' }] }; } } };
  await withServer(fake, async (url) => {
    assert.equal((await post(`${url}/reflect`, {})).status, 400);
    const res = await post(`${url}/reflect`, { content: 'Nothing is moving and I feel useless.' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reflection, '**The Season** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /The Guilt Loop/);
    assert.match(captured.messages[0].content, /feel useless/);
  });
});
