'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_JUDGMENTS } from '@/lib/demo-data';
import { formatDate } from '@/lib/utils';
import { FileText, Upload, Filter, Loader2, Eye, RefreshCcw, Globe2 } from 'lucide-react';
import DropZone from '@/components/upload/DropZone';
import ExtractionProgressStepper from '@/components/upload/ExtractionProgress';
import { ExtractionProgress } from '@/types/extraction';
import { cn } from '@/lib/utils';
import type { Judgment } from '@/types/judgment';
import Button from '@/components/shared/Button';
import { Input, SearchInput } from '@/components/shared/Input';

const STATUS_COLORS: Record<string, { cls: string }> = {
  ingested:   { cls: 'badge-pending' },
  uploaded:   { cls: 'badge-pending' },
  extracting: { cls: 'badge-review' },
  extracted:  { cls: 'badge-verified' },
  in_review:  { cls: 'badge-in-progress' },
  verified:   { cls: 'badge-completed' },
  failed:     { cls: 'badge-overdue' },
  error:      { cls: 'badge-overdue' },
};

function JudgmentRow({ j }: { j: Judgment }) {
  const cfg = STATUS_COLORS[j.status] || STATUS_COLORS.uploaded;
  const compliancePct = j.action_count
    ? Math.round(((j.completed_count || 0) / j.action_count) * 100)
    : 0;

  return (
    <div className="card action-card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-5">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[3px] flex items-center justify-center flex-shrink-0 border"
        style={{
          background: 'rgba(122,160,255,0.08)',
          borderColor: 'rgba(122,160,255,0.2)',
          color: 'var(--color-azure)',
        }}
      >
        <FileText size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-[var(--color-azure)] font-semibold">{j.case_number}</span>
          <span className={cn('badge', cfg.cls)}>{j.status.replace('_', ' ')}</span>
          {j.source === 'indian_kanoon' && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-fg-mute)] border border-[var(--color-rule)] rounded-[2px] px-1.5 py-[3px]"
              title="Sourced from Indian Kanoon (docsource: khckar)"
            >
              <Globe2 size={10} /> indiankanoon
            </span>
          )}
          {j.ocr_required && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono rounded-[2px] px-1.5 py-[3px]"
                  style={{ color: '#F0A04A', background: 'rgba(231,140,45,0.08)', border: '1px solid rgba(231,140,45,0.28)' }}>
              OCR
            </span>
          )}
          {(j.languages_detected ?? []).includes('kn') && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono rounded-[2px] px-1.5 py-[3px]"
                  style={{ color: '#BBA9EC', background: 'rgba(161,139,227,0.08)', border: '1px solid rgba(161,139,227,0.28)' }}>
              EN+KN
            </span>
          )}
        </div>
        <div className="font-display text-[15px] text-[var(--color-fg)] mt-1 truncate"
             style={{ fontVariationSettings: "'opsz' 36, 'WONK' 0", fontWeight: 480 }}>
          {j.case_title}
        </div>
        <div className="text-[11px] text-[var(--color-fg-mute)] mt-1 font-mono">
          {j.court}{j.bench ? ` · ${j.bench}` : ''} · {formatDate(j.date_of_judgment)}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-center shrink-0">
        <div>
          <div className="text-[18px] font-display font-semibold text-[var(--color-fg)] numerals-tab"
               style={{ fontVariationSettings: "'opsz' 96" }}>
            {j.action_count || 0}
          </div>
          <div className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.12em]">Actions</div>
        </div>
        <div>
          <div className="text-[18px] font-display font-semibold text-[var(--color-verdant)] numerals-tab"
               style={{ fontVariationSettings: "'opsz' 96" }}>
            {j.completed_count || 0}
          </div>
          <div className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.12em]">Done</div>
        </div>
        <div>
          <div className="text-[18px] font-display font-semibold numerals-tab"
               style={{
                 color: compliancePct >= 70 ? 'var(--color-verdant)' : compliancePct >= 40 ? 'var(--color-saffron)' : 'var(--color-vermilion)',
                 fontVariationSettings: "'opsz' 96",
               }}>
            {compliancePct}%
          </div>
          <div className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.12em]">Compliant</div>
        </div>
      </div>

      {/* Action */}
      <Button as={Link} href={`/judgments/${j.id}`} variant="primary" size="md" iconLeft={<Eye size={13} />}>
        Review
      </Button>
    </div>
  );
}

export default function JudgmentsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [search, setSearch] = useState('');
  const [judgments, setJudgments] = useState<Judgment[]>(DEMO_JUDGMENTS);
  const [syncing, setSyncing] = useState(false);
  const [syncSource, setSyncSource] = useState<'seed' | 'indian_kanoon' | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/judgments/sync');
      const data = await res.json();
      if (Array.isArray(data?.judgments) && data.judgments.length > 0) {
        // Merge upstream into local list, dedupe by case_number.
        const map = new Map<string, Judgment>(judgments.map((j) => [j.case_number, j]));
        for (const j of data.judgments) {
          if (!map.has(j.case_number)) map.set(j.case_number, j);
        }
        setJudgments(Array.from(map.values()));
        setSyncSource(data.source ?? null);
      }
    } finally {
      setSyncing(false);
    }
  };

  const filtered = judgments.filter(
    (j) =>
      j.case_title.toLowerCase().includes(search.toLowerCase()) ||
      j.case_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileAccepted = (file: File) => {
    setUploadedFile(file);
  };

  const handleExtract = async () => {
    if (!uploadedFile) return;
    const steps: ExtractionProgress[] = [
      { step: 'uploading', progress: 10, message: 'Uploading to secure storage...' },
      { step: 'parsing', progress: 30, message: 'Extracting text from PDF...' },
      { step: 'chunking', progress: 50, message: 'Chunking into semantic segments...' },
      { step: 'extracting', progress: 70, message: 'Running Claude Sonnet 4.5 extraction (3× self-consistency, temp=0.2)…', extracted_count: 0 },
      { step: 'extracting', progress: 85, message: 'Processing directives...', extracted_count: 5 },
      { step: 'storing', progress: 95, message: 'Storing to database...', extracted_count: 9 },
      { step: 'complete', progress: 100, message: 'Extraction complete!', extracted_count: 9 },
    ];
    for (const s of steps) {
      setExtractionProgress(s);
      await new Promise((r) => setTimeout(r, 1200));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-fg-mute)] mb-1">
            §02 · The Docket
          </div>
          <h1 className="headline-md text-[28px]">Judgments</h1>
          <p className="text-[var(--color-fg-soft)] text-[13px] mt-2 max-w-2xl">
            Karnataka HC judgments ingested from Indian Kanoon (
            <code className="font-mono text-[11px] text-[var(--color-saffron)]">khckar</code>
            ) and the on-prem CCMS feed.
            {syncSource === 'seed' && (
              <span className="ml-2 text-[11px] font-mono text-[var(--color-saffron)]">
                · falling back to seed (set <code>INDIAN_KANOON_API_TOKEN</code> for live sync)
              </span>
            )}
            {syncSource === 'indian_kanoon' && (
              <span className="ml-2 text-[11px] font-mono text-[var(--color-verdant)]">
                · live sync via Indian Kanoon
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleSync}
            loading={syncing}
            iconLeft={<RefreshCcw size={13} />}
          >
            {syncing ? 'Syncing' : 'Sync · Indian Kanoon'}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowUpload(!showUpload)}
            iconLeft={<Upload size={13} />}
          >
            Upload Judgment
          </Button>
        </div>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="card card-paper p-6 animate-fade-up space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="headline-md text-[18px]">Upload new judgment</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpload(false)}
            >
              Cancel
            </Button>
          </div>
          <DropZone onFileAccepted={handleFileAccepted} />
          {uploadedFile && !extractionProgress && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Case Number"
                placeholder="e.g. WP/12345/2025"
                mono
              />
              <Input
                label="Case Title"
                placeholder="e.g. Petitioner v. Respondent"
              />
              <Input
                label="Court"
                placeholder="e.g. Karnataka High Court"
                defaultValue="Karnataka High Court"
              />
              <Input
                label="Date of Judgment"
                type="date"
                mono
              />
              <div className="sm:col-span-2">
                <Button
                  variant="primary"
                  size="lg"
                  block
                  onClick={handleExtract}
                  iconLeft={<Loader2 size={14} />}
                >
                  Start extraction pipeline
                </Button>
              </div>
            </div>
          )}
          {extractionProgress && <ExtractionProgressStepper progress={extractionProgress} />}
        </div>
      )}

      {/* Search & filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          className="flex-1 min-w-[260px]"
          placeholder="Search by case number, title, or party…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          aria-label="Search judgments"
        />
        <Button variant="secondary" iconLeft={<Filter size={13} />}>
          Filter
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((j) => (
          <JudgmentRow key={j.id} j={j} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <FileText size={36} className="mx-auto mb-3 text-[var(--color-fg-mute)] opacity-50" />
            <p className="font-display text-[16px] text-[var(--color-fg-soft)]">No judgments match your filters.</p>
            <p className="text-[11px] font-mono mt-1 text-[var(--color-fg-mute)] uppercase tracking-[0.14em]">
              Try syncing from Indian Kanoon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
