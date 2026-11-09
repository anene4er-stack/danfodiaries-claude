import { ACTIVITIES, DAILY_CARDS, FREQUENCY, MASTERY, SEASONS, STRATEGIES } from './framework.js';

const TRENDS = ['rising', 'steady', 'falling'];
const ATTACHMENT_TRENDS = ['rising', 'stable', 'falling'];
const MAX_ATTACHMENTS = 20;

export class ValidationError extends Error {}

const seasonById = (id) => SEASONS.find((s) => s.id === id);

function readRating(value, path) {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || !Number.isInteger(n) || n < 1 || n > 5) {
    throw new ValidationError(`${path} must be an integer from 1 to 5.`);
  }
  return n;
}

function readBool(value, path) {
  if (typeof value !== 'boolean') throw new ValidationError(`${path} must be true or false.`);
  return value;
}

/**
 * Season Identification from two signals: how much momentum you have (1-5) and
 * which way it is moving. Returns null when the signals cannot tell (momentum 3, steady).
 */
export function diagnoseSeason({ momentum, trend }) {
  if (momentum >= 4) return trend === 'falling' ? 'descending' : 'peak';
  if (momentum <= 2) return trend === 'rising' ? 'ascending' : 'valley';
  if (trend === 'rising') return 'ascending';
  if (trend === 'falling') return 'descending';
  return null;
}

// Seasonal Alignment: does what you are doing match what the season supports?
export function checkAlignment(season, activityId) {
  const activity = ACTIVITIES[activityId];
  if (activity.id === season.mode) {
    return { status: 'aligned', note: `${season.alignedFocus}: ${season.alignedBehavior}` };
  }
  if (activity.id === 'pushing') {
    return {
      status: 'trap',
      trap: season.trap.name,
      note: `${season.trap.name}: ${season.trap.misaligned} ${season.trap.burnout}`,
    };
  }
  const doing = SEASONS.find((s) => s.mode === activity.id);
  if (activity.intensity > season.intensity) {
    return {
      status: 'overreaching',
      note: `You are doing ${doing.name} work in a ${season.name} season. Asking for more than the season supports leads to burnout and frustration.`,
    };
  }
  if (activity.intensity < season.intensity) {
    return {
      status: 'under-using',
      note: `You are doing ${doing.name} work in a ${season.name} season. Applying a lower season's strategy here means missed opportunity.`,
    };
  }
  return {
    status: 'mismatched',
    note: `You are doing ${doing.name} work in a ${season.name} season. ${
      season.id === 'descending'
        ? 'Starting new experiments now spends the energy you need to close your loops.'
        : 'Closing things down now stalls the momentum you are trying to build.'
    }`,
  };
}

function readAttachment(a, i) {
  const path = `attachments[${i}]`;
  if (!a || typeof a !== 'object') throw new ValidationError(`${path} must be an object.`);
  const name = typeof a.name === 'string' ? a.name.trim() : '';
  if (!name || name.length > 100) throw new ValidationError(`${path}.name must be 1 to 100 characters.`);
  if (!ATTACHMENT_TRENDS.includes(a.trend)) {
    throw new ValidationError(`${path}.trend must be one of: ${ATTACHMENT_TRENDS.join(', ')}.`);
  }
  const wouldCollapse = a.wouldCollapseWithIt === undefined ? null : readBool(a.wouldCollapseWithIt, `${path}.wouldCollapseWithIt`);
  return { name, trend: a.trend, wouldCollapseWithIt: wouldCollapse };
}

// The Falling Structure Test.
export function classifyAttachment({ trend, wouldCollapseWithIt }) {
  if (trend === 'rising') return { structure: 'rising', action: 'keep', note: 'A good crowd. Proximity to it is a force multiplier.' };
  if (trend === 'stable') return { structure: 'stable', action: 'reassess', note: 'Stable for now. Reassess periodically; do not mistake familiarity for stability.' };
  if (wouldCollapseWithIt) {
    return { structure: 'falling', action: 'detach', note: `You would fall with it. ${STRATEGIES.attachment.waveRule}` };
  }
  return { structure: 'falling', action: 'prune', note: 'It is falling, but you would still stand. Loosen the connection before the domino chain reaches you.' };
}

/**
 * Locate yourself in the cycle and check your alignment.
 *
 * input = {
 *   season: 'peak'|'descending'|'valley'|'ascending',   // or give `signals` instead
 *   signals: { momentum: 1-5, trend: 'rising'|'steady'|'falling' },
 *   activity: 'executing'|'consolidating'|'restoring'|'experimenting'|'pushing',
 *   frequency: { actingFromValues: 1-5, keptRoutine: boolean },        // optional
 *   attachments: [{ name, trend: 'rising'|'stable'|'falling', wouldCollapseWithIt: boolean }], // optional
 *   monthsInSeason: 0-60                                                // optional
 * }
 */
export function assessRhythm(input = {}) {
  let seasonId;
  let source;
  if (input.season !== undefined) {
    if (!seasonById(input.season)) {
      throw new ValidationError(`season must be one of: ${SEASONS.map((s) => s.id).join(', ')}.`);
    }
    seasonId = input.season;
    source = 'stated';
  } else if (input.signals !== undefined) {
    const momentum = readRating(input.signals?.momentum, 'signals.momentum');
    if (!TRENDS.includes(input.signals.trend)) throw new ValidationError(`signals.trend must be one of: ${TRENDS.join(', ')}.`);
    seasonId = diagnoseSeason({ momentum, trend: input.signals.trend });
    if (!seasonId) {
      throw new ValidationError('These signals sit between seasons (medium momentum, holding steady). Name the phase: send season instead.');
    }
    source = 'diagnosed';
  } else {
    throw new ValidationError('Send either season or signals.');
  }
  const season = seasonById(seasonId);

  if (!ACTIVITIES[input.activity]) {
    throw new ValidationError(`activity must be one of: ${Object.keys(ACTIVITIES).join(', ')}.`);
  }
  const alignment = checkAlignment(season, input.activity);

  let frequency = null;
  if (input.frequency !== undefined) {
    if (!input.frequency || typeof input.frequency !== 'object') throw new ValidationError('frequency must be an object.');
    const actingFromValues = readRating(input.frequency.actingFromValues, 'frequency.actingFromValues');
    const keptRoutine =
      input.frequency.keptRoutine === undefined ? null : readBool(input.frequency.keptRoutine, 'frequency.keptRoutine');
    const drifting = actingFromValues <= 2 || keptRoutine === false;
    frequency = {
      actingFromValues,
      keptRoutine,
      status: drifting ? 'drifting' : actingFromValues === 3 ? 'wavering' : 'anchored',
      note: drifting ? season.frequency.drift : season.frequency.anchor,
    };
  }

  let attachments = null;
  if (input.attachments !== undefined) {
    if (!Array.isArray(input.attachments) || input.attachments.length > MAX_ATTACHMENTS) {
      throw new ValidationError(`attachments must be a list of up to ${MAX_ATTACHMENTS} attachments.`);
    }
    attachments = input.attachments.map(readAttachment).map((a) => ({ ...a, ...classifyAttachment(a) }));
  }

  let monthsInSeason = null;
  if (input.monthsInSeason !== undefined) {
    const n = Number(input.monthsInSeason);
    if (!Number.isInteger(n) || n < 0 || n > 60) throw new ValidationError('monthsInSeason must be a whole number from 0 to 60.');
    monthsInSeason = n;
  }

  return {
    season: {
      id: season.id,
      name: season.name,
      stage: season.stage,
      source,
      alignedFocus: season.alignedFocus,
      strategicResponse: season.strategicResponse,
      masterThought: season.masterThought,
      doNotJudge: season.doNotJudge || null,
    },
    alignment,
    frequency,
    attachments,
    recommendations: recommend({ season, alignment, frequency, attachments, monthsInSeason }),
    dailyCards: DAILY_CARDS,
  };
}

function recommend({ season, alignment, frequency, attachments, monthsInSeason }) {
  const recs = [];

  if (alignment.status === 'aligned') {
    recs.push({ practice: `${season.name}: ${season.alignedFocus}`, reason: 'You are aligned with your season.', action: season.objectives[0] });
  } else {
    recs.push({
      practice: 'Realign with the Season',
      reason: alignment.note,
      action: `Stop, name the phase (${season.name}) and lower your intensity to match it. ${season.alignedFocus}: ${season.alignedBehavior}`,
    });
  }

  if (frequency && frequency.status !== 'anchored') {
    const guards = frequency.keptRoutine === false ? ['routine', 'observer'] : ['observer', 'identity'];
    recs.push({
      practice: 'Frequency Guards',
      reason: frequency.note,
      action: guards.map((id) => FREQUENCY.guards.find((g) => g.id === id)).map((g) => `${g.name}: ${g.description}`).join(' '),
    });
  }

  const detach = (attachments || []).filter((a) => a.action === 'detach').map((a) => a.name);
  if (detach.length) {
    recs.push({ practice: 'Detachment Execution', reason: `Falling structures you would fall with: ${detach.join(', ')}.`, action: STRATEGIES.attachment.phases[1] });
  }
  const prune = (attachments || []).filter((a) => a.action === 'prune').map((a) => a.name);
  if (prune.length) {
    recs.push({ practice: 'Ongoing Maintenance', reason: `Falling, but not taking you with them yet: ${prune.join(', ')}.`, action: STRATEGIES.attachment.phases[3] });
  }
  if (attachments && attachments.length && !attachments.some((a) => a.structure === 'rising')) {
    recs.push({ practice: 'Re-Attachment', reason: 'None of your attachments is rising.', action: STRATEGIES.attachment.phases[2] });
  }

  if (monthsInSeason !== null && monthsInSeason >= 3) {
    if (season.id === 'peak' || season.id === 'ascending') {
      recs.push({ practice: 'Create a Forced Valley', reason: `You have been in a high-output season for ${monthsInSeason} months.`, action: MASTERY.artificialSeasons.forcedValley });
    } else if (season.id === 'valley') {
      recs.push({ practice: 'Create a Forced Peak', reason: `You have been in the Valley for ${monthsInSeason} months.`, action: MASTERY.artificialSeasons.forcedPeak });
    }
  }

  if (season.id === 'peak') {
    recs.push({ practice: 'The Exit Mentality', reason: 'Any structure that rises must fall.', action: season.exitQuestion });
  }

  return recs;
}
