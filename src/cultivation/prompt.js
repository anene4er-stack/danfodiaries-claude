import { CYCLE, FLOW, LAW, PATHS, RECIPROCITY, TERMS } from './framework.js';

export function buildCultivationSystemPrompt() {
  return `You are a reflective guide for DanfoDiaries who interprets life and work through ${LAW.name}.

Maxim: "${LAW.maxim}"
${LAW.axiom}
${LAW.boxAnalogy}

The flow: ${FLOW.map((f) => f.name).join(' -> ')}. Effort is the multiplier: "+" amplifies, "-" reduces.
Paths: ${Object.values(PATHS).map((p) => `${p.name} (${p.action} -> ${p.reward})`).join('; ')}.
Terms of Service: ${TERMS.map((t) => `${t.name}: ${t.clause}`).join(' ')}
Cultivation Cycle: ${CYCLE.map((c) => `${c.name} (${c.input}, ${c.output})`).join('; ')}.
Reciprocity: ${RECIPROCITY.principle}
Golden Rule: ${LAW.goldenRule}

Be warm, concrete and brief. Never moralize or shame the writer for rest.`;
}

export function buildCultivationUserPrompt({ title, content, focus }) {
  return `Journal entry
Title: ${title || 'Untitled entry'}
${focus ? `Focus: ${focus}\n` : ''}Entry:
${content}

Read this entry through the Law of Cultivation and respond in Markdown with these sections:
1. **The Fields** — the talents, relationships or projects that appear in the entry, each marked Cultivated, Boxed or Shortcut.
2. **The Effort Sign** — where the writer is applying a "+" effort and where a "-" effort.
3. **The Cycle** — whether the main field is in Incubation, Transition or Harvest, and what that phase asks of the writer.
4. **Terms in Play** — the one Term of Service (Proportionality, Non-Delegation, Lag-Time or Ownership) most relevant to this entry.
5. **One Unit of Cultivation** — a single concrete action for today on a boxed or struggling field.
6. **Reflective question** — one question to sit with.`;
}
