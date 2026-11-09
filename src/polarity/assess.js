import { AGENCY, ATTENTION, DAILY_CHECKLIST, LAW, MIRROR, PATTERN_INTERRUPTS, SCALES } from './framework.js';

const POSITIONS = {
  1: { id: 'low-pole', label: 'At the low pole' },
  2: { id: 'leaning-low', label: 'Leaning toward the low pole' },
  3: { id: 'midpoint', label: 'At the midpoint' },
  4: { id: 'leaning-high', label: 'Leaning toward the high pole' },
  5: { id: 'high-pole', label: 'At the high pole' },
};
const REACTIONS = Object.keys(MIRROR.kinds);
const MAX_SELF_TALK = 2000;

export class ValidationError extends Error {}

function readNumber(value, path, min, max, { integer = false } = {}) {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || Number.isNaN(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
    throw new ValidationError(`${path} must be ${integer ? 'a whole number' : 'a number'} from ${min} to ${max}.`);
  }
  return n;
}

// Where you sit on the scale, and what moving along it asks of you.
export function locateOnScale(scale, position) {
  const where = POSITIONS[position];
  let urgency;
  let note;
  if (position === 1) {
    urgency = 'heavy';
    note = `You are at ${scale.low}. Start with a pattern interrupt to break the loop, then shift: ${scale.shift}`;
  } else if (position === 2) {
    urgency = 'catch-it-now';
    note = `You are leaning toward ${scale.low}. ${LAW.catchItEarly} ${scale.shift}`;
  } else if (position === 3) {
    urgency = 'lean-in';
    note = `You are between ${scale.low} and ${scale.high}. Choose the pole you feed: ${scale.shift}`;
  } else {
    urgency = 'hold';
    note = `You are at or near ${scale.high}. Keep feeding this pole with your focus.`;
  }
  return { position, ...where, urgency, note };
}

// The Agency Audit: find disempowering phrases in self-talk and suggest the swap.
const EMOTION_NOUNS = {
  stressed: 'stress', angry: 'anger', anxious: 'anxiety', sad: 'sadness', depressed: 'a low mood',
  overwhelmed: 'overwhelm', frustrated: 'frustration', scared: 'fear', afraid: 'fear', tired: 'tiredness',
  exhausted: 'exhaustion', upset: 'distress', furious: 'fury', worried: 'worry', nervous: 'nervousness', jealous: 'jealousy',
};
const LANGUAGE_PATTERNS = [
  {
    id: 'have-to',
    regex: /\bI\s+(?:have|need|got)\s+to\b/gi,
    suggest: () => 'I choose to',
    why: 'Even when there is no other logical choice, you are choosing to meet an obligation. The swap lowers the internal resistance.',
  },
  {
    id: 'i-am-emotion',
    regex: /\bI(?:'m|\s+am)\s+(?:so\s+|really\s+|very\s+)?(stressed|angry|anxious|sad|depressed|overwhelmed|frustrated|scared|afraid|tired|exhausted|upset|furious|worried|nervous|jealous)\b/gi,
    suggest: (m) => `I am experiencing ${EMOTION_NOUNS[m[1].toLowerCase()]}`,
    why: 'Saying "I am" makes the emotion your identity. "I am experiencing" makes it weather passing through: you are the sky, not the cloud.',
  },
  {
    id: 'i-am-a-failure',
    regex: /\bI(?:'m|\s+am)\s+(?:a\s+)?(?:failure|loser|useless|worthless)\b/gi,
    suggest: () => 'This is a result',
    why: 'Shame is the low pole of the Shame↔Data scale. Treat the event as neutral data, not as a definition of you.',
  },
  {
    id: 'problem',
    regex: /\b(?:this|it)(?:'s|\s+is)\s+(?:a|such\s+a|a\s+huge|a\s+big)\s+problem\b/gi,
    suggest: () => 'This is a challenge (or data)',
    why: 'A "problem" implies it should not exist. "Data" implies something to analyze and solve.',
  },
  {
    id: 'killing-me',
    regex: /\b(?:is|are)\s+killing\s+me\b/gi,
    suggest: () => 'I am finding this hard, and I choose how I respond',
    why: 'Phrases like this externalize your power: they imply your life is happening to you.',
  },
];

export function auditLanguage(text) {
  const findings = [];
  for (const p of LANGUAGE_PATTERNS) {
    for (const m of text.matchAll(p.regex)) {
      findings.push({ pattern: p.id, found: m[0], suggestion: p.suggest(m), why: p.why });
    }
  }
  return findings;
}

/**
 * Locate yourself on a polarity scale and audit what is feeding your vibration.
 *
 * input = {
 *   scale: 'anxiety-excitement' | ... ,  // one of SCALES
 *   position: 1-5,                       // 1 = at the low pole, 5 = at the high pole
 *   attention: { signalHours: 0-24, noiseHours: 0-24, openLoops: 0-500, leaks: [leak ids] }, // optional
 *   mirror: { trait: string, reaction: 'irritation'|'admiration'|'envy', pattern: boolean },  // optional
 *   selfTalk: string                     // optional: how you have been talking to yourself
 * }
 */
export function assessPolarity(input = {}) {
  const scale = SCALES.find((s) => s.id === input.scale);
  if (!scale) throw new ValidationError(`scale must be one of: ${SCALES.map((s) => s.id).join(', ')}.`);
  const position = readNumber(input.position, 'position', 1, 5, { integer: true });
  const location = locateOnScale(scale, position);

  let attention = null;
  if (input.attention !== undefined) {
    const a = input.attention;
    if (!a || typeof a !== 'object') throw new ValidationError('attention must be an object.');
    const signalHours = readNumber(a.signalHours, 'attention.signalHours', 0, 24);
    const noiseHours = readNumber(a.noiseHours, 'attention.noiseHours', 0, 24);
    if (signalHours + noiseHours > 24) throw new ValidationError('attention.signalHours and noiseHours cannot add up to more than 24.');
    const openLoops = a.openLoops === undefined ? 0 : readNumber(a.openLoops, 'attention.openLoops', 0, 500, { integer: true });
    const known = ATTENTION.leaks.map((l) => l.id);
    const leakIds = a.leaks === undefined ? [] : a.leaks;
    if (!Array.isArray(leakIds) || leakIds.some((l) => !known.includes(l))) {
      throw new ValidationError(`attention.leaks must be a list containing only: ${known.join(', ')}.`);
    }
    const total = signalHours + noiseHours;
    attention = {
      signalHours,
      noiseHours,
      signalShare: total === 0 ? null : Math.round((signalHours / total) * 100),
      status: total === 0 ? 'unmeasured' : noiseHours >= signalHours ? 'leaking' : 'focused',
      openLoops,
      leaks: [...new Set(leakIds)].map((id) => ATTENTION.leaks.find((l) => l.id === id)),
    };
  }

  let mirror = null;
  if (input.mirror !== undefined) {
    const m = input.mirror;
    if (!m || typeof m !== 'object') throw new ValidationError('mirror must be an object.');
    const trait = typeof m.trait === 'string' ? m.trait.trim() : '';
    if (!trait || trait.length > 100) throw new ValidationError('mirror.trait must be 1 to 100 characters.');
    if (!REACTIONS.includes(m.reaction)) throw new ValidationError(`mirror.reaction must be one of: ${REACTIONS.join(', ')}.`);
    if (m.pattern !== undefined && typeof m.pattern !== 'boolean') throw new ValidationError('mirror.pattern must be true or false.');
    const kind = MIRROR.kinds[m.reaction];
    mirror = {
      trait,
      reaction: m.reaction,
      name: kind.name,
      mechanism: kind.mechanism,
      diagnostic: kind.diagnostic,
      release: kind.release,
      lens: m.pattern ? MIRROR.lens : null,
      inquiry: MIRROR.inquiry,
    };
  }

  let language = null;
  if (input.selfTalk !== undefined) {
    if (typeof input.selfTalk !== 'string' || input.selfTalk.length > MAX_SELF_TALK) {
      throw new ValidationError(`selfTalk must be text of up to ${MAX_SELF_TALK} characters.`);
    }
    language = auditLanguage(input.selfTalk);
  }

  return {
    scale: { id: scale.id, low: scale.low, high: scale.high, sharedNature: scale.sharedNature },
    location,
    attention,
    mirror,
    language,
    recommendations: recommend({ scale, location, attention, mirror, language }),
    dailyChecklist: DAILY_CHECKLIST,
  };
}

function recommend({ scale, location, attention, mirror, language }) {
  const recs = [];

  if (location.urgency === 'heavy') {
    recs.push({ practice: 'Pattern Interrupt', reason: `You are at ${scale.low}; the vibration is heavy.`, action: PATTERN_INTERRUPTS.join(' Or: ') });
  }
  if (location.urgency !== 'hold') {
    recs.push({ practice: `Shift the Pole: ${scale.low} → ${scale.high}`, reason: LAW.replaceNotSuppress, action: scale.shift });
  }

  if (attention?.status === 'leaking') {
    recs.push({
      practice: 'The Attentional Audit',
      reason: `${attention.noiseHours}h on noise against ${attention.signalHours}h on signal. ${LAW.mentalVibration}`,
      action: ATTENTION.audit.join(' '),
    });
  }
  for (const leak of attention?.leaks || []) {
    recs.push({ practice: `Plug the Leak: ${leak.name}`, reason: ATTENTION.budget, action: leak.fix });
  }
  if (attention?.openLoops > 0) {
    recs.push({ practice: 'Offloading', reason: `${attention.openLoops} open loop${attention.openLoops === 1 ? '' : 's'} running in the background.`, action: ATTENTION.openLoops });
  }

  if (mirror) {
    recs.push({ practice: mirror.name, reason: `"${mirror.trait}": ${mirror.mechanism}`, action: `${mirror.diagnostic} ${mirror.release}` });
    if (mirror.lens) recs.push({ practice: mirror.lens.name, reason: mirror.lens.mechanism, action: mirror.lens.practice });
    if (mirror.reaction === 'irritation') {
      recs.push({ practice: 'The Contribution Question', reason: 'Blame surrenders your power to the other person.', action: MIRROR.contributionQuestion });
    }
  }

  if (language?.length) {
    recs.push({
      practice: 'The Agency Audit',
      reason: `${language.length} disempowering phrase${language.length === 1 ? '' : 's'} in your self-talk.`,
      action: language.map((f) => `"${f.found}" → "${f.suggestion}"`).join('; '),
    });
  }

  if (!recs.length) {
    recs.push({ practice: 'The Observer Self', reason: `You are holding ${scale.high}.`, action: AGENCY.observerSelf });
  }

  return recs;
}
