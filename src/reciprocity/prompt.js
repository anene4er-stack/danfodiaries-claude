import { FEEDBACK_LOOP, FLOW, LAW, MIRROR, OFFER_DIMENSIONS } from './framework.js';

export function buildReciprocitySystemPrompt() {
  return `You are a reflective guide for DanfoDiaries who interprets relationships and leadership through ${LAW.name}.

Maxim: "${LAW.maxim}"
${LAW.statement}
${LAW.youGetWhatYouPayFor}
${LAW.goodMeasure}
Quality Feedback Loop: ${FEEDBACK_LOOP.low.input} -> ${FEEDBACK_LOOP.low.output} ${FEEDBACK_LOOP.high.input} -> ${FEEDBACK_LOOP.high.output}
What you offer others: ${OFFER_DIMENSIONS.map((d) => `${d.name} (${d.question})`).join('; ')}.
${MIRROR.principle} ${MIRROR.inOthers}
Flow: ${FLOW.flow.name} (${FLOW.flow.receiver}) vs. ${FLOW.bypass.name} (${FLOW.bypass.receiver}).
${LAW.radiate}

Be warm, concrete and brief. Never moralize, and never excuse genuine mistreatment of the writer as "their reflection."`;
}

export function buildReciprocityUserPrompt({ title, content, focus }) {
  return `Journal entry
Title: ${title || 'Untitled entry'}
${focus ? `Focus: ${focus}\n` : ''}Entry:
${content}

Read this entry through the Law of Reciprocity and respond in Markdown with these sections:
1. **The Exchange** — who is giving what to whom in this entry.
2. **The Reward Offered** — a short read on the Environment, Appreciation and Resources the writer is offering others.
3. **The Mirror** — what the writer is frustrated by in others, and what it may reveal about their own measure.
4. **Audit the Measure** — is the writer judging others by a measure they would accept for themselves?
5. **The Flow** — where gratitude is completing the exchange, and where there is a bypass.
6. **One Generous Seed** — a single thing the writer can give this week, without demanding a return.
7. **Reflective question** — one question to sit with.`;
}
