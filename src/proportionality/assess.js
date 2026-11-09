import { DIMENSIONS, MODES, NEXUS_QUESTIONS, TRAP, WORKFLOW } from './framework.js';

const MIN = 1;
const MAX = 5;
const SOURCE_LOSS = ['total-collapse', 'major-setback', 'minor-setback'];

export class ValidationError extends Error {}

function readRating(value, path) {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || !Number.isInteger(n) || n < MIN || n > MAX) {
    throw new ValidationError(`${path} must be an integer from ${MIN} to ${MAX}.`);
  }
  return n;
}

// Surface area is a volume: Reach x Diversity x Availability, as a percentage of the maximum.
// A zero-ish dimension collapses the whole field, which is the point of the law.
export function surfaceAreaPercent({ reach, diversity, availability }) {
  return Math.round(((reach * diversity * availability) / MAX ** 3) * 100);
}

export function fieldSize(percent) {
  if (percent >= 60) return 'wide';
  if (percent >= 30) return 'moderate';
  return 'narrow';
}

// Decide which situation the person is in, following the doc's workflow order:
// a bad seed comes first ("do not scale garbage"), then field size, then the Nexus.
export function diagnose({ depth, nexus, field }) {
  if (depth < 3 && field !== 'narrow') {
    return {
      id: 'wide-and-shallow',
      name: TRAP.name,
      mode: MODES.net.name,
      summary: 'Your field is wide but the seed is weak: you are failing on a larger scale.',
      stage: WORKFLOW[0],
    };
  }
  if (depth < 3) {
    return {
      id: 'validate-seed',
      name: 'Unproven Seed',
      mode: MODES.spear.name,
      summary: 'Before widening the field, prove the seed. Do not scale garbage.',
      stage: WORKFLOW[0],
    };
  }
  if (field === 'narrow') {
    return {
      id: 'spear',
      name: 'The Spear',
      mode: MODES.spear.name,
      summary:
        'Your seed is good but your field is small. The bottleneck is not your work ethic; it is the size of your field.',
      stage: WORKFLOW[1],
    };
  }
  if (nexus < 3) {
    return {
      id: 'nexus-at-risk',
      name: 'Nexus at Risk',
      mode: MODES.net.name,
      summary:
        'You are reaching widely, but your core intent is slipping. The wider you reach, the more critical your original intent becomes.',
      stage: WORKFLOW[2],
    };
  }
  if (field === 'moderate') {
    return {
      id: 'widening',
      name: 'Widening the Net',
      mode: MODES.net.name,
      summary: 'A proven seed with a growing field. Keep systematizing the sowing.',
      stage: WORKFLOW[1],
    };
  }
  return {
    id: 'net',
    name: 'The Net',
    mode: MODES.net.name,
    summary: 'A proven seed, sown widely, with the Nexus intact. You are building an ecosystem, not a task.',
    stage: WORKFLOW[2],
  };
}

/**
 * Assess a person's or project's input surface area.
 *
 * input = {
 *   depth: 1-5,          // quality of the Seed
 *   nexus: 1-5,          // integrity of core intent
 *   reach: 1-5, diversity: 1-5, availability: 1-5,
 *   tests: {             // optional Nexus Questions
 *     activeOnlyWhenAwake: boolean,
 *     primarySourceLoss: 'total-collapse' | 'major-setback' | 'minor-setback'
 *   }
 * }
 */
export function assessProportionality(input = {}) {
  const depth = readRating(input.depth, 'depth');
  const nexus = readRating(input.nexus, 'nexus');
  const ratings = Object.fromEntries(DIMENSIONS.map((d) => [d.id, readRating(input[d.id], d.id)]));

  const percent = surfaceAreaPercent(ratings);
  const field = fieldSize(percent);
  const diagnosis = diagnose({ depth, nexus, field });

  const dimensions = DIMENSIONS.map((d) => ({ id: d.id, name: d.name, score: ratings[d.id] }));
  const weakest = DIMENSIONS.reduce((a, b) => (ratings[b.id] < ratings[a.id] ? b : a));

  const tests = runNexusQuestions(input.tests, { depth, field });

  return {
    depth,
    nexus,
    surfaceArea: { percent, field, dimensions },
    weakestDimension: { id: weakest.id, name: weakest.name, score: ratings[weakest.id] },
    diagnosis,
    nexusQuestions: tests,
    recommendations: recommend({ depth, nexus, field, ratings, weakest, tests }),
  };
}

function runNexusQuestions(tests, { depth, field }) {
  const byId = Object.fromEntries(NEXUS_QUESTIONS.map((q) => [q.id, q]));

  // The Bottleneck Test is answered from the ratings themselves.
  let bottleneck;
  if (depth < 3) bottleneck = 'skill';
  else if (field === 'narrow') bottleneck = 'scale';
  else bottleneck = 'none';
  const results = [
    {
      id: 'bottleneck',
      name: byId.bottleneck.name,
      question: byId.bottleneck.question,
      answer: bottleneck,
      passed: bottleneck === 'none',
      note:
        bottleneck === 'scale'
          ? 'You are farming one tiny patch of land: your problem is not skill; it is scale.'
          : bottleneck === 'skill'
            ? 'The seed itself needs work before the field size matters.'
            : 'Neither the seed nor the field is the constraint right now.',
    },
  ];

  if (!tests) return results;

  if (tests.activeOnlyWhenAwake !== undefined) {
    if (typeof tests.activeOnlyWhenAwake !== 'boolean') {
      throw new ValidationError('tests.activeOnlyWhenAwake must be true or false.');
    }
    results.push({
      id: 'leverage',
      name: byId.leverage.name,
      question: byId.leverage.question,
      answer: tests.activeOnlyWhenAwake ? 'yes' : 'no',
      passed: !tests.activeOnlyWhenAwake,
      note: tests.activeOnlyWhenAwake
        ? 'Your seed is active only while you are awake, so your surface area is limited by your biology.'
        : 'Your seed works while you rest.',
    });
  }

  if (tests.primarySourceLoss !== undefined) {
    if (!SOURCE_LOSS.includes(tests.primarySourceLoss)) {
      throw new ValidationError(`tests.primarySourceLoss must be one of: ${SOURCE_LOSS.join(', ')}.`);
    }
    const collapse = tests.primarySourceLoss === 'total-collapse';
    results.push({
      id: 'diversification',
      name: byId.diversification.name,
      question: byId.diversification.question,
      answer: tests.primarySourceLoss,
      passed: tests.primarySourceLoss === 'minor-setback',
      note: collapse
        ? 'Losing your primary source would mean total collapse, so your surface area is zero.'
        : tests.primarySourceLoss === 'major-setback'
          ? 'You would survive, but one source carries too much of the harvest.'
          : 'A storm in one field would be an anomaly, not a catastrophe.',
    });
  }

  return results;
}

function recommend({ depth, nexus, field, ratings, weakest, tests }) {
  const recs = [];
  const failed = Object.fromEntries(tests.filter((t) => !t.passed).map((t) => [t.id, t]));
  const dimension = (id) => DIMENSIONS.find((d) => d.id === id);
  const recommended = new Set();

  const widen = (id, reason) => {
    if (recommended.has(id)) return;
    recommended.add(id);
    recs.push({ step: `${WORKFLOW[1].name}: ${dimension(id).name}`, reason, action: dimension(id).howToIncrease });
  };

  if (depth < 3) {
    recs.push({
      step: WORKFLOW[0].name,
      reason: `Seed quality is ${depth}/5.`,
      action: `${WORKFLOW[0].description} Improve the core offer before planting it in more places.`,
    });
  } else if (field !== 'wide') {
    widen(weakest.id, `${weakest.name} is your smallest dimension (${ratings[weakest.id]}/5); it limits the whole field.`);
  }

  if (failed.leverage) widen('availability', failed.leverage.note);
  if (failed.diversification) widen('diversity', failed.diversification.note);

  // The wider you reach, the more the Nexus matters: flag it when it is weak,
  // or when it is only middling and the field is already growing.
  if (nexus < 3 || (field !== 'narrow' && nexus < 4)) {
    recs.push({
      step: WORKFLOW[2].name,
      reason: `Nexus integrity is ${nexus}/5 while you expand.`,
      action: WORKFLOW[2].description,
    });
  }

  if (!recs.length) {
    recs.push({
      step: WORKFLOW[2].name,
      reason: 'The seed is proven, the field is wide and the Nexus is intact.',
      action: 'Keep auditing the Nexus each cycle, and use the harvest data to refine the seed.',
    });
  }

  return recs;
}
