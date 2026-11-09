// Law of Correspondence: "As above, so below."
//
// Source: the "System of Correspondence" design doc and the companion notes on
// "The Below" (the Manifestation Layer) in Google Drive. Each principle in the
// higher plane (The Above) has a corresponding process in the lower plane
// (The Below). The two are linked by TRAITS (what the principle is) and
// LIKENESS (how faithfully the process mirrors it).

export const LAW = {
  name: 'The Law of Correspondence',
  maxim: 'As above, so below.',
  statement:
    'The principles and laws that govern the higher (etheric) plane have corresponding ' +
    'principles in the lower (physical) plane. What is designed Above must be mirrored ' +
    'Below, and what happens Below reveals the true state of what is Above.',
  planes: {
    above: {
      name: 'The Above',
      label: 'Higher Plane — Principles',
      role: 'Strategy, intent and design. Sets the hard boundaries.',
    },
    below: {
      name: 'The Below',
      label: 'Lower Plane — Processes (Manifestation Layer)',
      role:
        'Where abstract strategy meets the friction of reality. The foundation and the ' +
        "system's primary validation loop: the only place where truth exists.",
    },
  },
  linkTypes: {
    traits: 'The defining qualities a principle carries down into its process.',
    likeness: 'How faithfully the process mirrors the principle (fidelity).',
  },
};

// The core four-level system from the sketch: Above (principle) -> Below (process).
export const SYSTEMS = {
  organization: {
    id: 'organization',
    name: 'Organizational System of Correspondence',
    levels: [
      {
        level: 1,
        id: 'culture',
        above: 'Culture',
        below: 'Leadership',
        aboveSphere: 'Culture & Leadership Principles',
        belowSphere: 'Corporate Culture & Leadership Actions',
        insight: 'Higher principles form the basis of physical leadership.',
      },
      {
        level: 2,
        id: 'standards',
        above: 'Standards',
        below: 'Implement',
        aboveSphere: 'Standards & Implementation',
        belowSphere: 'Operating Procedures & Implementation Tasks',
        insight: 'Physical implementation must reflect higher standard principles.',
      },
      {
        level: 3,
        id: 'indoc',
        above: 'Indoc',
        below: 'Training',
        aboveSphere: 'Indoc & Training',
        belowSphere: 'Indoctrination Methods & Training Programs',
        insight: 'Training programs are the below manifestation of indoctrination principles.',
      },
      {
        level: 4,
        id: 'upkeep',
        above: 'Upkeep',
        below: 'Re-iterate',
        aboveSphere: 'Upkeep & Re-iteration',
        belowSphere: 'Iterative Feedback & Process Upkeep',
        insight:
          'Continuous re-iteration is the upkeep of the system, reflecting principle upkeep.',
      },
    ],
  },
  nature: {
    id: 'nature',
    name: 'Nature to Self',
    levels: [
      {
        level: 1,
        id: 'ecology',
        above: 'Ecology & Interdependence',
        below: 'Interdepartmental Synergy',
        insight: 'No part of a living system thrives in isolation.',
      },
      {
        level: 2,
        id: 'seasonality',
        above: 'Seasonality & Cycles',
        below: 'Iterative Project Cycles',
        insight: 'Work moves in seasons: plant, grow, harvest, rest.',
      },
      {
        level: 3,
        id: 'growth',
        above: 'Growth & Adaptation',
        below: 'Employee Development & Adaptability',
        insight: 'What does not adapt to its environment does not grow.',
      },
      {
        level: 4,
        id: 'balance',
        above: 'Balance & Harmony',
        below: 'Balanced Scorecard & Organizational Health',
        insight: 'Health is balance across every part, not excellence in one.',
      },
    ],
  },
};

// Properties a robust "Below" must have.
export const BELOW_PROPERTIES = [
  {
    id: 'autonomy',
    name: 'Boundary-Protected Autonomy',
    description:
      'Set hard boundaries Above and let the Below operate freely within them. ' +
      'Micromanagement destroys the feedback loops.',
  },
  {
    id: 'signal',
    name: 'High Sensitivity to Signal',
    description:
      'The Below is the primary generator of data. Failures are reported as system ' +
      'insights, not punishable offenses.',
  },
  {
    id: 'standardization',
    name: 'Maintenance of Standardization',
    description:
      'Variability in execution equals variability in results. Ten ways of doing one task ' +
      'means the system has lost its likeness to the design.',
  },
];

// Architectural health checklist for the Below.
export const HEALTH_CHECKLIST = [
  {
    id: 'coherence',
    name: 'Coherence',
    question: 'Does the worker know why their task matters to the Above?',
    healthy: 'Everyone can explain how their task serves the strategy.',
    symptom: 'The worker sees tasks as arbitrary "busy work."',
  },
  {
    id: 'resilience',
    name: 'Resilience',
    question: 'Can the team adapt to a problem without waiting for the Above?',
    healthy: 'The team solves local problems inside the guardrails.',
    symptom: 'Everything stops until a supervisor gives an order.',
  },
  {
    id: 'transparency',
    name: 'Transparency',
    question: 'Is the team comfortable reporting a process failure?',
    healthy: 'Failures surface quickly and are treated as system insights.',
    symptom: 'Mistakes are hidden or blamed on other teams.',
  },
];

export const PRACTICES = {
  reset: {
    name: 'The Reset',
    description:
      'A routine, periodic audit of how things are actually done versus how the Above ' +
      'designed them. Entropy makes the Below drift; the Reset corrects it.',
  },
  gembaWalk: {
    name: 'The Gemba Walk',
    description:
      'The Above observes the Below in its natural state, rather than relying on reports ' +
      'written by the Middle.',
  },
  directReporting: {
    name: 'Direct Reporting',
    description:
      'Channels for the Below to signal issues directly to the Above, preventing the ' +
      '"Telephone Effect" where bad news is sanitized on the way up.',
  },
};

export const EXECUTION_SUMMARY = [
  'Stop over-complicating: if the Below cannot explain the strategy in one sentence, the translation from the Middle has failed.',
  'Focus on trait-based recruitment: a struggling Below is often a recruitment issue, not a training issue.',
  'Respect the physics: design for human capacity, fatigue and resource limits.',
];

export function getFramework() {
  return {
    law: LAW,
    systems: SYSTEMS,
    belowProperties: BELOW_PROPERTIES,
    healthChecklist: HEALTH_CHECKLIST,
    practices: PRACTICES,
    executionSummary: EXECUTION_SUMMARY,
  };
}
