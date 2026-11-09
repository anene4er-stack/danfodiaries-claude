// Law of Proportionality: the volume of the harvest is determined by the scale of the seed.
//
// Source: "The Law of Proportionality" notes (The Law of.txt) and the Terms of
// Service in the Law of Cultivation notes (To maximize.txt) in Google Drive.

export const LAW = {
  name: 'The Law of Proportionality',
  maxim: 'The volume of the harvest is determined by the scale of the seed.',
  statement:
    'The Law of Proportionality is the transition from Linear Effort to Systemic Scale. ' +
    'You cannot sow one seed and expect a thousand-acre harvest. To increase the output, ' +
    'you must increase the input surface area.',
  principle:
    'If your harvest is consistently small, the bottleneck is not your work ethic: it is the ' +
    'insufficient size of your field.',
  finalInsight:
    'You maximize potential by building an ecosystem rather than an individual task. You are ' +
    'no longer chasing the harvest; you have constructed a net so large that the harvest is inevitable.',
};

// The core logic: Intensity vs. Expanse.
export const MODES = {
  spear: {
    id: 'spear',
    name: 'Intensity (The Spear)',
    description:
      'All your energy on one tiny point. You go deep. Necessary for mastery, but a poor ' +
      'strategy for accumulation: you can only dig one hole at a time.',
  },
  net: {
    id: 'net',
    name: 'Surface Area (The Net)',
    description:
      'Seeds distributed across a wider field of opportunity. You are no longer betting on one ' +
      '"luck" event; you are managing a portfolio of seeds.',
  },
};

// Input Surface Area: the channels through which your value interacts with the world.
export const DIMENSIONS = [
  {
    id: 'reach',
    name: 'Reach',
    definition: 'The quantity of people, markets, or problems exposed to your Seed (Value).',
    howToIncrease: 'Create repeatable content; build networks; leverage distribution platforms.',
  },
  {
    id: 'diversity',
    name: 'Diversity',
    definition: 'The number of different types of Seeds you are planting simultaneously.',
    howToIncrease:
      "Don't rely on one skill; build a stack of assets (e.g., writing + finance + public speaking).",
  },
  {
    id: 'availability',
    name: 'Availability',
    definition: 'The duration your Seeds are active in the field.',
    howToIncrease:
      'Move from synchronous work (you present) to asynchronous work (the system presents for you).',
  },
];

// Why surface area maximizes potential.
export const BENEFITS = [
  {
    id: 'redundancy',
    name: 'Redundancy',
    description:
      'One seed in a storm loses everything. 100 seeds across 10 fields makes a storm in one ' +
      'sector a statistical anomaly, not a catastrophe.',
  },
  {
    id: 'compounding-exposure',
    name: 'Compounding Exposure',
    description:
      'A wide surface area yields harvest data from many sources. You learn what grows best ' +
      'where and optimize your seeds for the next cycle.',
  },
  {
    id: 'big-wins',
    name: 'The "Big Wins" Requirement',
    description:
      'Big harvests rarely come from doing one thing perfectly. They come from being present in ' +
      'enough places that you are there when the opportunity arises.',
  },
];

// The trap and its counterweight.
export const TRAP = {
  name: 'The "Wide and Shallow" Risk',
  description:
    'Expanding surface area without maintaining your Nexus (your core quality and intent) ' +
    'leaves you with a field of weeds.',
  goldenRatio: {
    depth: 'Depth (Quality): the quality of the Seed is non-negotiable. Defective seeds at scale is failure at scale.',
    breadth: 'Breadth (Surface Area): the distribution of the Seed.',
  },
};

// The optimization workflow, in order.
export const WORKFLOW = [
  {
    step: 1,
    id: 'validate-seed',
    name: 'Validate the Seed (Depth)',
    description: 'Ensure your core service or value is high-quality. Do not scale garbage.',
  },
  {
    step: 2,
    id: 'systematize-sowing',
    name: 'Systematize the Sowing (Surface Area)',
    description: 'Once the seed is proven, build a system to plant it in multiple places simultaneously.',
  },
  {
    step: 3,
    id: 'audit-nexus',
    name: 'Audit the Nexus',
    description:
      'As you expand, ensure your internal integrity remains intact. The wider you reach, the ' +
      'more critical your original intent becomes.',
  },
];

// The three Nexus Questions for practical implementation.
export const NEXUS_QUESTIONS = [
  {
    id: 'bottleneck',
    name: 'The Bottleneck Test',
    question:
      'Am I harvesting less because I am a bad farmer, or because I am only farming one tiny patch of land?',
    failMeans: 'If the latter, your problem is not skill; it is scale.',
  },
  {
    id: 'leverage',
    name: 'The Leverage Test',
    question: 'Is my seed active only when I am awake?',
    failMeans: 'If yes, your surface area is limited by your biology.',
  },
  {
    id: 'diversification',
    name: 'The Diversification Test',
    question: 'What happens if my primary source of harvest disappears tomorrow?',
    failMeans: "If the answer is 'total collapse,' your surface area is zero.",
  },
];

export function getFramework() {
  return {
    law: LAW,
    modes: MODES,
    dimensions: DIMENSIONS,
    benefits: BENEFITS,
    trap: TRAP,
    workflow: WORKFLOW,
    nexusQuestions: NEXUS_QUESTIONS,
  };
}
