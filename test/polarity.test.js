import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assessPolarity, auditLanguage, locateOnScale, ValidationError } from '../src/polarity/assess.js';
import { getFramework, SCALES } from '../src/polarity/framework.js';
import { createPolarityRouter } from '../src/polarity/routes.js';

const scale = (id) => SCALES.find((s) => s.id === id);

test('framework exposes the nine scales from the notes', () => {
  const f = getFramework();
  assert.deepEqual(f.scales.map((s) => `${s.low}-${s.high}`), [
    'Anxiety-Excitement', 'Fear-Courage', 'Criticism-Insight', 'Scarcity-Abundance', 'Separation-Connection',
    'Shame-Data', 'Apathy-Craftsmanship', 'Impatience-Preparation', 'Resistance-Utilization',
  ]);
  assert.equal(f.attention.leaks.length, 7);
  assert.deepEqual(Object.keys(f.mirror.kinds), ['irritation', 'admiration', 'envy']);
});

test('locateOnScale urgency', () => {
  assert.equal(locateOnScale(scale('fear-courage'), 1).urgency, 'heavy');
  assert.match(locateOnScale(scale('fear-courage'), 2).note, /Catch the shift early/);
  assert.equal(locateOnScale(scale('fear-courage'), 3).urgency, 'lean-in');
  assert.equal(locateOnScale(scale('fear-courage'), 5).id, 'high-pole');
});

test('auditLanguage finds the disempowering phrases', () => {
  const f = auditLanguage("I have to finish this. I'm so stressed and I am afraid. This job is killing me. I'm a failure. It's a huge problem.");
  assert.deepEqual(f.map((x) => x.pattern), ['have-to', 'i-am-emotion', 'i-am-emotion', 'i-am-a-failure', 'problem', 'killing-me']);
  assert.equal(f[0].suggestion, 'I choose to');
  assert.equal(f[1].suggestion, 'I am experiencing stress');
  assert.equal(f[2].suggestion, 'I am experiencing fear');
  assert.deepEqual(auditLanguage('I choose to rest today.'), []);
});

test('a heavy low pole with leaks, open loops, a shadow and self-talk', () => {
  const r = assessPolarity({
    scale: 'shame-data',
    position: 1,
    attention: { signalHours: 2, noiseHours: 5, openLoops: 6, leaks: ['rumination', 'social-media'] },
    mirror: { trait: 'arrogance', reaction: 'irritation', pattern: true },
    selfTalk: 'I am a failure and I have to fix everything.',
  });
  assert.equal(r.location.urgency, 'heavy');
  assert.equal(r.attention.signalShare, 29);
  assert.equal(r.attention.status, 'leaking');
  assert.equal(r.mirror.name, 'The Negative Mirror (Shadow Projection)');
  assert.ok(r.mirror.lens);
  assert.equal(r.language.length, 2);
  assert.deepEqual(r.recommendations.map((x) => x.practice), [
    'Pattern Interrupt',
    'Shift the Pole: Shame → Data',
    'The Attentional Audit',
    'Plug the Leak: Rumination',
    'Plug the Leak: Social media comparison',
    'Offloading',
    'The Negative Mirror (Shadow Projection)',
    'The Lens Effect',
    'The Contribution Question',
    'The Agency Audit',
  ]);
  assert.match(r.recommendations.at(-1).action, /"I have to" → "I choose to"/);
});

test('envy maps to the Golden Shadow; holding the high pole gets the Observer Self', () => {
  const envy = assessPolarity({ scale: 'scarcity-abundance', position: 4, mirror: { trait: 'courage', reaction: 'envy' } });
  assert.equal(envy.mirror.name, 'The Envy Audit (Golden Shadow)');
  assert.equal(envy.mirror.lens, null);
  assert.deepEqual(envy.recommendations.map((x) => x.practice), ['The Envy Audit (Golden Shadow)']);

  const calm = assessPolarity({ scale: 'impatience-preparation', position: 5, attention: { signalHours: 6, noiseHours: 1 } });
  assert.equal(calm.attention.status, 'focused');
  assert.deepEqual(calm.recommendations.map((x) => x.practice), ['The Observer Self']);
});

test('validation', () => {
  assert.throws(() => assessPolarity({ position: 3 }), /scale must be/);
  assert.throws(() => assessPolarity({ scale: 'fear-courage', position: 6 }), /position/);
  assert.throws(() => assessPolarity({ scale: 'fear-courage', position: 3, attention: { signalHours: 20, noiseHours: 10 } }), /more than 24/);
  assert.throws(() => assessPolarity({ scale: 'fear-courage', position: 3, attention: { signalHours: 1, noiseHours: 1, leaks: ['tv'] } }), /leaks/);
  assert.throws(() => assessPolarity({ scale: 'fear-courage', position: 3, mirror: { trait: 'x', reaction: 'love' } }), /reaction/);
  assert.throws(() => assessPolarity({ scale: 'fear-courage', position: 3, selfTalk: 'x'.repeat(2001) }), ValidationError);
});

async function withServer(fakeClient, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/polarity', createPolarityRouter({ anthropic: fakeClient, model: 'test-model' }));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/api/polarity`;
  try { await fn(url); } finally { server.close(); }
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP routes: framework and assess', async () => {
  await withServer({}, async (url) => {
    assert.equal((await (await fetch(url)).json()).law.maxim, 'Everything is on a continuum.');
    assert.equal((await post(`${url}/assess`, { scale: 'fear-courage', position: 2 })).status, 200);
    assert.equal((await post(`${url}/assess`, {})).status, 400);
  });
});

test('HTTP reflect sends the polarity prompt to Claude', async () => {
  let captured;
  const fake = { messages: { create: async (args) => { captured = args; return { content: [{ type: 'text', text: '**The Pole** ...' }] }; } } };
  await withServer(fake, async (url) => {
    assert.equal((await post(`${url}/reflect`, {})).status, 400);
    const res = await post(`${url}/reflect`, { content: 'My presentation is tomorrow and my heart is racing.' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reflection, '**The Pole** ...');
    assert.equal(captured.model, 'test-model');
    assert.match(captured.system, /Anxiety -> Excitement/);
    assert.match(captured.system, /not a substitute for support/);
    assert.match(captured.messages[0].content, /heart is racing/);
  });
});
