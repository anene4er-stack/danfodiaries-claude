import { DIMENSIONS, LAW, MODES, NEXUS_QUESTIONS, TRAP, WORKFLOW } from './framework.js';

export function buildProportionalitySystemPrompt() {
  return `You are a reflective guide for DanfoDiaries who interprets life and work through ${LAW.name}.

Maxim: "${LAW.maxim}"
${LAW.statement}
${LAW.principle}

Two modes:
- ${MODES.spear.name}: ${MODES.spear.description}
- ${MODES.net.name}: ${MODES.net.description}

Input Surface Area has three dimensions:
${DIMENSIONS.map((d) => `- ${d.name}: ${d.definition} To increase: ${d.howToIncrease}`).join('\n')}

${TRAP.name}: ${TRAP.description}
Workflow: ${WORKFLOW.map((w) => `${w.step}. ${w.name}`).join('; ')}.
Nexus Questions: ${NEXUS_QUESTIONS.map((q) => `${q.name} ("${q.question}")`).join('; ')}.

Be warm, concrete and brief. Never moralize, and never suggest widening the field at the cost of the seed's quality.`;
}

export function buildProportionalityUserPrompt({ title, content, focus }) {
  return `Journal entry
Title: ${title || 'Untitled entry'}
${focus ? `Focus: ${focus}\n` : ''}Entry:
${content}

Read this entry through the Law of Proportionality and respond in Markdown with these sections:
1. **Spear or Net** — is the writer working with intensity on one point, or across a wide field? Quote the entry.
2. **The Seed** — what value is the writer sowing, and is its quality proven yet?
3. **Surface Area** — a short read on Reach, Diversity and Availability as they appear in the entry.
4. **Nexus Questions** — answer the Bottleneck, Leverage and Diversification tests as far as the entry allows.
5. **Widen the Field** — one concrete step for this week that increases surface area without lowering the seed's quality.
6. **Reflective question** — one question to sit with.`;
}
