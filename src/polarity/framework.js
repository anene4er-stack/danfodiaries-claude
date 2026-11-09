// Law of Polarity: opposites are the same thing at different degrees.
//
// Source: the Law of Polarity notes in Google Drive (October 2026): Polarity and Mental
// Vibrations, the Mechanics of Focus, Selective Attention and the Attentional Budget,
// Perception as Projection (the Mirror Effect), and the agency frameworks (language,
// the stimulus-response gap, the Weather Report, the Observer Self, the Calibration Loop).

export const LAW = {
  name: 'The Law of Polarity',
  maxim: 'Everything is on a continuum.',
  statement:
    'Apparent opposites are the same phenomenon at different degrees: hot and cold are points on one ' +
    'temperature scale. You do not destroy a negative state; you move along its scale to the opposite pole.',
  replaceNotSuppress:
    'Suppressing a thought reinforces it, because you must hold it in mind to fight it. Replacing it, by shifting focus to the opposite pole, works.',
  mentalVibration:
    'Where you place your focus (your vibration) determines your reality. Attention is energy: whatever you focus on, you feed.',
  catchItEarly:
    'Most of us wait until we are deeply entrenched before trying to shift. Catch the shift early, before the vibration becomes too heavy to move.',
};

// The scales named in the notes: [low pole, high pole] and how to move between them.
export const SCALES = [
  {
    id: 'anxiety-excitement',
    low: 'Anxiety',
    high: 'Excitement',
    sharedNature: 'Racing heart, shallow breathing, heightened focus, butterflies: physiologically identical.',
    shift: 'Keep the sensation and change its meaning: you are not in danger, you are energized. Use the energy instead of being paralyzed by it.',
  },
  {
    id: 'fear-courage',
    low: 'Fear',
    high: 'Courage',
    sharedNature: 'High arousal: a fast heart, sweating palms, narrowed focus.',
    shift: 'Acknowledge the racing heart and change the story from "I am in danger" to "I am preparing to act."',
  },
  {
    id: 'criticism-insight',
    low: 'Criticism',
    high: 'Insight',
    sharedNature: 'Both are evaluation. Criticism looks at what is broken; insight looks at what can improve.',
    shift: 'Ask: "What is the constructive lesson here?" Move from judgment, which stagnates, to growth.',
  },
  {
    id: 'scarcity-abundance',
    low: 'Scarcity',
    high: 'Abundance',
    sharedNature: 'Two ways of perceiving resources: "not enough" versus "possibility."',
    shift: 'Without ignoring reality, focus on what you do have. Move from deficit, which breeds anxiety, to potential, which breeds strategy.',
  },
  {
    id: 'separation-connection',
    low: 'Separation',
    high: 'Connection',
    sharedNature: 'Both are ways of relating in conflict.',
    shift: 'Ask: "What is the common goal here?" Change "me vs. you" into "us vs. the problem," and build a bridge instead of a wall.',
  },
  {
    id: 'shame-data',
    low: 'Shame',
    high: 'Data',
    sharedNature: 'Both are responses to a failure or mistake.',
    shift: 'Replace "I am a failure" with "This is a result." Look at it as a scientist would: what did you learn?',
  },
  {
    id: 'apathy-craftsmanship',
    low: 'Apathy',
    high: 'Craftsmanship',
    sharedNature: 'Both are ways of meeting a repetitive task.',
    shift: 'Ask: "How can I do this with excellence?" Choose to perform the task well, and move from victimhood to mastery.',
  },
  {
    id: 'impatience-preparation',
    low: 'Impatience',
    high: 'Preparation',
    sharedNature: 'Both are ways of spending a period of waiting.',
    shift: 'Treat the wait as a quiet space to sharpen your tools. Move from wasting time to investing it.',
  },
  {
    id: 'resistance-utilization',
    low: 'Resistance',
    high: 'Utilization',
    sharedNature: 'Both are responses to something you cannot change, like a traffic jam.',
    shift: 'Accept "what is," then change the station: use the time for something you control.',
  },
];

// Pattern interrupts: small physical actions that reset a heavy vibration.
export const PATTERN_INTERRUPTS = [
  'Stand up and stretch.',
  'Take three deep, slow breaths.',
  'Switch your environment: move to another room.',
];

// Selective Attention: the Attentional Budget and its leaks.
export const ATTENTION = {
  budget:
    'Attention is a finite budget. Every worry, judgment or distraction is a transaction that drains it. Feeling scattered usually means leaking, not overworking.',
  spotlight: 'Focus is a spotlight in a dark room: whatever it lights becomes your reality.',
  openLoops:
    'An open loop is anything started but not finished or scheduled. Each one runs in the background and drains the battery. Write them all down; once on paper, your brain can stop monitoring them.',
  leaks: [
    { id: 'notifications', name: 'Notifications and messages', fix: 'The Wait-to-Respond Protocol: batch your replies instead of answering the moment messages arrive.' },
    { id: 'task-switching', name: 'Task switching', fix: 'Deep Work Blocks and the One-In, One-Out Rule: close the previous loop (and its tab) before opening the next.' },
    { id: 'rumination', name: 'Rumination', fix: 'The Stop-Loss: give the problem 10 minutes to reach a plan; if it has not, write it down and walk away for the day.' },
    { id: 'worry', name: 'Worry about hypothetical futures', fix: 'The Pivot of Acceptance: stop arguing with reality, and put the energy on the next step you control.' },
    { id: 'social-media', name: 'Social media comparison', fix: 'Disconnect from the feed and do something active: call a friend, write, or walk. Create rather than consume.' },
    { id: 'news', name: 'News and chaotic inputs', fix: 'Input Dieting: you cannot process calm and chaos at once, and your brain will tune to the chaos.' },
    { id: 'clutter', name: 'Clutter', fix: 'Environment Cleansing: spend 60 seconds clearing your desk and tabs before focused work.' },
  ],
  audit: [
    'Identify: what are the recurring leaks in your attention?',
    'Redirect: when your spotlight wanders, label it "a noise signal, not a priority signal."',
    'Return: gently bring your focus back to your chosen priority.',
  ],
};

// Perception as Projection: the Mirror Effect.
export const MIRROR = {
  principle: 'We perceive the world not as it is, but as we are. What you are is how you perceive someone.',
  kinds: {
    irritation: {
      name: 'The Negative Mirror (Shadow Projection)',
      mechanism: 'Intense dislike of a trait in someone else often points to a part of yourself you have suppressed or denied.',
      diagnostic: 'Where in my own life do I exhibit, or reject, this same trait?',
      release: 'Say to yourself: "I see this in them because I have a version of this in me." The charge evaporates once you own it.',
    },
    admiration: {
      name: 'The Positive Mirror (Golden Shadow)',
      mechanism: 'Deep admiration shows a capacity you have labeled "not for me." You would not recognize it without a receptor for it.',
      diagnostic: 'What exactly do I admire, and where have I denied myself permission to express it?',
      release: 'Treat the admiration as a roadmap for what you are ready to cultivate next.',
    },
    envy: {
      name: 'The Envy Audit (Golden Shadow)',
      mechanism: 'Envy is often a projection of your own dormant potential: a quality you do not feel allowed to express.',
      diagnostic: 'Which specific quality do I envy, and where have I denied myself permission to express it?',
      release: 'The person you envy is not your rival; they are a mirror of your unclaimed potential.',
    },
  },
  lens: {
    name: 'The Lens Effect',
    mechanism: 'When the same frustration repeats across many different people, the common denominator is your own lens.',
    practice: 'The Counter-Evidence Experiment: "If I were committed to proving the opposite, what evidence could I find?"',
  },
  contributionQuestion: 'Even if they are 90% at fault, what is the 10% I am contributing to this dynamic?',
  valueMirror: 'Strong reactions often mark a value being crossed. Ask "Why does this bother me?" and stand firm in that value.',
  inquiry: ['What am I feeling?', 'Is this a pattern?', 'What does this say about me?'],
};

// The Agency Audit: language as a reality tuner.
export const LANGUAGE = {
  principle: 'Your brain listens to what you say to yourself. Disempowering language externalizes your power.',
  swaps: [
    { from: 'I have to', to: 'I choose to' },
    { from: 'I am [emotion]', to: 'I am experiencing [emotion]' },
    { from: 'This is a problem', to: 'This is a challenge (or data)' },
  ],
};

export const AGENCY = {
  stimulusResponseGap:
    'Between stimulus and response there is a space, and in it lies your freedom (Viktor Frankl). Speed-bump it: count to three, breathe, drop your shoulders, and ask whether your habitual reaction serves you.',
  weatherReport: 'Emotions are weather, not you. "A heavy weather pattern of sadness is moving through right now."',
  observerSelf:
    'The master skill: the part of you that can watch your brain think. If you can watch a stressful thought, you are not that thought.',
  calibrationLoop: [
    'Observe: use the Observer Self to notice your internal state.',
    'Calibrate: use language and lens to reframe the inputs.',
    'Execute: use competence and action to move the needle.',
    'Integrate: re-author the narrative and feed the result back into your identity.',
  ],
};

export const DAILY_CHECKLIST = [
  'Identify the Pole: where is this on the scale, and what is its opposite?',
  'Check the Frequency: is my focus feeding this state, or shifting me toward a new one?',
  'Reflect on the Projection: why is this trait bothering me, and what does it reveal about me?',
];

export function getFramework() {
  return {
    law: LAW,
    scales: SCALES,
    patternInterrupts: PATTERN_INTERRUPTS,
    attention: ATTENTION,
    mirror: MIRROR,
    language: LANGUAGE,
    agency: AGENCY,
    dailyChecklist: DAILY_CHECKLIST,
  };
}
