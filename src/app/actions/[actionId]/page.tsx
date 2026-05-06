'use client';

import { DEMO_ACTIONS } from '@/lib/demo-data';
import { use } from 'react';
import ActionCard from '@/components/actions/ActionCard';
import ConfidenceDot from '@/components/shared/ConfidenceDot';
import TierBadge from '@/components/shared/TierBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import DepartmentTag from '@/components/shared/DepartmentTag';
import { formatDate, formatDateRelative } from '@/lib/utils';
import { ChevronLeft, Calendar, FileText, User, Quote, Check } from 'lucide-react';
import Link from 'next/link';
import { Chip } from '@/components/shared/Input';

export default function ActionDetailPage(props: PageProps<'/actions/[actionId]'>) {
  const params = use(props.params);
  const action = DEMO_ACTIONS.find((a) => a.id === params.actionId) || DEMO_ACTIONS[0];

  return (
    <div className="space-y-6 animate-page-enter max-w-4xl">
      <Link
        href="/actions"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] hover:text-[var(--color-saffron)] transition-colors"
      >
        <ChevronLeft size={14} /> Back to Directives
      </Link>

      {/* Header */}
      <div className="card card-paper p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DepartmentTag department={action.department} />
          <StatusBadge status={action.status} />
          {action.tier && <TierBadge tier={action.tier} />}
          <ConfidenceDot
            level={action.confidence_level ?? (action.confidence >= 0.85 ? 'high' : action.confidence >= 0.7 ? 'medium' : 'low')}
            breakdown={action.confidence_breakdown}
            size="md"
            showLabel
          />
          <span
            className="badge"
            style={{
              background: action.priority === 'high'
                ? 'rgba(228,94,110,0.12)'
                : action.priority === 'medium'
                  ? 'rgba(231,140,45,0.12)'
                  : 'rgba(146,140,127,0.10)',
              color: action.priority === 'high'
                ? '#F08593'
                : action.priority === 'medium'
                  ? '#F0A04A'
                  : '#B7AE9D',
              borderColor: action.priority === 'high'
                ? 'rgba(228,94,110,0.3)'
                : action.priority === 'medium'
                  ? 'rgba(231,140,45,0.3)'
                  : 'rgba(146,140,127,0.25)',
            }}
          >
            {action.priority} priority
          </span>
          {action.directive_type && (
            <span className="badge badge-no-dot" style={{
              background: 'rgba(122,160,255,0.08)',
              color: '#9DBAFF',
              borderColor: 'rgba(122,160,255,0.25)',
            }}>
              {action.directive_type}
            </span>
          )}
        </div>
        <h1
          className="font-display text-[22px] leading-[1.32] text-[var(--color-fg)]"
          style={{ fontVariationSettings: "'opsz' 96, 'WONK' 1, 'SOFT' 50", fontWeight: 480 }}
        >
          {action.directive_text}
        </h1>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {action.deadline_iso ? (
          <div className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] mb-1.5 flex items-center gap-1.5">
              <Calendar size={11} /> Compliance deadline
              {action.deadline_confidence && (
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] border"
                      style={{ borderColor: 'var(--color-rule)', color: 'var(--color-fg-soft)' }}>
                  {action.deadline_confidence}
                </span>
              )}
            </div>
            <div className="font-display font-semibold text-[18px] text-[var(--color-fg)] numerals-tab"
                 style={{ fontVariationSettings: "'opsz' 36, 'WONK' 1" }}>
              {formatDate(action.deadline_iso)}
            </div>
            <div className="text-[12px] text-[var(--color-fg-soft)] mt-0.5">{formatDateRelative(action.deadline_iso)}</div>
            {action.deadline_basis && (
              <div className="text-[11px] text-[var(--color-fg-mute)] mt-2 italic">{action.deadline_basis}</div>
            )}
          </div>
        ) : action.deadline_confidence === 'REQUIRES_LEGAL_OPINION' ? (
          <div className="card p-4"
               style={{ borderColor: 'rgba(231,140,45,0.4)', background: 'rgba(231,140,45,0.05)' }}>
            <div className="text-[10px] font-mono mb-1.5 font-semibold uppercase tracking-[0.14em]"
                 style={{ color: '#F0A04A' }}>
              Deadline ambiguous · legal opinion sought
            </div>
            <div className="text-[12px] text-[var(--color-fg-soft)]">{action.deadline_basis}</div>
          </div>
        ) : null}
        {action.appeal_deadline_iso && (
          <div className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] mb-1.5 flex items-center gap-1.5">
              <Calendar size={11} /> Appeal limitation
              {action.appeal_deadline_confidence && (
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] border"
                      style={{ borderColor: 'var(--color-rule)', color: 'var(--color-fg-soft)' }}>
                  {action.appeal_deadline_confidence}
                </span>
              )}
            </div>
            <div className="font-display font-semibold text-[18px] text-[var(--color-fg)] numerals-tab"
                 style={{ fontVariationSettings: "'opsz' 36, 'WONK' 1" }}>
              {formatDate(action.appeal_deadline_iso)}
            </div>
            {action.appeal_deadline_basis && (
              <div className="text-[11px] text-[var(--color-fg-mute)] mt-2 italic">{action.appeal_deadline_basis}</div>
            )}
          </div>
        )}
        {action.assigned_to && (
          <div className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] mb-1.5 flex items-center gap-1.5">
              <User size={12} /> Assigned To
            </div>
            <div className="font-semibold text-[14px] text-[var(--color-fg)]">{action.assigned_to}</div>
          </div>
        )}
        {action.compliance_metric && (
          <div className="card p-4 sm:col-span-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] mb-1.5">
              Compliance metric
            </div>
            <div className="text-[13px] text-[var(--color-fg-soft)]">{action.compliance_metric}</div>
          </div>
        )}
      </div>

      {/* Source */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)]">
          <Quote size={13} className="text-[var(--color-saffron)]" />
          Source text · page {action.source_page}
        </div>
        <blockquote
          className="border-l-2 pl-4 py-2 font-display text-[15px] italic leading-relaxed text-[var(--color-fg)]"
          style={{ borderLeftColor: 'var(--color-saffron)', fontVariationSettings: "'opsz' 36, 'WONK' 0" }}
        >
          “{action.source_text}”
        </blockquote>
        {action.judgment && (
          <div className="mt-3 pt-3 border-t border-[var(--color-rule)] flex items-center gap-2 text-[11px] text-[var(--color-fg-mute)] font-mono">
            <FileText size={11} />
            <Link href={`/judgments/${action.judgment_id}`} className="text-[var(--color-azure)] hover:text-[var(--color-saffron)] transition-colors">
              {action.judgment.case_number}
            </Link>
            <span>·</span>
            <span>{action.judgment.court}</span>
          </div>
        )}
      </div>

      {/* Verification info */}
      {action.verified_by && (
        <div
          className="card p-4 flex items-center gap-3"
          style={{
            background: 'rgba(79,168,130,0.05)',
            borderColor: 'rgba(79,168,130,0.3)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(79,168,130,0.15)',
              color: '#5DBC95',
              boxShadow: '0 0 0 1px rgba(79,168,130,0.3)',
            }}
          >
            <Check size={16} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-verdant)] font-semibold">
              Verified · written back to CCMS
            </div>
            <div className="text-[13px] text-[var(--color-fg)] mt-0.5">
              {action.verified_by}
            </div>
            {action.verified_at && (
              <div className="text-[10px] text-[var(--color-fg-mute)] mt-0.5 font-mono">
                {formatDate(action.verified_at)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update status */}
      <div className="card p-5">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-3">
          Update status
        </h3>
        <div className="flex flex-wrap gap-2">
          {(['pending_verification', 'verified', 'in_progress', 'completed', 'overdue'] as const).map((s) => (
            <Chip key={s} active={action.status === s}>
              <StatusBadge status={s} size="sm" showDot={false} />
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
