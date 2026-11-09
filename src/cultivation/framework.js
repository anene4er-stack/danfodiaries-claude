// Law of Cultivation: whatever you don't cultivate, you will lose.
//
// Sources (Google Drive): the Law of Cultivation reference guide (Based on the.txt),
// the engineering framework (To maximize.txt), and the Diligent vs. Slothful and
// Cultivation Cycle notes (This set of.txt, This summary.txt).

export const LAW = {
  name: 'The Law of Cultivation',
  maxim: "Whatever you don't cultivate, you will lose.",
  axiom:
    'Work is the only currency that produces a yield. Even your most significant gifts are not ' +
    'passive assets; they are active investments that require cultivation to maintain value.',
  boxAnalogy:
    'If you are given a million dollars but put it in a box, you are choosing to lose it. The value ' +
    'is not in the resource itself, but in the work applied to it to yield more.',
  atrophy: 'Maintenance is not a static state; it is an active, ongoing effort. If the effort stops, the value erodes.',
  goldenRule:
    'You do not chase the Harvest. You refine the Seed. You cultivate the Soil. You fortify the Nexus. ' +
    'When these three are optimized, the Harvest is a mathematical inevitability.',
};

// The pipeline from the sketches: Task -> Effort -> Compensation -> Reward.
export const FLOW = [
  { id: 'task', name: 'Task', description: 'The raw opportunity or field that requires attention.' },
  {
    id: 'effort',
    name: 'Effort',
    description: 'The multiplier. A negative sign (-) reduces the output; a positive sign (+) amplifies it.',
  },
  { id: 'compensation', name: 'Compensation', description: 'The systematic result of the effort applied to the task.' },
  { id: 'reward', name: 'Reward', description: 'The tangible outcome (Good vs. Bad) based on the input quality.' },
];

// How a field is being treated, and where that path leads.
export const PATHS = {
  cultivate: {
    id: 'cultivate',
    name: 'The Diligent Path',
    action: 'Cultivate',
    reward: 'Good Reward',
    logic: 'Putting your best effort into a task triggers the Law of Compensation.',
  },
  neglect: {
    id: 'neglect',
    name: 'The Slothful Path',
    action: 'Neglect',
    reward: 'Bad Reward',
    logic: 'Neglect is a failure of stewardship: the resource is "in a box" and the compensation cycle never completes.',
  },
  shortcut: {
    id: 'shortcut',
    name: 'The Extractionist Path',
    action: 'Task without work (robbery, bribery, luck)',
    reward: 'Reclaimed Reward',
    logic: 'A reward gained without cultivation cannot be maintained, and the system eventually reclaims it.',
  },
};

// Comparative model: Extraction vs. Cultivation.
export const MODELS = {
  extractionist: {
    name: 'Extractionist (The Gambler)',
    logic: 'Seeks immediate gain; bypasses work.',
    viewOfTime: 'The enemy (wants instant results).',
    risk: 'High (unstable foundation).',
    outcome: 'Depletion (the "Bad Reward").',
    metric: 'Quick profit or status.',
  },
  cultivator: {
    name: 'Cultivator (The Architect)',
    logic: 'Seeks systemic growth; invests work.',
    viewOfTime: 'The ally (uses compounding).',
    risk: 'Low (calculated, durable growth).',
    outcome: 'Accumulation (the "Good Reward").',
    metric: 'Increased capacity and service quality.',
  },
};

// The Law of Compensation's Terms of Service.
export const TERMS = [
  {
    id: 'proportionality',
    name: 'The Law of Proportionality',
    clause: 'The volume of the harvest is determined by the scale of the seed. To increase output, increase input surface area.',
  },
  {
    id: 'non-delegation',
    name: 'The Non-Delegation Clause',
    clause:
      'You can hire help, but you cannot outsource your alignment. If the Nexus is corrupted, the harvest is poisoned, regardless of the effort.',
  },
  {
    id: 'lag-time',
    name: 'The Lag-Time Clause',
    clause:
      'The delay between Sowing and Reaping is a feature, not a flaw. You must maintain the field during the period of no visible return.',
  },
  {
    id: 'ownership',
    name: 'The Ownership Clause',
    clause: 'You only own what you cultivate. A reward gained without cultivation will eventually be reclaimed.',
  },
];

// The Cultivation Cycle: the effort-to-reward ratio shifts over time.
export const CYCLE = [
  { id: 'incubation', name: 'Incubation', input: 'Massive effort', output: 'Minimal return', state: 'Foundation building' },
  { id: 'transition', name: 'Transition', input: 'Steady effort', output: 'Growing return', state: 'Momentum gathering' },
  { id: 'harvest', name: 'Harvest', input: 'Minimal effort', output: 'Massive return', state: 'Compounding efficiency' },
];

// Accessing the outcome.
export const RECEPTION_PROTOCOL = [
  {
    id: 'container',
    name: 'The Container Theory',
    description:
      'Your capacity to receive is limited by your habits, organization and knowledge. If the container is small, the harvest spills over and is lost.',
  },
  {
    id: 'audit',
    name: 'Audit the Reception',
    description:
      'Ask: "If this input multiplied by 10x today, would my current systems break?" If yes, strengthen the container before demanding the harvest.',
  },
  {
    id: 'retrieval',
    name: 'Active Retrieval',
    description: 'Harvesting is not passive. Be present at the time of maturity, or the opportunity will rot.',
  },
];

// Force multipliers.
export const LEVERAGE = [
  { id: 'technology', name: 'Technology', description: 'Use digital systems to reach more fields with the same effort.' },
  { id: 'people', name: 'People', description: 'Build teams where the cultivation is shared.' },
  {
    id: 'content',
    name: 'Content/IP',
    description: 'Create a single seed (a book, software, a theory) that keeps growing in your absence.',
  },
];

export const REINVESTMENT = {
  consume: { level: 1, id: 'consume', name: 'Survival', description: 'You sow, you reap, you consume.' },
  seeds: {
    level: 2,
    id: 'seeds',
    name: 'Growth',
    description: 'You sow, you reap, you reinvest 50% of the harvest into higher-quality seeds.',
  },
  soil: { level: 3, id: 'soil', name: 'Mastery', description: 'You sow, you reap, you reinvest the harvest into better soil.' },
};

export const NEXUS_AUDIT = [
  { step: 'Data Input', prompt: 'Review your last harvest. Was it of low quality?' },
  { step: 'Nexus Adjustment', prompt: 'What was the intent of my seed? Was it truly to provide value, or was it to take?' },
  { step: 'Refined Sowing', prompt: 'Adjust the seed based on the feedback from the harvest, and replant immediately.' },
];

// The Law of Reciprocity: compensation in leadership and human exchange.
export const RECIPROCITY = {
  principle: 'You get what you pay for. A "sloppy reward" cannot logically expect hard work in return.',
  goodMeasure: 'To be compensated well, be a generous sower. The same measure you use is the baseline for what is returned.',
};

export function getFramework() {
  return {
    law: LAW,
    flow: FLOW,
    paths: PATHS,
    models: MODELS,
    terms: TERMS,
    cycle: CYCLE,
    receptionProtocol: RECEPTION_PROTOCOL,
    forceMultipliers: { leverage: LEVERAGE, reinvestment: REINVESTMENT, nexusAudit: NEXUS_AUDIT },
    reciprocity: RECIPROCITY,
  };
}
