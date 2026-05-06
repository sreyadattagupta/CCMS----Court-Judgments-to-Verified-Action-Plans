'use client';

import { DEMO_ACTIONS, DEMO_JUDGMENTS } from '@/lib/demo-data';
import { formatDate, formatDateRelative, getDaysUntilDeadline } from '@/lib/utils';
import ActionCard from '@/components/actions/ActionCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfidenceBadge from '@/components/shared/ConfidenceBadge';
import DepartmentTag from '@/components/shared/DepartmentTag';
import ComplianceRing from '@/components/dashboard/ComplianceRing';
import { CheckCircle2, FileText, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function JudgmentDetailPage(props: PageProps<'/judgments/[id]'>) {
  const { id } = await props.params;
  const judgment = DEMO_JUDGMENTS.find((j) => j.id === id) || DEMO_JUDGMENTS[0];
  const actions = DEMO_ACTIONS.filter((a) => a.judgment_id === judgment.id);
  const verified = actions.filter((a) => a.status === 'verified' || a.status === 'completed' || a.status === 'in_progress' || a.status === 'assigned');
  const compliancePct = actions.length
    ? Math.round((actions.filter((a) => a.status === 'completed').length / actions.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Breadcrumb */}
      <Link
        href="/judgments"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] hover:text-[var(--color-saffron)] transition-colors"
      >
        <ChevronLeft size={14} /> Back to docket
      </Link>

      {/* Header card */}
      <div className="card card-paper p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="text-[12px] font-mono font-bold text-[var(--color-azure)]">{judgment.case_number}</span>
              <StatusBadge status={judgment.status as never} />
              {judgment.source === 'indian_kanoon' && (
                <span className="text-[10px] font-mono text-[var(--color-fg-mute)] border border-[var(--color-rule)] rounded-[2px] px-1.5 py-0.5">
                  source · indiankanoon · {judgment.source_ref}
                </span>
              )}
            </div>
            <h1
              className="font-display text-[26px] leading-tight mb-3 text-[var(--color-fg)]"
              style={{ fontVariationSettings: "'opsz' 96, 'WONK' 1, 'SOFT' 50", fontWeight: 580 }}
            >
              {judgment.case_title}
            </h1>
            <div className="flex flex-wrap gap-4 text-[11px] text-[var(--color-fg-mute)] font-mono">
              <span className="flex items-center gap-1.5"><FileText size={12} />{judgment.court}</span>
              {judgment.bench && <span>{judgment.bench}</span>}
              <span>{formatDate(judgment.date_of_judgment)}</span>
              {judgment.filing_year && (
                <span className="text-[var(--color-fg-fade)]">FY {judgment.filing_year}</span>
              )}
            </div>
            {(judgment.parties_petitioner || judgment.parties_respondent) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                <div>
                  <div className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.14em] mb-1">
                    Petitioner(s)
                  </div>
                  <div className="text-[var(--color-fg-soft)]">{(judgment.parties_petitioner ?? []).join('; ') || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.14em] mb-1">Respondent(s)</div>
                  <div className="text-[var(--color-fg-soft)]">{(judgment.parties_respondent ?? []).join('; ') || '—'}</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <ComplianceRing percentage={compliancePct} size={84} color="#5DBC95" sublabel="DONE" />
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2 text-[var(--color-fg-soft)]">
                <span className="font-display font-semibold text-[16px] text-[var(--color-fg)] numerals-tab">{actions.length}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)]">Total</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-azure)]">
                <span className="font-display font-semibold text-[16px] numerals-tab">{verified.length}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em]">Verified</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-verdant)]">
                <CheckCircle2 size={13} />
                <span className="font-display font-semibold text-[16px] numerals-tab">{actions.filter(a => a.status === 'completed').length}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em]">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split view hint */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PDF viewer placeholder */}
        <div className="card p-0 overflow-hidden">
          <div
            className="px-4 py-3 flex items-center gap-2 border-b border-[var(--color-rule)]"
            style={{ background: 'var(--color-ink)' }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#E45E6E' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F0A04A' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#5DBC95' }} />
            </div>
            <span className="text-[10px] font-mono text-[var(--color-fg-mute)] flex-1 text-center uppercase tracking-[0.12em]">
              {judgment.case_number}.pdf
            </span>
          </div>
          <div
            className="flex flex-col items-center justify-center"
            style={{
              height: 520,
              background: 'radial-gradient(ellipse at center, #1A1925 0%, #0E0E18 100%)',
            }}
          >
            <div
              className="rounded-sm w-4/5 h-4/5 flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #F4EEDF 0%, #E9DFC4 100%)',
                color: '#3A2D1A',
                boxShadow: '0 24px 60px -22px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            >
              <div className="absolute left-4 right-4 rounded-[1px]"
                   style={{ top: '25%', height: 26, background: 'rgba(31,107,83,0.18)', border: '1px solid rgba(31,107,83,0.4)' }} />
              <div className="absolute left-4 right-4 rounded-[1px]"
                   style={{ top: '45%', height: 26, background: 'rgba(231,140,45,0.18)', border: '1px solid rgba(231,140,45,0.4)' }} />
              <div className="absolute left-4 right-4 rounded-[1px]"
                   style={{ top: '65%', height: 26, background: 'rgba(228,94,110,0.18)', border: '1px solid rgba(228,94,110,0.4)' }} />
              <div className="text-center z-10">
                <FileText size={32} className="mx-auto mb-2" style={{ color: '#7A6446' }} />
                <p className="text-[13px] font-display font-semibold" style={{ color: '#3A2D1A' }}>PDF preview</p>
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#7A6446' }}>
                  PDF.js + custom highlight overlay
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Link
                    href={`/judgments/${id}/verify`}
                    className="btn btn-primary btn-sm"
                  >
                    Open verification
                  </Link>
                  {judgment.pdf_url && (
                    <a
                      href={judgment.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ background: 'rgba(58,45,26,0.05)', color: '#3A2D1A', borderColor: 'rgba(58,45,26,0.2)' }}
                    >
                      Source PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
                §02 · Extracted directives
              </div>
              <h2 className="headline-md text-[18px]">Action plan</h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-fg-mute)] uppercase tracking-[0.14em]">
              {actions.length} total
            </span>
          </div>
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} compact />
            ))}
            {actions.length === 0 && (
              <div className="card p-8 text-center">
                <Loader2 size={20} className="mx-auto mb-2 animate-spin text-[var(--color-saffron)]" />
                <p className="text-[12px] text-[var(--color-fg-soft)]">Extraction in progress…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
