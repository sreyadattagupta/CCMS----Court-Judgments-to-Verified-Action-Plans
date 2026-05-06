// Types aligned with SAMIKSHA SPEC (../../../samiksha/SPEC.md).
// These mirror the Pydantic contracts used by the SAMIKSHA backend so the
// CCMS frontend speaks the same language as the AI pipeline.

export type Tier = 'A' | 'B' | 'C';

// Reviewer-facing confidence is RAG only — never a percentage.
// SPEC non-negotiable: "Confidence is shown as red/amber/green dots, not percentages."
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DeadlineConfidence =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'REQUIRES_LEGAL_OPINION';

export type DirectiveType =
  | 'COMPLIANCE_REQUIRED'
  | 'APPEAL_OPPORTUNITY'
  | 'STATUS_QUO'
  | 'INFORMATIONAL_ONLY'
  | 'COSTS_AWARDED'
  | 'INTERIM_RELIEF';

export interface EvidenceSpan {
  page_num: number;
  paragraph_num: number;
  quoted_text: string;
  // Optional bbox lets the frontend draw highlight overlays in PDF.js.
  bbox?: { x1: number; y1: number; x2: number; y2: number };
}

export interface ConfidenceSignal {
  // SPEC §6 — three signals, weights 0.4 / 0.4 / 0.2.
  name: 'cross_validation' | 'citation_grounding' | 'self_consistency';
  score: number;            // 0..1, internal use only
  fired: boolean;           // shown in the tooltip
  description: string;      // shown in the tooltip
}

export interface ConfidenceBreakdown {
  level: ConfidenceLevel;
  signals: ConfidenceSignal[];
  // True if the action plan composer flagged the deadline as ambiguous
  // ("forthwith" / "expeditiously" etc.). Triggers REQUIRES_LEGAL_OPINION.
  requires_legal_opinion?: boolean;
}

// SPEC §1 CaseMeta
export interface CaseMeta {
  case_id: string;
  case_number: string;          // e.g. "WP/12345/2024"
  filing_year: number;
  bench: string;                // e.g. "Principal Bench, Bengaluru"
  disposal_date: string;        // ISO date
  parties_petitioner: string[];
  parties_respondent: string[];
  departments_tagged: string[]; // CCMS's existing dept tagging
  pdf_url: string;
  source: 'mock' | 'indian_kanoon' | 'ccms';
  source_ref?: string;          // upstream ID from the source API
}

export interface DeptCandidate {
  name: string;
  level: ConfidenceLevel;
  reason: string;
}

export interface Deadlines {
  compliance_deadline: string | null;          // ISO date, never LLM-computed
  compliance_deadline_basis: string;
  compliance_deadline_confidence: DeadlineConfidence;
  appeal_deadline: string | null;
  appeal_deadline_basis: string;
  appeal_deadline_confidence: DeadlineConfidence;
}

export type ReviewerActionType =
  | 'APPROVED'
  | 'EDITED'
  | 'REJECTED'
  | 'VIEWED_SOURCE'
  | 'ADDED_NOTE';

export interface AuditEvent {
  id: string;
  timestamp: string;
  case_ref: string;
  reviewer_id: string;
  field_name: string;
  action: ReviewerActionType;
  original_value?: unknown;
  new_value?: unknown;
  reviewer_signature: string; // hash via CCMS SSO
}

// Map a per-field confidence score to a tier-aware decision.
// Mirrors `should_auto_commit` from SPEC §6.
export function shouldAutoCommit(tier: Tier, level: ConfidenceLevel): boolean {
  if (tier === 'C') return false;        // never, regardless of score
  if (tier === 'A' && level === 'high') return true;
  return false;                          // Tier B always shown for one-click
}

export const TIER_FIELD_MAP: Record<string, Tier> = {
  // Tier A — deterministic / cause-title fields
  case_number: 'A',
  filing_year: 'A',
  disposal_date: 'A',
  bench: 'A',
  parties: 'A',
  // Tier B — LLM-extracted free-text
  directive_summary: 'B',
  action_type: 'B',
  responsible_dept: 'B',
  // Tier C — safety-critical, never auto-commit
  compliance_deadline: 'C',
  appeal_deadline: 'C',
  comply_vs_appeal_decision: 'C',
};

export const DIRECTIVE_TYPE_LABEL: Record<DirectiveType, string> = {
  COMPLIANCE_REQUIRED: 'Compliance required',
  APPEAL_OPPORTUNITY: 'Appeal opportunity',
  STATUS_QUO: 'Status quo',
  INFORMATIONAL_ONLY: 'Informational',
  COSTS_AWARDED: 'Costs awarded',
  INTERIM_RELIEF: 'Interim relief',
};
