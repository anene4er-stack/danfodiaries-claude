import { ABUNDANCE_CYCLE, FEEDBACK_LOOP, FLOW_STATES, STEWARDSHIP, VOLUME_MANDATE } from './framework.js';

const MAX_SEEDS = 100000;
const GOVERNANCE = ['reacting', 'setting-terms'];

// Stewardship rating (0-5) -> Stewardship Factor. 0 wipes out the harvest,
// 3 returns exactly what you put in, and 4-5 multiply it.
export const STEWARDSHIP_FACTORS = [0, 0.5, 0.75, 1, 1.5, 2];

export class ValidationError extends Error {}

function readInt(value, path, min, max) {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || !Number.isInteger(n) || n < min || n > max) {
    throw new ValidationError(`${path} must be a whole number from ${min} to ${max}.`);
  }
  return n;
}

function readBool(value, path) {
  if (typeof value !== 'boolean') throw new ValidationError(`${path} must be true or false.`);
  return value;
}

export function stewardshipFor(rating) {
  const factor = STEWARDSHIP_FACTORS[rating];
  let level;
  if (factor === 0) level = 'negligent';
  else if (factor < 1) level = 'leaking';
  else if (factor === 1) level = 'break-even';
  else level = 'multiplier';
  return { rating, factor, level };
}

// The Calibration Protocol: "Did the input match the output?"
export function calibrate({ quality, seeds, germinating, target, stewardship, cycleComplete, seedsNeeded }) {
  if (seeds === 0) {
    return {
      id: 'no-sowing',
      summary: 'Nothing was sown this cycle. A seed without work is only a thought.',
      action: 'Deploy energy: plant your first seeds through consistent, high-quality service.',
    };
  }
  if (germinating >= target) {
    return {
      id: 'successful',
      summary: 'The harvest met the target. The input matched the output.',
      action: `${FEEDBACK_LOOP.calibration.successful} Then reinvest a portion of the harvest into it.`,
    };
  }
  if (!cycleComplete) {
    return {
      id: 'lag-phase',
      summary: `The cycle is not complete, so this is noise, not signal. Beware ${FEEDBACK_LOOP.latencyGap.danger}.`,
      action: `${FEEDBACK_LOOP.latencyGap.rule} Keep stewarding the field through the Lag Phase.`,
    };
  }
  if (stewardship.factor === 0) {
    return {
      id: 'zero-stewardship',
      summary: 'With a Stewardship Factor of 0, the harvest is 0 no matter how many seeds you sow.',
      action: 'Harden your environment before sowing more: protect focus, weed distractions, and guard the growth.',
    };
  }
  if (quality < 3) {
    return {
      id: 'weak-seed',
      summary: 'The harvest was underwhelming because the input was insufficient in quality: the seed was weak.',
      action: 'Discard low-yield activities and refine the seed before increasing volume.',
    };
  }
  return {
    id: 'insufficient-volume',
    summary: 'The harvest was underwhelming because the input was insufficient in volume: you did not plant enough.',
    action:
      seedsNeeded === null
        ? 'Nothing germinated yet. Sow 10x the seeds, find the one that got even a single response, and pivot your energy to that type of seed.'
        : `At your germination rate you need about ${seedsNeeded} seeds per cycle to reach ${target} harvests. ${VOLUME_MANDATE.realityCheck[2].replace('The Mandate: ', '')}`,
  };
}

/**
 * Run the Law of Compensation numbers for one cycle (e.g. one week).
 *
 * input = {
 *   seedQuality: 1-5,           // Quality of Seed
 *   seedsPerWeek: 0-100000,     // Volume of Input
 *   germinating: 0-seedsPerWeek,// seeds that got a response or moved the needle
 *   targetHarvests: 1-100000,   // the harvest you wanted
 *   stewardship: 0-5,           // how well you protected the growth
 *   cycleComplete: boolean,     // has the germination cycle had time to mature?
 *   audit: { weedsLowYield: bool, reinvestsHarvest: bool, governance: 'reacting'|'setting-terms' }, // optional
 *   receivesWithGratitude: boolean // optional: the Dynamics of Flow
 * }
 */
export function assessCompensation(input = {}) {
  const quality = readInt(input.seedQuality, 'seedQuality', 1, 5);
  const seeds = readInt(input.seedsPerWeek, 'seedsPerWeek', 0, MAX_SEEDS);
  const germinating = readInt(input.germinating, 'germinating', 0, seeds);
  const target = readInt(input.targetHarvests, 'targetHarvests', 1, MAX_SEEDS);
  const stewardship = stewardshipFor(readInt(input.stewardship, 'stewardship', 0, 5));
  const cycleComplete = readBool(input.cycleComplete, 'cycleComplete');

  const audit = input.audit === undefined ? null : readAudit(input.audit);
  const flow =
    input.receivesWithGratitude === undefined
      ? null
      : readBool(input.receivesWithGratitude, 'receivesWithGratitude')
        ? FLOW_STATES.flow
        : FLOW_STATES.bypass;

  const germinationRate = seeds === 0 ? null : germinating / seeds;
  const seedsNeeded = germinationRate ? Math.ceil(target / germinationRate) : null;

  const harvest = {
    formula: 'Total Harvest = (Quality of Seed x Volume of Input) x Stewardship Factor',
    quality,
    volume: seeds,
    stewardshipFactor: stewardship.factor,
    index: Math.round(quality * seeds * stewardship.factor * 100) / 100,
    note: 'A relative index: compare it cycle to cycle, not against other people.',
  };

  const volume = {
    seedsPerWeek: seeds,
    germinating,
    germinationRate: germinationRate === null ? null : Math.round(germinationRate * 1000) / 10,
    targetHarvests: target,
    seedsNeeded,
    volumeGap: seedsNeeded === null ? null : Math.max(0, seedsNeeded - seeds),
  };

  const calibration = calibrate({ quality, seeds, germinating, target, stewardship, cycleComplete, seedsNeeded });

  return {
    harvest,
    volume,
    stewardship,
    calibration,
    weeklyAudit: weeklyAudit({ quality, seeds, germinating, target, stewardship, seedsNeeded }),
    flow,
    recommendations: recommend({ calibration, stewardship, audit, flow }),
  };
}

function readAudit(audit) {
  if (!audit || typeof audit !== 'object') throw new ValidationError('audit must be an object.');
  const out = {};
  if (audit.weedsLowYield !== undefined) out.weedsLowYield = readBool(audit.weedsLowYield, 'audit.weedsLowYield');
  if (audit.reinvestsHarvest !== undefined) out.reinvestsHarvest = readBool(audit.reinvestsHarvest, 'audit.reinvestsHarvest');
  if (audit.governance !== undefined) {
    if (!GOVERNANCE.includes(audit.governance)) {
      throw new ValidationError(`audit.governance must be one of: ${GOVERNANCE.join(', ')}.`);
    }
    out.governance = audit.governance;
  }
  return out;
}

// The weekly Diagnostic Audit table, answered from the numbers.
function weeklyAudit({ quality, seeds, germinating, target, stewardship, seedsNeeded }) {
  const passed = {
    'Input Quality': quality >= 3,
    'Input Volume': seeds > 0 && seedsNeeded !== null && seeds >= seedsNeeded,
    Stewardship: stewardship.factor >= 1,
    'The Yield': germinating >= target,
  };
  return FEEDBACK_LOOP.weeklyAudit.map((row) => ({ ...row, passed: passed[row.component] }));
}

function recommend({ calibration, stewardship, audit, flow }) {
  const recs = [{ practice: 'The Calibration Protocol', reason: calibration.summary, action: calibration.action }];
  const test = (id) => STEWARDSHIP.audit.find((t) => t.id === id);

  if (stewardship.factor > 0 && stewardship.factor < 1 && calibration.id !== 'zero-stewardship') {
    recs.push({
      practice: 'Raise the Stewardship Factor',
      reason: `Your Stewardship Factor is ${stewardship.factor}: the environment is leaking part of every harvest.`,
      action: 'Harden your environment: remove the weeds of distraction and protect the growth during the Lag Phase.',
    });
  }

  if (audit?.weedsLowYield === false) {
    recs.push({ practice: test('leakage').name, reason: 'You keep sowing in fields that are not germinating.', action: 'Weed out those fields and move the seeds to the ones that respond.' });
  }
  if (audit?.reinvestsHarvest === false) {
    recs.push({ practice: test('preservation').name, reason: ABUNDANCE_CYCLE.consumerTrap, action: 'Reserve a portion of every win as seed corn and tithe it to your capacity.' });
  }
  if (audit?.governance === 'reacting') {
    recs.push({ practice: test('governance').name, reason: 'You are reacting to your environment: putting out fires.', action: 'Set the terms of your environment and systematically expand your productive capacity.' });
  }

  if (flow?.id === 'bypass') {
    recs.push({
      practice: 'Restore the Flow',
      reason: 'Receiving without gratitude creates a Bypass that interrupts the Law.',
      action: 'Acknowledge what you have received, out loud or in writing, to complete the exchange.',
    });
  }

  if (recs.length === 1 && calibration.id === 'successful') {
    recs.push({ practice: 'The Abundance Cycle', reason: 'The loop is working.', action: ABUNDANCE_CYCLE.engine });
  }

  return recs;
}
