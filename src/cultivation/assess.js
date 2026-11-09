import { CYCLE, LEVERAGE, PATHS, REINVESTMENT, TERMS } from './framework.js';

const RETURNS = ['none', 'growing', 'massive'];
const MAX_FIELDS = 20;

export class ValidationError extends Error {}

const term = (id) => TERMS.find((t) => t.id === id);
const phase = (id) => CYCLE.find((c) => c.id === id);

// Where one field stands. A cultivated field's phase in the Cultivation Cycle
// comes from how much it is returning; neglect and shortcuts leave the cycle.
export function classifyField({ effort, returns }) {
  if (effort === 'neglect') {
    return {
      path: PATHS.neglect.id,
      state: 'boxed',
      reward: PATHS.neglect.reward,
      note: "This field is in a box. Whatever you don't cultivate, you will lose.",
    };
  }
  if (effort === 'shortcut') {
    return {
      path: PATHS.shortcut.id,
      state: 'unowned',
      reward: PATHS.shortcut.reward,
      note: term('ownership').clause,
    };
  }
  const cycle = phase(returns === 'massive' ? 'harvest' : returns === 'growing' ? 'transition' : 'incubation');
  const notes = {
    incubation: term('lag-time').clause,
    transition: 'Momentum is gathering. Keep the effort steady; do not stop tending now.',
    harvest: 'Compounding efficiency. Be present to retrieve the harvest, and reinvest it.',
  };
  return { path: PATHS.cultivate.id, state: cycle.id, reward: PATHS.cultivate.reward, phase: cycle, note: notes[cycle.id] };
}

function readField(field, i) {
  const path = `fields[${i}]`;
  if (!field || typeof field !== 'object') throw new ValidationError(`${path} must be an object.`);
  const name = typeof field.name === 'string' ? field.name.trim() : '';
  if (!name || name.length > 100) throw new ValidationError(`${path}.name must be 1 to 100 characters.`);
  if (!Object.keys(PATHS).includes(field.effort)) {
    throw new ValidationError(`${path}.effort must be one of: ${Object.keys(PATHS).join(', ')}.`);
  }
  const returns = field.returns ?? 'none';
  if (!RETURNS.includes(returns)) throw new ValidationError(`${path}.returns must be one of: ${RETURNS.join(', ')}.`);
  return { name, effort: field.effort, returns };
}

/**
 * Audit your fields: the talents, relationships and projects you are (or are not) cultivating.
 *
 * input = {
 *   fields: [{ name, effort: 'cultivate'|'neglect'|'shortcut', returns: 'none'|'growing'|'massive' }],
 *   reinvestment: 'consume'|'seeds'|'soil',     // optional: what you do with the harvest
 *   containerBreaksAt10x: boolean,              // optional: the Reception audit
 *   leverage: ['technology'|'people'|'content'] // optional: force multipliers in use
 * }
 */
export function assessCultivation(input = {}) {
  if (!Array.isArray(input.fields) || input.fields.length === 0 || input.fields.length > MAX_FIELDS) {
    throw new ValidationError(`fields must be a list of 1 to ${MAX_FIELDS} fields.`);
  }
  const fields = input.fields.map(readField).map((f) => ({ ...f, ...classifyField(f) }));

  let reinvestment = null;
  if (input.reinvestment !== undefined) {
    reinvestment = REINVESTMENT[input.reinvestment];
    if (!reinvestment) {
      throw new ValidationError(`reinvestment must be one of: ${Object.keys(REINVESTMENT).join(', ')}.`);
    }
  }

  let container = null;
  if (input.containerBreaksAt10x !== undefined) {
    if (typeof input.containerBreaksAt10x !== 'boolean') {
      throw new ValidationError('containerBreaksAt10x must be true or false.');
    }
    container = input.containerBreaksAt10x ? 'too-small' : 'ready';
  }

  let leverage = null;
  if (input.leverage !== undefined) {
    const known = LEVERAGE.map((l) => l.id);
    if (!Array.isArray(input.leverage) || input.leverage.some((l) => !known.includes(l))) {
      throw new ValidationError(`leverage must be a list containing only: ${known.join(', ')}.`);
    }
    leverage = [...new Set(input.leverage)];
  }

  const counts = { cultivate: 0, neglect: 0, shortcut: 0 };
  for (const f of fields) counts[f.effort] += 1;
  const cultivationRate = Math.round((counts.cultivate / fields.length) * 100);

  return {
    cultivationRate,
    profile: profileFor(counts, fields.length),
    counts,
    fields,
    boxes: fields.filter((f) => f.state === 'boxed').map((f) => f.name),
    reinvestment,
    container,
    leverage,
    recommendations: recommend({ fields, reinvestment, container, leverage }),
  };
}

function profileFor(counts, total) {
  if (counts.shortcut * 2 >= total) {
    return { id: 'extractionist', name: 'Extractionist (The Gambler)', summary: 'Seeking the harvest without the seed leads to depletion.' };
  }
  if (counts.cultivate === total) {
    return { id: 'cultivator', name: 'Cultivator (The Architect)', summary: 'Every field is tended. Time is your ally.' };
  }
  if (counts.cultivate * 2 > total) {
    return { id: 'cultivator-with-boxes', name: 'Cultivator with Boxes', summary: 'Most fields are tended, but some value is sitting in a box.' };
  }
  return { id: 'steward-at-risk', name: 'Steward at Risk', summary: 'Half or more of your fields are not being cultivated. Atrophy is setting in.' };
}

function recommend({ fields, reinvestment, container, leverage }) {
  const recs = [];
  const named = (state) => fields.filter((f) => f.state === state).map((f) => f.name);

  const boxed = named('boxed');
  if (boxed.length) {
    recs.push({
      practice: 'Audit Your Boxes',
      reason: `In a box: ${boxed.join(', ')}.`,
      action: `Apply one unit of active cultivation to ${boxed[0]} today. Choose a "+" effort.`,
    });
  }

  const unowned = named('unowned');
  if (unowned.length) {
    recs.push({
      practice: term('ownership').name,
      reason: `Rewarded without work: ${unowned.join(', ')}.`,
      action: 'Put real work into these fields so you can keep what they give you, or expect the system to reclaim it.',
    });
  }

  const incubating = named('incubation');
  if (incubating.length) {
    recs.push({
      practice: term('lag-time').name,
      reason: `Still in Incubation: ${incubating.join(', ')}.`,
      action: 'No visible return yet is expected. Keep tending the field; the delay filters out the uncommitted.',
    });
  }

  if (container === 'too-small') {
    recs.push({
      practice: 'Strengthen the Container',
      reason: 'Your systems would break if the input multiplied by 10x.',
      action: 'Expand your habits, organization and knowledge before demanding the harvest, or it will spill over and be lost.',
    });
  }

  if (reinvestment && reinvestment.level < 3) {
    const next = reinvestment.level === 1 ? REINVESTMENT.seeds : REINVESTMENT.soil;
    recs.push({
      practice: `Reinvestment: Level ${next.level} (${next.name})`,
      reason: `You are at Level ${reinvestment.level} (${reinvestment.name}): ${reinvestment.description}`,
      action: next.description,
    });
  }

  if (leverage && leverage.length === 0 && fields.some((f) => f.effort === 'cultivate')) {
    recs.push({
      practice: 'Leverage (Systemic Sowing)',
      reason: 'You are planting one seed at a time.',
      action: `Pick one multiplier: ${LEVERAGE.map((l) => `${l.name} (${l.description})`).join('; ')}`,
    });
  }

  if (!recs.length) {
    recs.push({
      practice: 'The Nexus Audit',
      reason: 'Your fields are tended and your harvest is reinvested.',
      action: 'Review the last harvest, check the intent of your seed, and replant with what you learned.',
    });
  }

  return recs;
}
