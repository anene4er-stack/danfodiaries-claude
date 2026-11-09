// Law of Rhythm: everything moves in cycles. This too shall pass.
//
// Source: the Law of Rhythm notes in Google Drive: the Rhythm Strategy and its full phase
// breakdown, the four season notes (Peak, Descending, Valley, Ascending), Seasonal Alignment,
// the alignment success metrics, Frequency Consistency and Rhythm Mastery.

export const LAW = {
  name: 'The Law of Rhythm',
  maxim: 'This too shall pass.',
  statement:
    'Everything in life vibrates and moves in cycles, stages and patterns. Any structure that rises must ' +
    'fall. The Master does not fight the rhythm; they align with it, and keep their internal frequency steady.',
  mantras: ['This too shall pass.', 'The only constant is change.'],
  mastery: 'Masters know how to rise above negative parts of a cycle.',
  goldenRule:
    'The ultimate accomplishment of Seasonal Alignment is emotional stability: you stop judging yourself by the standards of the wrong season.',
};

// The four seasons, in cycle order. `mode` is the season's aligned activity; `intensity`
// is how much output the season supports (used to spot overreaching or under-using it).
export const SEASONS = [
  {
    id: 'peak',
    name: 'Peak',
    stage: 'Maximum Potential Energy',
    characteristics: 'High momentum, visibility and results.',
    strategicResponse: 'Execute, expand the infrastructure, give.',
    alignedFocus: 'Stewardship',
    alignedBehavior: 'Harvest results, delegate maintenance, and prepare the exit strategy.',
    mode: 'executing',
    intensity: 3,
    markers: [
      'Things are moving fast and opportunities surface without immense effort.',
      'You are receiving positive feedback from your environment.',
    ],
    objectives: [
      'Execute: do the heavy lifting now while the tide is high, and avoid "comfort creep."',
      'Expand the infrastructure: build reserves (financial, emotional, relational) and document why you are peaking.',
      'Give: mentorship, resources and time act as a pressure valve and build goodwill for the Valley.',
    ],
    trap: {
      name: 'Growth Addiction',
      misaligned: 'Trying to force 10x growth at the very end of a cycle.',
      frustration: 'Plateau anxiety: miserable even when successful, addicted to the increase in speed.',
      burnout: 'You push past the system\'s capacity and get a hard crash instead of a smooth descent.',
    },
    frequency: {
      drift: 'The Egotism Trap: you believe the high output is your worth and become arrogant, dismissive and frantic.',
      anchor: 'Stewardship: success is a responsibility to manage well. Stay humble and focused on sustainability.',
    },
    masterThought: 'The conditions are optimal right now. I will produce my best work, remain grateful, and prepare for the next season.',
    exitQuestion: 'If this momentum stopped tomorrow, what is the one thing I need to have finished today?',
    successMetrics: 'High-quality output, optimized system performance, reputation solidified, max ROI on energy.',
    checklist: [
      { risk: 'Over-extension', counter: 'Only expand based on durable systems, not temporary hype.' },
      { risk: 'Arrogance / Complacency', counter: 'Practice Radical Gratitude. Acknowledge the cycle daily.' },
      { risk: 'Dependency', counter: "Ensure you are not reliant on the Peak's dopamine to feel normal." },
      { risk: 'Fixed Mindset', counter: 'Keep learning. The Peak is a high-speed classroom.' },
    ],
    bottomLine: 'If you build nothing during the Peak, you will have nothing to fall back on during the Valley.',
  },
  {
    id: 'descending',
    name: 'Descending',
    stage: 'Harvest and Consolidation',
    characteristics: 'Energy fading, completion.',
    strategicResponse: 'Consolidate, complete, harvest.',
    alignedFocus: 'Consolidation',
    alignedBehavior: 'Close open loops, organize assets, and intentionally decelerate.',
    mode: 'consolidating',
    intensity: 2,
    markers: [
      'Results that came easily now require more friction.',
      'External validation quiets and the excitement fades.',
    ],
    objectives: [
      'Consolidation: audit and organize what you gained at the Peak; document what worked.',
      'Completion: tie off loose ends and shed what no longer serves you.',
      'Preparation: brake before the turn. Stop taking on major new commitments.',
    ],
    trap: {
      name: 'The Force Trap',
      misaligned: 'Frantically launching new projects because you fear the natural loss of momentum.',
      frustration: 'Friction everywhere: twice the work for half the result.',
      burnout: 'You exhaust your remaining potential energy and reach the Valley with nothing to draw on.',
    },
    frequency: {
      drift: 'The Panic Response: you read the slowdown as failure and compromise your values to force results.',
      anchor: 'Graceful Closure: stay methodical and honest; finish what you started with integrity.',
    },
    masterThought: 'The wave is moving down. I will secure what I built, close my loops, and adjust my posture.',
    doNotJudge: 'Do not judge yourself for being "unproductive" while Descending.',
    successMetrics: 'Reduced debt/liability, clean "done" lists, mental clarity, preserved energy reserves.',
    checklist: [
      { risk: 'Forcing Momentum', counter: 'Stop initiating new projects; pivot to finishing current ones.' },
      { risk: 'Panic / Fear', counter: 'Reframe the slowdown as a natural Harvest period, not a loss of status.' },
      { risk: 'Resource Scattering', counter: 'Centralize and organize what you gained.' },
      { risk: 'Ignoring Fatigue', counter: 'Recognize early signs of burnout and start building in rest.' },
    ],
    bottomLine: 'If you fail to consolidate during the descent, you will enter the Valley empty-handed and exhausted.',
  },
  {
    id: 'valley',
    name: 'Valley',
    stage: 'Foundation and Regeneration',
    characteristics: 'Low energy, rest, quiet.',
    strategicResponse: 'Rest, reflect, prepare.',
    alignedFocus: 'Restoration',
    alignedBehavior: 'Deep study, introspection and physical recovery. Be comfortable with the quiet.',
    mode: 'restoring',
    intensity: 1,
    markers: [
      'Reduced demand: the phone rings less and opportunities feel fewer.',
      'A desire for solitude and a pull away from high-stimulation environments.',
      'Clarity over intensity: you see your values clearly but have less energy to act.',
    ],
    objectives: [
      'The Reset: calibrate your frequency to your core values, and rest deeply to repay the Peak\'s debt.',
      'Rooting: audit your internal assets and strengthen the root system through reading, study and practice.',
      'The Observer: watch the anxiety about "not doing enough" without acting on it.',
    ],
    trap: {
      name: 'The Guilt Loop',
      misaligned: 'Beating yourself up for lack of productivity; trying to hustle through a recovery phase.',
      frustration: 'You feel stuck, failing the imaginary expectations of your last Peak.',
      burnout: 'Existential exhaustion: refusing to recover blocks the resources the next cycle needs.',
    },
    frequency: {
      drift: 'The Self-Loathing Spiral: you feel useless because you are not producing, leading to erratic decisions.',
      anchor: 'Patient Cultivation: value the quiet and sharpen your skills; your worth is not your public output.',
    },
    masterThought: 'Nothing is happening on the outside because everything is happening on the inside.',
    doNotJudge: 'Do not judge yourself for being "lazy" in the Valley.',
    successMetrics: 'Stronger intuition, long-term vision, physical vitality, healed burnout, deep knowledge accumulation.',
    checklist: [
      { risk: 'Boredom / Anxiety', counter: 'Reframe as "The Quiet Growth." The silence is a condition for depth.' },
      { risk: 'Impulse to Hustle', counter: 'Practice Radical Patience. Forcing the cycle means failing to prepare for the Ascent.' },
      { risk: 'Lack of Direction', counter: 'Shift to Deep Study: reading, reflection and quiet strategy.' },
      { risk: 'Feeling Stuck', counter: 'The Valley is a phase, not a permanent state. Prepare your seed for the coming season.' },
    ],
    bottomLine: 'The Valley is where you gain the potential energy for your next Peak.',
  },
  {
    id: 'ascending',
    name: 'Ascending',
    stage: 'Initialization and Planting',
    characteristics: 'Renewed energy, new growth.',
    strategicResponse: 'Plant, initiate, learn.',
    alignedFocus: 'Experimentation',
    alignedBehavior: 'Test new ideas on a small scale, gather data, and build slow, sustainable speed.',
    mode: 'experimenting',
    intensity: 2,
    markers: [
      'The "itch" to do: lists, ideas and outreach without hustle pressure.',
      'Synchronicities: opportunities and timely resources start appearing.',
      'Tasks that felt draining in the Valley now feel manageable.',
    ],
    objectives: [
      'Strategic Planting: pick a few high-leverage seeds and treat them as experiments, not crops.',
      'The Velocity Test: ramp up gradually and build fast feedback loops.',
      'Strategic Proximity: re-enter the current alongside your "good crowds."',
    ],
    trap: {
      name: 'The Haste Trap',
      misaligned: 'Leaping into full-scale execution immediately: a premature Peak.',
      frustration: 'Scattered: too many ideas, no focus, everything at once.',
      burnout: 'You burn through your initial motivation within weeks, before the work needs sustained effort.',
    },
    frequency: {
      drift: 'The Haste Addiction: desperate for a win, you cut corners and take high-risk, low-reward gambles.',
      anchor: 'Disciplined Growth: execute with precision and value the process over the dopamine of the result.',
    },
    masterThought: 'Momentum is built, not granted. I will test my footing and gather speed slowly.',
    doNotJudge: 'Do not judge yourself for being "cautious" while Ascending.',
    successMetrics: 'Validated data/market fit, sustainable habits, reduced failure costs, clear trajectory for the next Peak.',
    checklist: [
      { risk: 'Over-Excitement', counter: 'Practice Strategic Restraint. Can does not mean should, right now.' },
      { risk: 'Scattering Focus', counter: 'Prioritize: select only the seeds that align with your core values.' },
      { risk: 'Fear of Momentum', counter: 'Embrace the flow. Trust the preparation you did in the Valley.' },
      { risk: 'Premature Pushing', counter: 'Calibrate velocity: increase output by 10-15% increments.' },
    ],
    bottomLine: 'If you plant the right seeds and check your speed, your next Peak will be far more powerful.',
  },
];

// What you are actually doing right now. Four are the seasons' aligned modes;
// "pushing" (forcing results, launching all-in) is every season's trap.
export const ACTIVITIES = {
  executing: { id: 'executing', name: 'Executing and harvesting', intensity: 3 },
  consolidating: { id: 'consolidating', name: 'Closing loops and consolidating', intensity: 2 },
  restoring: { id: 'restoring', name: 'Resting, studying and reflecting', intensity: 1 },
  experimenting: { id: 'experimenting', name: 'Running small experiments', intensity: 2 },
  pushing: { id: 'pushing', name: 'Pushing: forcing results or launching all-in', intensity: 4 },
};

export const STRATEGIES = {
  attachment: {
    name: 'Attachment Strategy (The Domino Principle)',
    premise: 'What you attach to determines what you rise or fall with.',
    fallingStructureTest: 'If this person or situation were to collapse tomorrow, would I collapse with it?',
    waveRule: 'A falling wave propagates only through connected pieces. Break the connection, break the propagation.',
    phases: [
      'Structural Audit: list your attachments and mark each as a Rising or Falling Structure.',
      'Detachment Execution: detach without announcement. Attachment in a negative cycle is complicity, not loyalty.',
      'Re-Attachment: attach to a "good crowd." Proximity is a force multiplier.',
      'Ongoing Maintenance: prune early signs of falling. Do not mistake familiarity for stability.',
    ],
  },
  awareness: {
    name: 'Awareness Strategy (Mastery of State)',
    premise: 'Masters do not get too high on peaks or too low in valleys.',
    phases: [
      'Peak Protocol: grounded gratitude, not manic excitement. No permanent decisions from euphoria.',
      'Valley Protocol: detached resilience, not despair. No permanent decisions from despair.',
      'The Neutralizer: "This too shall pass" and "The only constant is change," reactively and each morning.',
      'Consciousness Boundary: acknowledge reality without absorbing it. Watch the wave pass beneath you.',
    ],
  },
  alignment: {
    name: 'Alignment Strategy (Cyclical Rhythm)',
    premise: 'Seasons and stages are inevitable. Stop fighting the natural rhythm and align with it.',
    rules: [
      'Do not apply a Peak strategy in a Valley season: it causes burnout and frustration.',
      'Do not apply a Valley strategy in a Peak season: it causes missed opportunity.',
      'Align both your actions and your expectations with the current season.',
    ],
    realignment: [
      'Audit your current output: are you forcing a result this season does not support?',
      'Name the phase.',
      'Adjust the frequency: lower your intensity to match the season.',
    ],
  },
};

export const FREQUENCY = {
  principle:
    'Your Frequency is your internal set point (core values, emotional regulation, baseline identity). The wave moves; the anchor does not.',
  risk: 'Identity Fragmentation: letting the season dictate who you are.',
  guards: [
    { id: 'observer', name: 'The Observer Practice', description: 'Daily: am I acting from my core values, or reacting to the pressure of my season?' },
    { id: 'routine', name: 'The Immutable Routine', description: 'One or two habits you keep regardless of the season.' },
    { id: 'energy', name: 'The Energy Budget', description: 'When seasons get volatile, withdraw from non-essentials to keep your signal strong.' },
    { id: 'identity', name: 'Defined Identity', description: 'Three adjectives for who you are. Check your actions against them when you drift.' },
  ],
};

export const MASTERY = {
  shift: 'From participant (surviving the cycles) to conductor (engineering, accelerating or slowing them).',
  pillars: [
    'Conscious Orchestration: schedule your seasons instead of waiting for them.',
    'The Meta-Observer: observe yourself in the Peak and the Valley without being consumed.',
    'Cumulative Synthesis: record your cycles to find your personal rhythm signature.',
  ],
  artificialSeasons: {
    forcedValley: 'After about three months of sprinting, schedule an "Input Only" week where you produce nothing.',
    forcedPeak: 'If you are sluggish, run a Sprint Week: strip away 80% of maintenance tasks for one high-leverage objective.',
  },
  playbook: 'After every cycle, write one paragraph on what triggered the descent and one on how you felt in the Valley.',
  finalIndicator: 'The final indicator of Mastery is not how much you achieve, but how little you suffer while doing it.',
};

export const DAILY_CARDS = {
  morning: [
    'What season am I in right now?',
    'What is my primary attachment today, and is it rising or falling?',
    'Intention: "I will observe the rhythm today, not be consumed by it."',
  ],
  trigger: ['Am I reacting to a peak (over-excitement) or a valley (despair)?', 'Say aloud: "This too shall pass."', 'Am I attached to something that is falling right now?'],
  evening: ['Did any external event penetrate my internal peace today?', 'Did I act in alignment with my current season?', 'Am I still standing upright, unattached to what fell?'],
};

export function getFramework() {
  return {
    law: LAW,
    seasons: SEASONS,
    activities: Object.values(ACTIVITIES),
    strategies: STRATEGIES,
    frequency: FREQUENCY,
    mastery: MASTERY,
    dailyCards: DAILY_CARDS,
  };
}
