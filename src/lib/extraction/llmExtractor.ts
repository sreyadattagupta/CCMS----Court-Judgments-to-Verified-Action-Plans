// LLM extractor — aligned with SAMIKSHA SPEC §4 (extraction) and the §"How to
// work with me" guidance in ../../../../samiksha/CLAUDE.md.
//
// Production swaps Claude for Llama 3.1 70B via the same Protocol; this
// prototype uses Claude Sonnet 4.5 because the spec explicitly names it as
// the prototype LLM.  The wrapper enforces:
//   • strict JSON-array output (no markdown, no commentary),
//   • mandatory citation per field (verbatim quoted span),
//   • temperature=0.2 — production runs this 3x for self-consistency
//     (handled by the caller, not here).

import Anthropic from '@anthropic-ai/sdk';
import { LLMExtractedAction } from '@/types/extraction';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Production should resolve this from env so deployment can pin a snapshot.
const MODEL = process.env.SAMIKSHA_LLM_MODEL ?? 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `You are extracting structured directives from Indian
court judgments — primarily from the Karnataka High Court — for the
SAMIKSHA / CCMS pipeline. Every field you extract must be backed by a
verbatim quote from the input. If you cannot find a verbatim quote, drop
the field rather than inventing one.

For each directive, return one JSON object with exactly these fields:

{
  "directive": "directive text from the judgment",
  "department": "Karnataka or Union department/agency responsible",
  "deadline_raw": "deadline phrase as stated in the judgment",
  "deadline_iso": "YYYY-MM-DD (estimate from disposal date) or null",
  "metric": "how compliance should be measured",
  "source_text": "verbatim quote (must be a substring of the input)",
  "source_page": <int>,
  "confidence": <float between 0 and 1>,
  "priority": "high" | "medium" | "low"
}

Rules:
- Return ONLY a valid JSON array, no markdown, no explanation.
- 'source_text' MUST be a verbatim substring of the input. Citations that
  do not match will be dropped during grounding (SPEC §4).
- Do NOT compute compliance deadlines yourself — leave deadline_iso as null
  for ambiguous timelines ("forthwith", "expeditiously", "next hearing").
  The deterministic limitation calculator (SPEC §5) handles those.
- 'department' should be the responsible Karnataka/Union department, not
  a generic descriptor.`;

export async function extractActionsFromText(
  text: string,
  judgmentDate: string,
  onChunk?: (partial: string) => void
): Promise<LLMExtractedAction[]> {
  const userMessage = `Disposal date: ${judgmentDate}

Judgment text (RULING-tagged sentences only):
${text.slice(0, 80000)}`;

  if (onChunk) {
    let fullText = '';
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        fullText += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    return parseExtractedActions(fullText);
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text_content = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  return parseExtractedActions(text_content);
}

function parseExtractedActions(text: string): LLMExtractedAction[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: Record<string, unknown>) => ({
      directive: String(item.directive || ''),
      department: String(item.department || 'General'),
      deadline_raw: String(item.deadline_raw || 'not specified'),
      deadline_iso: (item.deadline_iso as string) || '',
      metric: String(item.metric || ''),
      source_text: String(item.source_text || ''),
      source_page: Number(item.source_page) || 1,
      confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
      priority: (['high', 'medium', 'low'].includes(String(item.priority))
        ? String(item.priority)
        : 'medium') as 'high' | 'medium' | 'low',
    }));
  } catch {
    return [];
  }
}
