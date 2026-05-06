// Judgment lifecycle mirrors SAMIKSHA's pipeline:
//   ingested  → triage/OCR queued
//   extracting→ Celery task running
//   extracted → action plan generated, awaiting reviewer
//   in_review → reviewer has opened the case
//   verified  → all fields APPROVED/EDITED/REJECTED, written back to CCMS
//   failed    → INGEST_FAILED (per SPEC §1 failure modes)
export type JudgmentStatus =
  | 'ingested'
  | 'extracting'
  | 'extracted'
  | 'in_review'
  | 'verified'
  | 'failed'
  // legacy aliases kept for the upload demo flow
  | 'uploaded'
  | 'error';

export interface Judgment {
  id: string;
  case_number: string;
  case_title: string;
  court: string;
  bench?: string;
  date_of_judgment: string;
  pdf_url: string;
  pdf_hash?: string;
  status: JudgmentStatus;
  uploaded_by?: string;
  created_at: string;
  action_count?: number;
  verified_count?: number;
  completed_count?: number;
  // SAMIKSHA additions — mirror CaseMeta in SPEC §1
  filing_year?: number;
  parties_petitioner?: string[];
  parties_respondent?: string[];
  departments_tagged?: string[];
  source?: 'mock' | 'indian_kanoon' | 'ccms';
  source_ref?: string;
  languages_detected?: ('en' | 'kn')[];
  ocr_required?: boolean;
}

export interface JudgmentUpload {
  case_number: string;
  case_title: string;
  court: string;
  bench?: string;
  date_of_judgment: string;
  file: File;
}
