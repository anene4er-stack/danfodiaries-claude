// Law of Reciprocity: the same measure you use is the measure returned to you.
//
// There is no single Reciprocity note in Google Drive. This is built from the sections
// on it inside other notes: "The Law of Reciprocity (Leadership & Human Exchange)" in the
// Law of Cultivation guide, "The Unified Theory of Universal Reciprocity" summary, the
// Mirror Principle in the image reflections, and Reciprocity in the Law of Rhythm Peak notes.

import { FLOW_STATES } from '../compensation/framework.js';

export const LAW = {
  name: 'The Law of Reciprocity',
  maxim: 'The same measure you use is the measure returned to you.',
  statement:
    'The Law of Compensation is not just about you; it is about what you project to others. In ' +
    'relationships and leadership, the reward you offer sets the effort you receive.',
  youGetWhatYouPayFor:
    'If you offer a "sloppy reward" (poor compensation for work), you cannot logically expect hard work in return.',
  goodMeasure:
    'To be compensated well, you must be a generous sower. The same measure you use is the baseline for what is returned to you.',
  radiate: 'If you want more love, you do not demand it; you radiate it. Radiate and give love, and love comes back to you.',
};

// The Quality Feedback Loop.
export const FEEDBACK_LOOP = {
  low: { input: 'Low Reward Input', output: 'A low-effort output from others.' },
  high: { input: 'High Reward Input', output: 'Sets the expectation and capacity for the best output from others.' },
};

// "Evaluate Your Compensation Environment": what you offer the people around you.
export const OFFER_DIMENSIONS = [
  {
    id: 'environment',
    name: 'Environment',
    question: 'Are you providing the conditions they need to do their best work?',
    howToRaise: 'Remove the friction they work against: unclear goals, broken tools, chaos you could absorb.',
  },
  {
    id: 'appreciation',
    name: 'Appreciation',
    question: 'Do they know, specifically, that their work is seen and valued?',
    howToRaise: 'Name one specific thing they did well, and what it made possible, this week.',
  },
  {
    id: 'resources',
    name: 'Resources',
    question: 'Are you giving them the time, money, training or access their work requires?',
    howToRaise: 'Ask what one resource would most change their output, and provide it.',
  },
];

// Universal Reciprocity: reality is a mirror.
export const MIRROR = {
  principle: 'Reality is a mirror. The external world cannot initiate; it only reflects.',
  inOthers: 'What you see in others exists in you. Everything that irritates us about others can lead us to an understanding of ourselves.',
  auditTheMeasure: 'Is the measure you are using to judge or reward others the same measure you wish to be judged by?',
  shiftTheAim: 'Stop aiming at getting compensation. Aim entirely at maximizing service.',
};

// Goodwill in the Peak (Law of Rhythm).
export const GOODWILL = {
  pressureValve:
    'Giving (mentorship, resources, time) acts as a pressure valve at the Peak. It prevents hoarding the success and keeps you grounded.',
  goodCrowd:
    'Build goodwill. The people you help during your Peak are the ones who will provide "good crowd" support when your rhythm dips.',
};

export const FLOW = FLOW_STATES;

export function getFramework() {
  return {
    law: LAW,
    qualityFeedbackLoop: FEEDBACK_LOOP,
    offerDimensions: OFFER_DIMENSIONS,
    mirror: MIRROR,
    flow: FLOW,
    goodwill: GOODWILL,
  };
}
