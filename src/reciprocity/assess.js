import { FEEDBACK_LOOP, FLOW, GOODWILL, LAW, MIRROR, OFFER_DIMENSIONS } from './framework.js';

const MAX_RELATIONSHIPS = 20;

export class ValidationError extends Error {}

function readRating(value, path) {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || !Number.isInteger(n) || n < 1 || n > 5) {
    throw new ValidationError(`${path} must be an integer from 1 to 5.`);
  }
  return n;
}

function readOptionalBool(value, path) {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw new ValidationError(`${path} must be true or false.`);
  return value;
}

const round1 = (n) => Math.round(n * 10) / 10;

// Compare the reward you offer with the effort that comes back.
export function classifyExchange(rewardInput, received) {
  const gap = round1(received - rewardInput);
  if (gap >= 1.5) {
    return {
      status: 'overdrawn',
      note: 'They are giving far more than you offer. A low reward cannot sustain high effort for long.',
    };
  }
  if (gap <= -1.5) {
    return {
      status: 'unreturned',
      note: 'You are sowing generously, but little comes back. Not every ground yields: check the flow before you blame the ground.',
    };
  }
  if (rewardInput < 3) {
    return { status: 'sloppy-reward', note: `${LAW.youGetWhatYouPayFor} The effort you receive mirrors the reward you offer.` };
  }
  if (rewardInput >= 3.5 && received >= 3.5) {
    return { status: 'good-measure', note: `${FEEDBACK_LOOP.high.input}: ${FEEDBACK_LOOP.high.output}` };
  }
  return { status: 'balanced', note: 'What you offer and what you receive are roughly even.' };
}

function readRelationship(r, i) {
  const path = `relationships[${i}]`;
  if (!r || typeof r !== 'object') throw new ValidationError(`${path} must be an object.`);
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (!name || name.length > 100) throw new ValidationError(`${path}.name must be 1 to 100 characters.`);
  if (!r.offered || typeof r.offered !== 'object') throw new ValidationError(`${path}.offered is required.`);

  const offered = Object.fromEntries(
    OFFER_DIMENSIONS.map((d) => [d.id, readRating(r.offered[d.id], `${path}.offered.${d.id}`)]),
  );
  return {
    name,
    offered,
    received: readRating(r.received, `${path}.received`),
    measureMatches: readOptionalBool(r.measureMatches, `${path}.measureMatches`),
    gratitude: readOptionalBool(r.gratitude, `${path}.gratitude`),
  };
}

/**
 * Audit the exchange in the relationships and teams you lead.
 *
 * input = {
 *   relationships: [{
 *     name,
 *     offered: { environment: 1-5, appreciation: 1-5, resources: 1-5 }, // the reward you offer
 *     received: 1-5,             // the effort and quality that come back
 *     measureMatches: boolean,   // optional: would you accept the measure you use on them?
 *     gratitude: boolean         // optional: do you acknowledge what they give?
 *   }],
 *   inPeak: boolean              // optional: are you in a Peak season right now?
 * }
 */
export function assessReciprocity(input = {}) {
  const list = input.relationships;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_RELATIONSHIPS) {
    throw new ValidationError(`relationships must be a list of 1 to ${MAX_RELATIONSHIPS} relationships.`);
  }
  const inPeak = readOptionalBool(input.inPeak, 'inPeak');

  const relationships = list.map(readRelationship).map((r) => {
    const rewardInput = round1(OFFER_DIMENSIONS.reduce((sum, d) => sum + r.offered[d.id], 0) / OFFER_DIMENSIONS.length);
    const weakest = OFFER_DIMENSIONS.reduce((a, b) => (r.offered[b.id] < r.offered[a.id] ? b : a));
    const flow = r.gratitude === undefined ? null : r.gratitude ? FLOW.flow.id : FLOW.bypass.id;
    return {
      ...r,
      rewardInput,
      gap: round1(r.received - rewardInput),
      weakestOffer: { id: weakest.id, name: weakest.name, score: r.offered[weakest.id] },
      flow,
      ...classifyExchange(rewardInput, r.received),
    };
  });

  const avg = (key) => round1(relationships.reduce((s, r) => s + r[key], 0) / relationships.length);
  const mirror = {
    averageOffered: avg('rewardInput'),
    averageReceived: avg('received'),
    pattern: findPattern(relationships),
  };

  return {
    mirror,
    relationships,
    recommendations: recommend(relationships, mirror, inPeak),
  };
}

// The Mirror Principle: if the same offer is your weakest across most relationships,
// the common factor is what you bring, not the people.
function findPattern(relationships) {
  if (relationships.length < 3) return null;
  const counts = {};
  for (const r of relationships) if (r.weakestOffer.score < 4) counts[r.weakestOffer.id] = (counts[r.weakestOffer.id] || 0) + 1;
  const [id, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
  if (!id || count * 2 <= relationships.length) return null;
  const dim = OFFER_DIMENSIONS.find((d) => d.id === id);
  return {
    dimension: dim.id,
    name: dim.name,
    count,
    of: relationships.length,
    note: `${dim.name} is your lowest offer in ${count} of ${relationships.length} relationships. ${MIRROR.inOthers}`,
  };
}

function recommend(relationships, mirror, inPeak) {
  const recs = [];
  const dim = (id) => OFFER_DIMENSIONS.find((d) => d.id === id);
  const names = (filter) => relationships.filter(filter).map((r) => r.name);

  if (mirror.pattern) {
    recs.push({
      practice: 'The Mirror',
      reason: mirror.pattern.note,
      action: `Before asking more of anyone, raise your ${mirror.pattern.name.toLowerCase()}: ${dim(mirror.pattern.dimension).howToRaise}`,
    });
  }

  for (const r of relationships) {
    if (r.status === 'sloppy-reward' && r.weakestOffer.id !== mirror.pattern?.dimension) {
      recs.push({
        practice: 'You Get What You Pay For',
        reason: `${r.name}: you offer ${r.rewardInput}/5 and receive ${r.received}/5. ${r.weakestOffer.name} is your lowest offer.`,
        action: dim(r.weakestOffer.id).howToRaise,
      });
    } else if (r.status === 'overdrawn') {
      recs.push({
        practice: 'Repay the Account',
        reason: `${r.name} gives ${r.received}/5 against the ${r.rewardInput}/5 you offer.`,
        action: `Raise your ${r.weakestOffer.name.toLowerCase()} before their effort drains: ${dim(r.weakestOffer.id).howToRaise}`,
      });
    } else if (r.status === 'unreturned' && r.flow !== FLOW.bypass.id) {
      recs.push({
        practice: 'Check the Ground',
        reason: `${r.name}: you offer ${r.rewardInput}/5 but receive ${r.received}/5.`,
        action: 'Ask what they need that you are not giving, and whether this is good ground. Keep sowing, but do not keep pouring into a bypass.',
      });
    }
  }

  const unmatched = names((r) => r.measureMatches === false);
  if (unmatched.length) {
    recs.push({ practice: 'Audit the Measure', reason: `You would not accept the measure you use on: ${unmatched.join(', ')}.`, action: MIRROR.auditTheMeasure });
  }

  const bypassed = names((r) => r.flow === FLOW.bypass.id);
  if (bypassed.length) {
    recs.push({
      practice: 'Restore the Flow',
      reason: `Receiving without gratitude creates a ${FLOW.bypass.name}: ${bypassed.join(', ')}.`,
      action: 'Acknowledge what they give you, specifically, so the exchange is completed.',
    });
  }

  if (inPeak) {
    recs.push({ practice: 'Build Goodwill at the Peak', reason: GOODWILL.pressureValve, action: GOODWILL.goodCrowd });
  }

  if (!recs.length) {
    recs.push({ practice: 'The Good Measure', reason: 'Your exchanges are healthy.', action: LAW.radiate });
  }

  return recs;
}
