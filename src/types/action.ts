import type {
  ConfidenceBreakdown,
  ConfidenceLevel,
  DeadlineConfidence,
  DirectiveType,
  EvidenceSpan,
  Tier,
} from './samiksha';

export type ActionStatus =
  | 'pending_verification'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'rejected';

export type ActionPriority = 'high' | 'medium' | 'low';

export interface SourceBBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  page: number;
}

export interface ActionItem {
  id: string;
  judgment_id: string;
  directive_text: string;
  department: string;
  deadline_raw?: string;
  deadline_iso?: string;
  compliance_metric?: string;
  source_text: string;
  source_page: number;
  source_bbox?: SourceBBox;
  // SAMIKSHA confidence model.  `confidence` (0..1) stays for sorting and the
  // legacy demo views, but the UI must render `confidence_level` (RAG dot)
  // and `confidence_breakdown` (signal tooltip) per SPEC §6.
  confidence: number;
  confidence_level?: ConfidenceLevel;
  confidence_breakdown?: ConfidenceBreakdown;
  // Tier classification — drives auto-commit + reviewer-gate behavior.
  tier?: Tier;
  directive_type?: DirectiveType;
  // Provenance — every field must carry a source-span pointer.
  evidence_spans?: EvidenceSpan[];
  // Deadline metadata is computed deterministically against the Limitation
  // Act 1963 lookup table — never by the LLM (SPEC §5).
  deadline_basis?: string;
  deadline_confidence?: DeadlineConfidence;
  appeal_deadline_iso?: string;
  appeal_deadline_basis?: string;
  appeal_deadline_confidence?: DeadlineConfidence;
  requires_legal_opinion?: boolean;
  priority: ActionPriority;
  status: ActionStatus;
  assigned_to?: string;
  verified_by?: string;
  verified_at?: string;
  llm_output?: Record<string, unknown>;
  human_correction?: Record<string, unknown>;
  created_at: string;
  // Joined fields
  judgment?: {
    case_number: string;
    case_title: string;
    court: string;
  };
}

export interface ActionUpdate {
  status?: ActionStatus;
  assigned_to?: string;
  deadline_iso?: string;
  directive_text?: string;
  compliance_metric?: string;
}

export interface VerificationDecision {
  decision: 'approve' | 'edit' | 'reject';
  corrections?: Partial<ActionItem>;
  verifier_notes?: string;
}
