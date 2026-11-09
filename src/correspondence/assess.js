import { HEALTH_CHECKLIST, PRACTICES, SYSTEMS } from './framework.js';

const MIN = 1;
const MAX = 5;

export class ValidationError extends Error {}

function readRating(value, path) {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || !Number.isInteger(n) || n < MIN || n > MAX) {
    throw new ValidationError(`${path} must be an integer from ${MIN} to ${MAX}.`);
  }
  return n;
}

// Classify one Above -> Below correspondence.
//   above: how clearly the principle is defined (1-5)
//   below: how consistently the process is practiced (1-5)
export function classifyLevel(above, below) {
  const gap = above - below;
  const likeness = Math.round((1 - Math.abs(gap) / (MAX - MIN)) * 100);

  let status;
  let note;
  if (gap >= 2) {
    status = 'drift';
    note = 'The Below has drifted from the Above. The principle is clear but practice does not mirror it.';
  } else if (gap <= -2) {
    status = 'unanchored';
    note = 'Practice is running ahead of an undefined principle. Articulate the Above so the Below has something to mirror.';
  } else if (above < 3 && below < 3) {
    status = 'weak';
    note = 'Above and Below correspond, but both are weak. As above, so below: strengthen the principle first.';
  } else {
    status = 'aligned';
    note = 'The Below faithfully mirrors the Above.';
  }

  return { gap, likeness, status, note };
}

function checklistStatus(score) {
  if (score >= 4) return 'healthy';
  if (score === 3) return 'at-risk';
  return 'failing';
}

/**
 * Assess how well a system's Below corresponds to its Above.
 *
 * input = {
 *   system: 'organization' | 'nature',            // default 'organization'
 *   levels: { [levelId]: { above: 1-5, below: 1-5 } },
 *   checklist: { coherence: 1-5, resilience: 1-5, transparency: 1-5 }  // optional
 * }
 */
export function assessCorrespondence(input = {}) {
  const systemId = input.system || 'organization';
  const system = SYSTEMS[systemId];
  if (!system) {
    throw new ValidationError(`Unknown system "${systemId}". Use one of: ${Object.keys(SYSTEMS).join(', ')}.`);
  }

  const levelsInput = input.levels || {};
  const levels = system.levels.map((def) => {
    const ratings = levelsInput[def.id];
    if (!ratings) {
      throw new ValidationError(`levels.${def.id} is required (${def.above} -> ${def.below}).`);
    }
    const above = readRating(ratings.above, `levels.${def.id}.above`);
    const below = readRating(ratings.below, `levels.${def.id}.below`);
    return {
      level: def.level,
      id: def.id,
      above: def.above,
      below: def.below,
      ratings: { above, below },
      ...classifyLevel(above, below),
    };
  });

  const alignment = Math.round(levels.reduce((sum, l) => sum + l.likeness, 0) / levels.length);

  const weakest = levels.reduce((worst, l) => {
    const score = l.likeness + (l.ratings.above + l.ratings.below) * 5;
    const worstScore = worst.likeness + (worst.ratings.above + worst.ratings.below) * 5;
    return score < worstScore ? l : worst;
  });

  let checklist = null;
  if (input.checklist) {
    checklist = HEALTH_CHECKLIST.map((item) => {
      const score = readRating(input.checklist[item.id], `checklist.${item.id}`);
      const status = checklistStatus(score);
      return {
        id: item.id,
        name: item.name,
        question: item.question,
        score,
        status,
        observation: status === 'healthy' ? item.healthy : item.symptom,
      };
    });
  }

  return {
    system: system.id,
    systemName: system.name,
    alignment,
    verdict: verdictFor(alignment, levels),
    levels,
    weakestLevel: { id: weakest.id, above: weakest.above, below: weakest.below, status: weakest.status },
    checklist,
    recommendations: recommend(levels, checklist),
  };
}

function verdictFor(alignment, levels) {
  if (levels.some((l) => l.status === 'drift' || l.status === 'unanchored')) {
    return 'Out of correspondence: at least one level of the Below no longer mirrors its Above.';
  }
  if (levels.some((l) => l.status === 'weak')) {
    return 'In correspondence, but weak: the Below faithfully reflects an Above that needs strengthening.';
  }
  if (alignment >= 80) return 'As above, so below: the system is in strong correspondence.';
  return 'Broadly aligned, with room to tighten the likeness between planes.';
}

function recommend(levels, checklist) {
  const recs = [];

  const drifted = levels.filter((l) => l.status === 'drift');
  if (drifted.length) {
    recs.push({
      practice: PRACTICES.reset.name,
      reason: `Drift detected at: ${drifted.map((l) => `${l.above} -> ${l.below}`).join(', ')}.`,
      action: PRACTICES.reset.description,
    });
  }

  for (const l of levels.filter((x) => x.status === 'unanchored')) {
    recs.push({
      practice: 'Define the Above',
      reason: `${l.below} is practiced more strongly than ${l.above} is defined.`,
      action: `Write down the ${l.above} principle in one sentence so ${l.below} has a clear pattern to mirror.`,
    });
  }

  for (const l of levels.filter((x) => x.status === 'weak')) {
    recs.push({
      practice: 'Strengthen the principle',
      reason: `Both ${l.above} and ${l.below} are weak.`,
      action: `Fix ${l.above} first; ${l.below} will follow, because the Below always reflects the Above.`,
    });
  }

  if (checklist) {
    const byId = Object.fromEntries(checklist.map((c) => [c.id, c]));
    if (byId.coherence.status !== 'healthy') {
      recs.push({
        practice: PRACTICES.gembaWalk.name,
        reason: 'Coherence is low: the Below does not see why its work matters.',
        action: `${PRACTICES.gembaWalk.description} Make sure the strategy can be explained in one sentence.`,
      });
    }
    if (byId.resilience.status !== 'healthy') {
      recs.push({
        practice: 'Boundary-Protected Autonomy',
        reason: 'Resilience is low: the Below waits for permission.',
        action: 'Set hard boundaries Above, then let the Below solve local problems freely within them.',
      });
    }
    if (byId.transparency.status !== 'healthy') {
      recs.push({
        practice: PRACTICES.directReporting.name,
        reason: 'Transparency is low: failures are hidden or blamed.',
        action: `${PRACTICES.directReporting.description} Treat reported failures as system insights.`,
      });
    }
  }

  if (!recs.length) {
    recs.push({
      practice: PRACTICES.reset.name,
      reason: 'The system is in correspondence. Entropy still applies.',
      action: 'Keep a routine Reset on the calendar so the Below does not drift over time.',
    });
  }

  return recs;
}
