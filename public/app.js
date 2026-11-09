// DanfoDiaries web page: one tab per law, an assessment form and a reflection box.
// Everything from the server or the user is inserted as text, never as HTML.

// ---------- DOM helpers ----------

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  let value;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') value = v;
    else if (k === 'checked') el.checked = true;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  if (value !== undefined) el.value = String(value);
  return el;
}

const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

// Each control returns { el, get }.
function rating(label, value, min = 1, max = 5) {
  const sel = h('select', { value }, range(min, max).map((n) => h('option', { value: n }, n)));
  return { el: h('label', {}, label, sel), get: () => Number(sel.value) };
}
function choice(label, options, value) {
  const sel = h('select', { value }, options.map(([v, t]) => h('option', { value: v }, t)));
  return { el: h('label', {}, label, sel), get: () => (sel.value === '' ? undefined : sel.value) };
}
function yesNo(label, value) {
  // value: true | false | undefined (skip)
  const sel = h(
    'select',
    { value: value === undefined ? '' : value ? 'yes' : 'no' },
    h('option', { value: '' }, '— skip —'),
    h('option', { value: 'yes' }, 'Yes'),
    h('option', { value: 'no' }, 'No'),
  );
  return { el: h('label', {}, label, sel), get: () => (sel.value === '' ? undefined : sel.value === 'yes') };
}
function number(label, value, { min = 0, max, step = 1, optional = false } = {}) {
  const input = h('input', { type: 'number', min, max, step, value: value ?? '', placeholder: optional ? 'optional' : undefined });
  return { el: h('label', {}, label, input), get: () => (input.value === '' ? undefined : Number(input.value)) };
}
function text(label, value, placeholder) {
  const input = h('input', { type: 'text', value: value ?? '', placeholder, maxlength: 100 });
  return { el: h('label', {}, label, input), get: () => input.value };
}
function checkboxes(label, items, checkedIds = []) {
  const boxes = items.map(([id, name]) => ({ id, box: h('input', { type: 'checkbox', checked: checkedIds.includes(id) }), name }));
  return {
    el: h('fieldset', {}, h('legend', {}, label), h('div', { class: 'grid' }, boxes.map((b) => h('label', { class: 'inline' }, b.box, b.name)))),
    get: () => boxes.filter((b) => b.box.checked).map((b) => b.id),
  };
}
// An optional group: a checkbox that switches a set of controls on or off.
function optionalGroup(legend, on, controls, extra = []) {
  const toggle = h('input', { type: 'checkbox', checked: on });
  const body = h('div', {}, h('div', { class: 'grid' }, controls.map((c) => c.el)), extra);
  const sync = () => { body.hidden = !toggle.checked; };
  toggle.addEventListener('change', sync);
  sync();
  return { el: h('fieldset', {}, h('legend', {}, h('label', { class: 'inline' }, toggle, legend)), body), on: () => toggle.checked };
}
// A list of rows the user can add to and remove from.
function repeater(legend, items, makeRow, blank, max = 20) {
  const rows = [];
  const list = h('div');
  const add = (item) => {
    if (rows.length >= max) return;
    const row = makeRow(item);
    const remove = h('button', { type: 'button', class: 'small', 'aria-label': 'Remove' }, 'Remove');
    const el = h('div', { class: 'row' }, row.controls.map((c) => c.el), remove);
    const entry = { el, get: row.get };
    remove.addEventListener('click', () => { rows.splice(rows.indexOf(entry), 1); el.remove(); });
    rows.push(entry);
    list.append(el);
  };
  items.forEach(add);
  const addBtn = h('button', { type: 'button', class: 'small', onclick: () => add(blank()) }, '+ Add');
  return { el: h('fieldset', {}, h('legend', {}, legend), list, addBtn), get: () => rows.map((r) => r.get()) };
}
// Drop keys whose value is undefined, and return undefined for an empty object.
function compact(obj) {
  const out = Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
  return Object.keys(out).length ? out : undefined;
}

// ---------- The seven laws ----------

const LAWS = [
  {
    id: 'correspondence',
    build(fw) {
      const defaults = {
        organization: { culture: [5, 4], standards: [5, 2], indoc: [3, 3], upkeep: [2, 4] },
      };
      const levelsBox = h('div');
      let levelControls = [];
      const renderLevels = (systemId) => {
        const sys = fw.systems[systemId];
        levelControls = sys.levels.map((l) => {
          const [a, b] = defaults[systemId]?.[l.id] ?? [3, 3];
          return { id: l.id, above: rating(`${l.above} (Above)`, a), below: rating(`${l.below} (Below)`, b) };
        });
        levelsBox.replaceChildren(
          h('fieldset', {}, h('legend', {}, `${sys.name}: rate how clearly each principle is defined (Above) and how consistently it is practiced (Below)`),
            h('div', { class: 'grid' }, levelControls.flatMap((c) => [c.above.el, c.below.el]))),
        );
      };
      const system = choice('System', Object.values(fw.systems).map((s) => [s.id, s.name]), 'organization');
      system.el.querySelector('select').addEventListener('change', (e) => renderLevels(e.target.value));
      renderLevels('organization');
      const checks = fw.healthChecklist.map((c, i) => ({ id: c.id, ctl: rating(`${c.name}: ${c.question}`, [3, 4, 2][i]) }));
      const checklist = optionalGroup('Include the health checklist for the Below', true, checks.map((c) => c.ctl));
      return {
        el: [system.el, levelsBox, checklist.el],
        collect: () => ({
          system: system.get(),
          levels: Object.fromEntries(levelControls.map((c) => [c.id, { above: c.above.get(), below: c.below.get() }])),
          checklist: checklist.on() ? Object.fromEntries(checks.map((c) => [c.id, c.ctl.get()])) : undefined,
        }),
      };
    },
    headline: (r) => [
      `Alignment: ${r.alignment}%`,
      r.verdict,
      `Weakest level: ${r.weakestLevel.above} → ${r.weakestLevel.below} (${r.weakestLevel.status})`,
    ],
  },
  {
    id: 'proportionality',
    build() {
      const c = {
        depth: rating('Depth: quality of your seed', 5),
        nexus: rating('Nexus: integrity of your intent', 4),
        reach: rating('Reach', 2),
        diversity: rating('Diversity', 3),
        availability: rating('Availability', 2),
      };
      const awake = yesNo('Is your seed active only while you are awake?', true);
      const loss = choice('If your primary source disappeared tomorrow…', [['', '— skip —'], ['total-collapse', 'Total collapse'], ['major-setback', 'Major setback'], ['minor-setback', 'Minor setback']], 'total-collapse');
      return {
        el: [
          h('fieldset', {}, h('legend', {}, 'Rate each from 1 to 5'), h('div', { class: 'grid' }, Object.values(c).map((x) => x.el))),
          h('fieldset', {}, h('legend', {}, 'Nexus Questions (optional)'), h('div', { class: 'grid' }, awake.el, loss.el)),
        ],
        collect: () => ({
          ...Object.fromEntries(Object.entries(c).map(([k, x]) => [k, x.get()])),
          tests: compact({ activeOnlyWhenAwake: awake.get(), primarySourceLoss: loss.get() }),
        }),
      };
    },
    headline: (r) => [
      `Diagnosis: ${r.diagnosis.name}. ${r.diagnosis.summary}`,
      `Surface area: ${r.surfaceArea.percent}% (${r.surfaceArea.field})`,
      `Weakest dimension: ${r.weakestDimension.name}`,
    ],
  },
  {
    id: 'cultivation',
    build(fw) {
      const fields = repeater(
        'Your fields: talents, relationships and projects',
        [
          { name: 'Writing', effort: 'cultivate', returns: 'none' },
          { name: 'Guitar', effort: 'neglect', returns: 'none' },
          { name: 'Family', effort: 'cultivate', returns: 'massive' },
        ],
        (f) => {
          const name = text('Field', f.name, 'e.g. Writing');
          const effort = choice('Effort', [['cultivate', 'Cultivating'], ['neglect', 'Neglecting'], ['shortcut', 'Shortcut (no work)']], f.effort);
          const returns = choice('Returns so far', [['none', 'None yet'], ['growing', 'Growing'], ['massive', 'Massive']], f.returns);
          return { controls: [name, effort, returns], get: () => ({ name: name.get(), effort: effort.get(), returns: returns.get() }) };
        },
        () => ({ name: '', effort: 'cultivate', returns: 'none' }),
      );
      const reinvest = choice('What you do with the harvest', [['', '— skip —'], ['consume', 'Consume it (Survival)'], ['seeds', 'Reinvest in better seeds (Growth)'], ['soil', 'Reinvest in better soil (Mastery)']], 'consume');
      const container = yesNo('Would your systems break if the input grew 10x?', true);
      const leverage = checkboxes('Force multipliers you use (leave all unchecked if none)', fw.forceMultipliers.leverage.map((l) => [l.id, l.name]));
      return {
        el: [fields.el, h('div', { class: 'grid' }, reinvest.el, container.el), leverage.el],
        collect: () => ({ fields: fields.get(), reinvestment: reinvest.get(), containerBreaksAt10x: container.get(), leverage: leverage.get() }),
      };
    },
    headline: (r) => [
      `Profile: ${r.profile.name}. ${r.profile.summary}`,
      `Cultivation rate: ${r.cultivationRate}%`,
      `In a box: ${r.boxes.join(', ') || 'none'}`,
    ],
  },
  {
    id: 'compensation',
    build() {
      const c = {
        seedQuality: rating('Seed quality (1–5)', 4),
        seedsPerWeek: number('Seeds sown this cycle', 20, { max: 100000 }),
        germinating: number('How many got a response', 1, { max: 100000 }),
        targetHarvests: number('Target harvests', 5, { min: 1, max: 100000 }),
        stewardship: rating('Stewardship (0–5)', 2, 0, 5),
        cycleComplete: choice('Has the cycle had time to mature?', [['yes', 'Yes'], ['no', 'No, still in the Lag Phase']], 'yes'),
      };
      const weeds = yesNo('Do you weed out fields that are not germinating?', true);
      const reinvests = yesNo('Do you reinvest part of each win?', false);
      const governance = choice('Governance', [['', '— skip —'], ['reacting', 'Reacting: putting out fires'], ['setting-terms', 'Setting the terms']], 'reacting');
      const gratitude = yesNo('Do you receive with gratitude?', true);
      return {
        el: [
          h('fieldset', {}, h('legend', {}, 'One cycle (for example, one week)'), h('div', { class: 'grid' }, Object.values(c).map((x) => x.el))),
          h('fieldset', {}, h('legend', {}, 'Stewardship Audit and Flow (optional)'), h('div', { class: 'grid' }, weeds.el, reinvests.el, governance.el, gratitude.el)),
        ],
        collect: () => ({
          ...Object.fromEntries(Object.entries(c).map(([k, x]) => [k, x.get()])),
          cycleComplete: c.cycleComplete.get() === 'yes',
          audit: compact({ weedsLowYield: weeds.get(), reinvestsHarvest: reinvests.get(), governance: governance.get() }),
          receivesWithGratitude: gratitude.get(),
        }),
      };
    },
    headline: (r) => [
      `Harvest index: ${r.harvest.index} (${r.harvest.quality} × ${r.harvest.volume} × ${r.harvest.stewardshipFactor})`,
      r.volume.germinationRate === null
        ? 'Nothing was sown this cycle.'
        : `Germination: ${r.volume.germinationRate}%${r.volume.seedsNeeded ? `; seeds needed for your target: ${r.volume.seedsNeeded}` : ''}`,
      `Verdict: ${r.calibration.summary}`,
    ],
  },
  {
    id: 'reciprocity',
    build() {
      const rels = repeater(
        'Relationships and teams: what you offer (1–5) and what comes back (1–5)',
        [
          { name: 'Team', environment: 4, appreciation: 2, resources: 3, received: 2 },
          { name: 'Partner', environment: 4, appreciation: 2, resources: 5, received: 3, gratitude: false },
          { name: 'Mentor', environment: 3, appreciation: 3, resources: 2, received: 5, measureMatches: true },
        ],
        (r) => {
          const ctl = {
            name: text('Name', r.name, 'e.g. Team'),
            environment: rating('Environment', r.environment),
            appreciation: rating('Appreciation', r.appreciation),
            resources: rating('Resources', r.resources),
            received: rating('Received', r.received),
            measureMatches: yesNo('Fair measure?', r.measureMatches),
            gratitude: yesNo('Gratitude?', r.gratitude),
          };
          return {
            controls: Object.values(ctl),
            get: () => ({
              name: ctl.name.get(),
              offered: { environment: ctl.environment.get(), appreciation: ctl.appreciation.get(), resources: ctl.resources.get() },
              received: ctl.received.get(),
              measureMatches: ctl.measureMatches.get(),
              gratitude: ctl.gratitude.get(),
            }),
          };
        },
        () => ({ name: '', environment: 3, appreciation: 3, resources: 3, received: 3 }),
      );
      const peak = yesNo('Are you in a Peak season right now?', true);
      return {
        el: [rels.el, h('p', { class: 'hint' }, '"Fair measure?" asks whether you would accept the measure you use on them.'), peak.el],
        collect: () => ({ relationships: rels.get(), inPeak: peak.get() }),
      };
    },
    headline: (r) => [
      `You offer ${r.mirror.averageOffered}/5 on average and receive ${r.mirror.averageReceived}/5`,
      r.mirror.pattern ? `The Mirror: ${r.mirror.pattern.name} is your lowest offer in ${r.mirror.pattern.count} of ${r.mirror.pattern.of} relationships.` : 'The Mirror: no repeating pattern.',
      r.relationships.map((x) => `${x.name}: ${x.status}`).join(' · '),
    ],
  },
  {
    id: 'rhythm',
    build(fw) {
      let mode = 'signals';
      const season = choice('Season', fw.seasons.map((s) => [s.id, `${s.name} (${s.stage})`]), 'peak');
      const momentum = rating('Momentum (1–5)', 4);
      const trend = choice('Momentum is…', [['rising', 'Rising'], ['steady', 'Steady'], ['falling', 'Falling']], 'falling');
      const seasonBox = h('div', { class: 'grid' }, season.el);
      const signalBox = h('div', { class: 'grid' }, momentum.el, trend.el);
      const modeBtns = [['signals', 'Diagnose my season'], ['season', 'I know my season']].map(([id, label]) =>
        h('button', { type: 'button', 'aria-pressed': String(id === mode), onclick: () => setMode(id) }, label));
      const setMode = (m) => {
        mode = m;
        modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(['signals', 'season'][i] === m)));
        seasonBox.hidden = m !== 'season';
        signalBox.hidden = m !== 'signals';
      };
      setMode(mode);
      const activity = choice('What you are doing right now', fw.activities.map((a) => [a.id, a.name]), 'pushing');
      const values = rating('How much are you acting from your core values? (1–5)', 3);
      const routine = yesNo('Kept your routine regardless of the season?', true);
      const frequency = optionalGroup('Check my Frequency', true, [values, routine]);
      const attachments = repeater(
        'Attachments: people, places, habits and projects you are tied to (optional)',
        [
          { name: 'Side project', trend: 'falling', wouldCollapseWithIt: false },
          { name: 'Writing group', trend: 'rising' },
        ],
        (a) => {
          const name = text('Attachment', a.name, 'e.g. Old job');
          const t = choice('Trend', [['rising', 'Rising'], ['stable', 'Stable'], ['falling', 'Falling']], a.trend);
          const collapse = yesNo('Would you fall with it?', a.wouldCollapseWithIt);
          return { controls: [name, t, collapse], get: () => ({ name: name.get(), trend: t.get(), wouldCollapseWithIt: collapse.get() }) };
        },
        () => ({ name: '', trend: 'stable' }),
      );
      const months = number('Months in this season', undefined, { max: 60, optional: true });
      return {
        el: [h('div', { class: 'mode' }, modeBtns), seasonBox, signalBox, activity.el, frequency.el, attachments.el, months.el],
        collect: () => ({
          season: mode === 'season' ? season.get() : undefined,
          signals: mode === 'signals' ? { momentum: momentum.get(), trend: trend.get() } : undefined,
          activity: activity.get(),
          frequency: frequency.on() ? compact({ actingFromValues: values.get(), keptRoutine: routine.get() }) : undefined,
          attachments: attachments.get(),
          monthsInSeason: months.get(),
        }),
      };
    },
    headline: (r) => [
      `Season: ${r.season.name} (${r.season.stage}), ${r.season.source}`,
      `Alignment: ${r.alignment.status}${r.alignment.trap ? `: ${r.alignment.trap}` : ''}`,
      `Master thought: “${r.season.masterThought}”`,
    ],
  },
  {
    id: 'polarity',
    build(fw) {
      const scale = choice('Scale', fw.scales.map((s) => [s.id, `${s.low} → ${s.high}`]), 'anxiety-excitement');
      const position = choice('Where are you on it?', [
        ['1', '1: at the low pole'], ['2', '2: leaning low'], ['3', '3: midpoint'], ['4', '4: leaning high'], ['5', '5: at the high pole'],
      ], '2');
      const signal = number('Hours on signal (your priorities)', 3, { max: 24, step: 0.5 });
      const noise = number('Hours on noise', 4, { max: 24, step: 0.5 });
      const loops = number('Open loops', 5, { max: 500 });
      const leaks = checkboxes('Leaks', fw.attention.leaks.map((l) => [l.id, l.name]), ['notifications']);
      const attention = optionalGroup('Audit my attention', true, [signal, noise, loops], [leaks.el]);
      const trait = text('A trait in someone else', 'confidence');
      const reaction = choice('Your reaction', [['irritation', 'It irritates me'], ['admiration', 'I admire it'], ['envy', 'I envy it']], 'admiration');
      const pattern = choice('Do you react this way to many people?', [['no', 'No'], ['yes', 'Yes']], 'no');
      const mirror = optionalGroup('Look in the Mirror', true, [trait, reaction, pattern]);
      const talk = h('textarea', { placeholder: 'How have you been talking to yourself? (optional)', maxlength: 2000 }, 'I have to give this talk and I am so nervous.');
      return {
        el: [h('div', { class: 'grid' }, scale.el, position.el), attention.el, mirror.el, h('label', {}, 'Self-talk (the Agency Audit)', talk)],
        collect: () => ({
          scale: scale.get(),
          position: Number(position.get()),
          attention: attention.on() ? compact({ signalHours: signal.get(), noiseHours: noise.get(), openLoops: loops.get(), leaks: leaks.get() }) : undefined,
          mirror: mirror.on() ? { trait: trait.get(), reaction: reaction.get(), pattern: pattern.get() === 'yes' } : undefined,
          selfTalk: talk.value.trim() ? talk.value : undefined,
        }),
      };
    },
    headline: (r) => [
      `${r.location.label}: ${r.scale.low} → ${r.scale.high}`,
      r.attention ? `Attention: ${r.attention.status}${r.attention.signalShare === null ? '' : ` (${r.attention.signalShare}% on signal)`}` : null,
      r.language?.length ? `Self-talk: ${r.language.map((f) => `“${f.found}” → “${f.suggestion}”`).join('; ')}` : null,
    ].filter(Boolean),
  },
];

// ---------- Rendering results ----------

async function api(path, body) {
  const res = await fetch(path, body === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ error: `The server answered ${res.status}.` }));
  if (!res.ok) throw new Error(data.error || `The server answered ${res.status}.`);
  return data;
}

function renderAssessment(law, result, request) {
  return h('div', { class: 'result card' },
    h('h3', {}, 'Result'),
    h('ul', { class: 'headline' }, law.headline(result).map((line) => h('li', {}, line))),
    h('h3', {}, 'Recommendations'),
    h('ol', { class: 'recs' }, result.recommendations.map((r) =>
      h('li', {}, h('strong', {}, r.practice ?? r.step), h('br'), h('span', { class: 'reason' }, r.reason), h('br'), r.action))),
    h('details', {}, h('summary', {}, 'Request sent'), h('pre', {}, JSON.stringify(request, null, 2))),
    h('details', {}, h('summary', {}, 'Full JSON response'), h('pre', {}, JSON.stringify(result, null, 2))),
  );
}

// A small Markdown reader for Claude's reflections: headings, lists, bold, paragraphs.
function inline(textLine) {
  return textLine.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) =>
    part.startsWith('**') && part.endsWith('**') ? h('strong', {}, part.slice(2, -2)) : part);
}
function markdown(md) {
  const out = [];
  let list = null;
  let para = [];
  const flushPara = () => { if (para.length) out.push(h('p', {}, inline(para.join(' ')))); para = []; };
  const flushList = () => { if (list) out.push(list); list = null; };
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (heading) { flushPara(); flushList(); out.push(h(heading[1].length <= 2 ? 'h3' : 'h4', {}, inline(heading[2]))); }
    else if (bullet) { flushPara(); list = list || h(/^\s*\d/.test(line) ? 'ol' : 'ul'); list.append(h('li', {}, inline(bullet[1]))); }
    else if (!line.trim()) { flushPara(); flushList(); }
    else { flushList(); para.push(line.trim()); }
  }
  flushPara();
  flushList();
  return out;
}

// ---------- Page ----------

const frameworks = {};

async function showLaw(id) {
  const law = LAWS.find((l) => l.id === id) || LAWS[0];
  document.querySelectorAll('#tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.id === law.id)));
  const main = document.getElementById('law');
  main.replaceChildren(h('p', { class: 'loading' }, 'Loading…'));

  let fw;
  try {
    fw = frameworks[law.id] ||= await api(`/api/${law.id}`);
  } catch (e) {
    main.replaceChildren(h('p', { class: 'error' }, `Could not load this law: ${e.message}`));
    return;
  }

  const form = law.build(fw);
  const assessOut = h('div');
  const runBtn = h('button', { type: 'submit', class: 'primary' }, 'Run assessment');
  const assessForm = h('form', {}, form.el, runBtn);
  assessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const request = form.collect();
    runBtn.disabled = true;
    try {
      assessOut.replaceChildren(renderAssessment(law, await api(`/api/${law.id}/assess`, request), request));
    } catch (err) {
      assessOut.replaceChildren(h('p', { class: 'error' }, err.message));
    } finally {
      runBtn.disabled = false;
    }
  });

  const title = h('input', { type: 'text', placeholder: 'Title (optional)', maxlength: 200 });
  const entry = h('textarea', { placeholder: 'Write or paste a journal entry…' });
  const reflectOut = h('div');
  const reflectBtn = h('button', { type: 'submit', class: 'primary' }, 'Reflect with Claude');
  const reflectForm = h('form', {}, h('label', {}, 'Title', title), h('label', {}, 'Journal entry', entry), reflectBtn);
  reflectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!entry.value.trim()) { reflectOut.replaceChildren(h('p', { class: 'error' }, 'Write a journal entry first.')); return; }
    reflectBtn.disabled = true;
    reflectOut.replaceChildren(h('p', { class: 'hint' }, 'Claude is reading your entry…'));
    try {
      const r = await api(`/api/${law.id}/reflect`, { title: title.value || undefined, content: entry.value });
      reflectOut.replaceChildren(h('div', { class: 'result card reflection' }, h('h3', {}, r.title), markdown(r.reflection)));
    } catch (err) {
      const keyProblem = /401|authentication_error|invalid x-api-key/i.test(err.message);
      reflectOut.replaceChildren(h('p', { class: 'error' },
        keyProblem ? `Claude could not be reached: ${err.message} Add ANTHROPIC_API_KEY to .env and restart the server.` : err.message));
    } finally {
      reflectBtn.disabled = false;
    }
  });

  main.replaceChildren(
    h('h2', {}, fw.law.name),
    h('p', { class: 'maxim' }, `“${fw.law.maxim}”`),
    h('section', { class: 'card' }, h('h3', {}, 'Assessment'), h('p', { class: 'hint' }, 'Pre-filled with an example. Change anything and run it.'), assessForm, assessOut),
    h('section', { class: 'card' }, h('h3', {}, 'Reflection'), h('p', { class: 'hint' }, `Claude reads your entry through ${fw.law.name}.`), reflectForm, reflectOut),
  );
}

function init() {
  const tabs = document.getElementById('tabs');
  const names = {
    correspondence: 'Correspondence', proportionality: 'Proportionality', cultivation: 'Cultivation',
    compensation: 'Compensation', reciprocity: 'Reciprocity', rhythm: 'Rhythm', polarity: 'Polarity',
  };
  for (const law of LAWS) {
    tabs.append(h('button', { type: 'button', role: 'tab', 'data-id': law.id, onclick: () => { location.hash = law.id; } }, names[law.id]));
  }
  const route = () => showLaw(location.hash.slice(1));
  window.addEventListener('hashchange', route);
  route();
}

init();
