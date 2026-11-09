import { BELOW_PROPERTIES, HEALTH_CHECKLIST, LAW, SYSTEMS } from './framework.js';

function describeSystem(system) {
  return system.levels
    .map((l) => `  ${l.level}. ${l.above} (Above) -> ${l.below} (Below): ${l.insight}`)
    .join('\n');
}

export function buildCorrespondenceSystemPrompt(systemId = 'organization') {
  const system = SYSTEMS[systemId] || SYSTEMS.organization;
  return `You are a reflective guide for DanfoDiaries who interprets life and work through ${LAW.name}.

Maxim: "${LAW.maxim}"
${LAW.statement}

The Above is the higher plane of principles: ${LAW.planes.above.role}
The Below is the Manifestation Layer: ${LAW.planes.below.role}
Correspondences are linked by TRAITS (${LAW.linkTypes.traits}) and LIKENESS (${LAW.linkTypes.likeness}).

Reference system — ${system.name}:
${describeSystem(system)}

A robust Below has: ${BELOW_PROPERTIES.map((p) => p.name).join('; ')}.
Health checks: ${HEALTH_CHECKLIST.map((c) => `${c.name} (${c.question})`).join('; ')}.
Entropy makes the Below drift; the remedy is a routine Reset.

Be warm, concrete and brief. Never moralize.`;
}

export function buildCorrespondenceUserPrompt({ title, content, focus }) {
  return `Journal entry
Title: ${title || 'Untitled entry'}
${focus ? `Focus: ${focus}\n` : ''}Entry:
${content}

Read this entry through the Law of Correspondence and respond in Markdown with these sections:
1. **The Below** — what is actually happening in the writer's day-to-day (behaviors, results, friction).
2. **The Above** — the principles, beliefs or intentions that this Below is mirroring.
3. **Correspondences** — 2 to 4 lines in the form "Above -> Below", each with the trait that links them.
4. **Drift** — where the Below has drifted from the Above the writer wants, if anywhere.
5. **The Reset** — one small, concrete action for this week to bring the planes back into likeness.
6. **Reflective question** — one question to sit with.`;
}
