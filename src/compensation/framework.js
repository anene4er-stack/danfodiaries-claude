// Law of Compensation: what you give, you get.
//
// Sources: the notes in the "Law of Compensation" Google Drive folder: the reference
// notes, Key to Symbols, Seed and Harvest, Volume is Mandatory, Stewardship, the
// Feedback Loop, the image reflections and the Unified Theory summary.

import { CYCLE, TERMS } from '../cultivation/framework.js';

export const LAW = {
  name: 'The Law of Compensation',
  maxim: 'What you give, you get.',
  definition:
    'A universal law of cause and effect applied to blessings and abundance. The inputs you give the ' +
    'world manifest as tangible outcomes: gifts, money, friendships and general blessings. It operates ' +
    'as infallibly as gravitation.',
  orderOfOperations: 'Do your job and demand your compensation, but in that order.',
  serviceIncome: 'Your income is determined by how many people you serve and how well you serve them.',
  balance:
    'For everything you have missed, you have gained something else, and for everything you gain you ' +
    'lose something else. (Emerson)',
  mirror: 'Reality is a mirror. The external world cannot initiate; it only reflects.',
};

// Total Harvest = (Quality of Seed x Volume of Input) x Stewardship Factor
export const HARVEST_FORMULA = {
  expression: 'Total Harvest = (Quality of Seed x Volume of Input) x Stewardship Factor',
  terms: {
    quality: 'Quality of Seed: the value of what you sow. Talent and the integrity of your input.',
    volume: 'Volume of Input: how many seeds you sow. Volume gives you the statistical probability of success.',
    stewardship:
      'Stewardship Factor: the multiplier. At 0 the harvest is 0 however many seeds you sow; at 1 you get ' +
      'exactly what you put in; above 1, even small inputs are protected until they yield exponential returns.',
  },
};

// Key to Symbols from the diagrams.
export const SYMBOLS = [
  { symbol: 'Circle with "X"', meaning: 'Input / Sowing: the action, effort or gift you release.' },
  { symbol: 'Circle with "I"', meaning: 'Return / Harvest: the compensation that comes back.' },
  { symbol: 'Double circle "XI"', meaning: 'The Core Source / Self (the Nexus) where sowing starts and harvest returns.' },
  { symbol: 'Box with "I"', meaning: 'Good ground: an environment where the seed can grow.' },
  { symbol: 'Box with "X"', meaning: 'Poor ground: obstacles where the input produces no return.' },
];

export const SEED_AND_HARVEST = {
  seed: 'Energy + Intent. A seed without work is a thought (latent energy); a seed with work is a catalyst.',
  harvest: 'Service + Scaling. The evidence that your energy was processed by the world and returned, amplified.',
  sowers: {
    prolific: {
      name: 'The Prolific Sower (System of Abundance)',
      description: 'Sows many seeds across channels and keeps the cycle rotating, so some land in good ground.',
    },
    poor: {
      name: 'The Poor Steward (System of Waste)',
      description: 'Takes resources but withholds or misplaces them. No return loop: a net loss, not a harvest.',
    },
  },
  principles: [
    'Consistency over size: the habit of sowing matters more than the magnitude of a single gift.',
    'A sower is always sowing: it is a continuous process, not a one-time event.',
    'Not every ground yields. Only volume and consistency reach the good ground.',
  ],
};

// The Dynamics of Flow.
export const FLOW_STATES = {
  flow: { id: 'flow', name: 'Healthy Flow', receiver: 'Gratitude', outcome: 'Continued Abundance' },
  bypass: { id: 'bypass', name: 'Bypass', receiver: 'Self-Absorbed', outcome: 'Blocked / Interrupted Law' },
};

export const VOLUME_MANDATE = {
  principle: 'Volume is the requirement to overcome Entropic Resistance. If the harvest is absent, the volume is insufficient to overcome the friction of the field.',
  statisticalCertainty:
    'If 100 seeds typically yield 10 harvests and you need 50 harvests, you must sow 500 seeds. You shift from hoping to calculating.',
  velocityOfIteration: 'Each seed is a question you ask the market. Volume creates the intelligence to make better harvests.',
  grind: 'The Grind (Blind Volume): doing the same unproductive thing a million times. High output, no refinement.',
  calibrated: 'Calibrated Volume: sow high volumes, measure the germination rate of every field, and do more of what works.',
  realityCheck: [
    'Map the Input: how many seeds are you planting per week?',
    'Audit the Germination: what percentage are actually germinating?',
    'The Mandate: if germination is low, do not decrease volume. Increase it while tightening the feedback loop.',
  ],
};

export const STEWARDSHIP = {
  principle: 'Hard work is the seed; Stewardship is the governance of the environment in which it germinates.',
  dimensions: [
    { name: 'Defense Against Entropy', description: 'Remove the weeds of distraction, inefficiency and negative belief before they choke the harvest.' },
    { name: 'The Protection of Resources', description: 'Do not consume the whole harvest. Keep the "seed corn" to reinvest.' },
    { name: 'Resource Allocation', description: 'Know where your energy is leaking versus where it is growing.' },
    { name: 'Stewardship of the Lag Phase', description: 'Protect the seed during the darkness, before there is evidence of a harvest.' },
    { name: 'Internal Stewardship', description: 'A reactive or unfocused Nexus keeps the Stewardship Factor low.' },
  ],
  audit: [
    { id: 'leakage', name: 'The Leakage Test', question: 'Are you weeding out the fields where effort is not raising germination, or still wasting soil there?' },
    { id: 'preservation', name: 'The Preservation Test', question: 'When you win, do you consume it all, or reserve a portion to reinvest?' },
    { id: 'governance', name: 'The Governance Test', question: 'Are you reacting to your environment, or setting its terms?' },
  ],
};

export const FEEDBACK_LOOP = {
  principle: 'The Feedback Loop is the Self-Correction Engine. A Gambler blames luck; an Engineer treats the result as data and recalibrates.',
  mirror: 'A zero harvest is not a judgment on your worth; it is a diagnostic.',
  latencyGap: {
    danger: 'Premature Pivoting',
    noise: 'Random, short-term fluctuations (one bad day, one rejected proposal).',
    signal: 'Trends that emerge over the proper germination cycle.',
    rule: 'Do not let the Feedback Loop trigger an adjustment until the cycle is complete.',
  },
  calibration: {
    underwhelming: 'The input was insufficient in quality (the seed was weak) or in volume (you did not plant enough).',
    successful: 'Codify the input. The exact variable that caused the success is your "Golden Seed."',
  },
  spiral: 'Seed -> Work -> Harvest -> Reinvest Portion of Harvest into Seed. Consuming the harvest resets the loop to zero.',
  weeklyAudit: [
    { component: 'Input Quality', question: 'Is the work truly high-value, or just busy work?', action: 'Discard low-yield activities.' },
    { component: 'Input Volume', question: 'Am I planting enough seeds to create statistical certainty?', action: 'Increase output in the proven areas.' },
    { component: 'Stewardship', question: 'Did I protect the growth, or let distractions kill it?', action: 'Harden your environment.' },
    { component: 'The Yield', question: 'Does the current harvest justify the energy cost?', action: 'If no, shift the entire strategy.' },
  ],
  goal: 'Shrink the time between an error and its correction.',
};

export const PROCESS = [
  { stage: 1, name: 'Preparation', action: 'Clear the Soil', focus: 'Remove limiting beliefs, habits and stagnant boxes.' },
  { stage: 2, name: 'Sowing', action: 'Deploy Energy', focus: 'Consistent, high-quality service or labor.' },
  { stage: 3, name: 'Cultivation', action: 'Protect / Nurture', focus: 'Daily consistency, refining the skill, emotional regulation.' },
  { stage: 4, name: 'Reaping', action: 'Harvest / Recycle', focus: 'Collect the reward and re-plant the harvest.' },
];

export const ABUNDANCE_CYCLE = {
  steps: [
    'Reap: receive the rewards (capital, opportunity, recognition).',
    'Tithe to Capacity: reinvest a portion into your internal capacity (learning, health, better tools).',
    'Multiply: with more capacity, plant larger seeds next season.',
  ],
  engine: 'Increased Service -> Larger Harvest -> Reinvestment in Capacity -> Increased Ability to Serve',
  consumerTrap: 'If you harvest and spend it all, you reset your progress to zero. Treat every harvest as a Seed Bank.',
};

export const MIRROR_AUDIT = [
  { step: 'Stop', description: 'Cease external blame immediately. The world only reflects.' },
  {
    step: 'Trace',
    description:
      'Ask: "What belief, fear or action planted this seed?" Did I offer a sloppy reward? Did I box the resource?',
  },
  {
    step: 'Re-Calibrate',
    description:
      'Adjust the input at the source. For more love, radiate it; for more income, increase the service to more people.',
  },
];

export const SHADOW = {
  quote: 'Nothing binds you except your thoughts. Nothing limits you except your fears. And nothing controls you except your beliefs. (Marianne Williamson)',
  harvestRot:
    'If you increase your service but not your capacity to receive, opportunities come but are squandered or sabotaged. Weed the psychological soil first.',
};

export function getFramework() {
  return {
    law: LAW,
    harvestFormula: HARVEST_FORMULA,
    symbols: SYMBOLS,
    seedAndHarvest: SEED_AND_HARVEST,
    flowStates: FLOW_STATES,
    volumeMandate: VOLUME_MANDATE,
    stewardship: STEWARDSHIP,
    feedbackLoop: FEEDBACK_LOOP,
    process: PROCESS,
    abundanceCycle: ABUNDANCE_CYCLE,
    mirrorAudit: MIRROR_AUDIT,
    shadow: SHADOW,
    // Shared with the Law of Cultivation.
    termsOfService: TERMS,
    effortReturnCurve: CYCLE,
  };
}
