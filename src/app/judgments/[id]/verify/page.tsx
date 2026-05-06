'use client';

// SAMIKSHA SPEC §7 reviewer workspace.
//
// Hard requirements baked into this UI:
//   • Side-by-side: PDF on the left, action plan on the right (always).
//   • Confidence shown as RAG dots (never percentages) — see ConfidenceDot.
//   • Tier C fields cannot be approved until a `VIEWED_SOURCE` event fires
//     (i.e. the reviewer has clicked the highlighted span).  Approve button
//     stays disabled with a clear message until then.
//   • Every reviewer click is captured into an in-memory audit log so the
//     UX exposes the audit trail the production system would persist.

import { useMemo, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  X,
  Edit3,
  Save,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Quote,
  ShieldAlert,
} from 'lucide-react';

import { DEMO_JUDGMENTS, DEMO_ACTIONS } from '@/lib/demo-data';
import { ActionItem } from '@/types/action';
import { AuditEvent, ReviewerActionType, Tier } from '@/types/samiksha';
import DepartmentTag from '@/components/shared/DepartmentTag';
import ConfidenceDot from '@/components/shared/ConfidenceDot';
import TierBadge from '@/components/shared/TierBadge';
import Button from '@/components/shared/Button';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const REVIEWER_ID = 'registrar@karnatakajudiciary.gov.in';

function newEvent(
  caseRef: string,
  field: string,
  action: ReviewerActionType,
  original?: unknown,
  next?: unknown
): AuditEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    case_ref: caseRef,
    reviewer_id: REVIEWER_ID,
    field_name: field,
    action,
    original_value: original,
    new_value: next,
    // Production: signed via CCMS SSO.  Demo: deterministic hash-of-id.
    reviewer_signature: `sso:demo:${REVIEWER_ID}`,
  };
}

interface FieldRow {
  key: string;          // form/audit key, e.g. "directive_text"
  label: string;
  tier: Tier;
  value: string;
  evidenceQuote?: string;
  evidencePage?: number;
  evidencePara?: number;
}

function buildFields(action: ActionItem): FieldRow[] {
  const ev = action.evidence_spans?.[0];
  return [
    {
      key: 'directive_summary',
      label: 'Directive summary',
      tier: 'B',
      value: action.directive_text,
      evidenceQuote: action.source_text,
      evidencePage: action.source_page,
      evidencePara: ev?.paragraph_num,
    },
    {
      key: 'responsible_dept',
      label: 'Responsible department',
      tier: 'B',
      value: action.department,
      evidenceQuote: action.source_text,
      evidencePage: action.source_page,
      evidencePara: ev?.paragraph_num,
    },
    {
      key: 'compliance_deadline',
      label: 'Compliance deadline',
      tier: 'C',
      value: action.deadline_iso
        ? `${formatDate(action.deadline_iso)} (${action.deadline_raw ?? '—'})`
        : `${action.deadline_confidence ?? 'UNKNOWN'} — ${action.deadline_basis ?? 'No deadline parsed'}`,
      evidenceQuote: action.source_text,
      evidencePage: action.source_page,
      evidencePara: ev?.paragraph_num,
    },
    {
      key: 'appeal_deadline',
      label: 'Appeal limitation date',
      tier: 'C',
      value: action.appeal_deadline_iso
        ? `${formatDate(action.appeal_deadline_iso)} — ${action.appeal_deadline_basis ?? ''}`
        : 'Not applicable',
      evidenceQuote: 'Computed via Limitation Act 1963 — see ../../docs/limitation_act_table.md',
      evidencePage: action.source_page,
      evidencePara: ev?.paragraph_num,
    },
  ];
}

export default function VerificationPage(props: PageProps<'/judgments/[id]/verify'>) {
  const params = use(props.params);
  const judgment =
    DEMO_JUDGMENTS.find((j) => j.id === params.id) || DEMO_JUDGMENTS[0];
  const actions = DEMO_ACTIONS.filter((a) => a.judgment_id === judgment.id);
  const reviewable = actions.filter(
    (a) =>
      a.status === 'pending_verification' ||
      a.status === 'in_progress' ||
      a.status === 'verified'
  );
  const queue = reviewable.length > 0 ? reviewable : actions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const action = queue[currentIndex] ?? actions[0];
  const fields = useMemo(() => (action ? buildFields(action) : []), [action]);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Tier C gate — track which (action_id, field_key) pairs have had a
  // `VIEWED_SOURCE` event.  Approve stays disabled until viewed.
  const [viewedSources, setViewedSources] = useState<Set<string>>(new Set());

  // Per-field decision state keyed by (action_id, field_key).
  const [decisions, setDecisions] = useState<
    Record<string, 'APPROVED' | 'EDITED' | 'REJECTED'>
  >({});

  // PDF highlight focus.
  const [activeFieldKey, setActiveFieldKey] = useState<string>('directive_summary');

  // Audit trail (live, in-memory).
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const log = useCallback(
    (evt: AuditEvent) => setAudit((a) => [...a, evt]),
    []
  );

  if (!action) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-page-enter">
        <CheckCircle2 size={56} className="text-[var(--color-verdant)] mb-4" />
        <h2 className="headline-md text-[24px] mb-2">All caught up</h2>
        <p className="text-[12px] font-mono text-[var(--color-fg-mute)] uppercase tracking-[0.14em]">
          No directives pending verification for this judgment
        </p>
        <Link
          href={`/judgments/${params.id}`}
          className="btn btn-secondary mt-6"
        >
          Return to judgment
        </Link>
      </div>
    );
  }

  const decisionKey = (k: string) => `${action.id}::${k}`;
  const sourceKey = (k: string) => `${action.id}::${k}`;
  const allDecided = fields.every((f) => decisions[decisionKey(f.key)]);

  const onViewSource = (key: string) => {
    setActiveFieldKey(key);
    if (!viewedSources.has(sourceKey(key))) {
      setViewedSources((s) => new Set(s).add(sourceKey(key)));
      log(newEvent(action.judgment?.case_number ?? action.id, key, 'VIEWED_SOURCE'));
    }
  };

  const onApprove = (f: FieldRow) => {
    if (f.tier === 'C' && !viewedSources.has(sourceKey(f.key))) return;
    setDecisions((d) => ({ ...d, [decisionKey(f.key)]: 'APPROVED' }));
    log(newEvent(action.judgment?.case_number ?? action.id, f.key, 'APPROVED', f.value));
  };

  const onReject = (f: FieldRow) => {
    setDecisions((d) => ({ ...d, [decisionKey(f.key)]: 'REJECTED' }));
    log(newEvent(action.judgment?.case_number ?? action.id, f.key, 'REJECTED', f.value));
  };

  const onSaveEdit = (f: FieldRow) => {
    setDecisions((d) => ({ ...d, [decisionKey(f.key)]: 'EDITED' }));
    log(newEvent(action.judgment?.case_number ?? action.id, f.key, 'EDITED', f.value, editValue));
    setEditingKey(null);
    setEditValue('');
  };

  const [showStamp, setShowStamp] = useState(false);
  const onFinalize = () => {
    setShowStamp(true);
    window.setTimeout(() => {
      setShowStamp(false);
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((i) => i + 1);
        setActiveFieldKey('directive_summary');
        setEditingKey(null);
        setDecisions({});
        setViewedSources(new Set());
        setAudit([]);
      }
    }, 1600);
  };

  const activeField = fields.find((f) => f.key === activeFieldKey);

  return (
    <div className="space-y-4 animate-page-enter h-[calc(100vh-120px)] flex flex-col relative">
      {/* Verified ink-stamp overlay — fires on Finalize */}
      <AnimatePresence>
        {showStamp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 2.4, rotate: -22, opacity: 0 }}
              animate={{
                scale: [2.4, 0.94, 1.04, 1],
                rotate: [-22, -3, -3, -3],
                opacity: [0, 1, 1, 0.92],
              }}
              transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], times: [0, 0.55, 0.72, 1] }}
              className="relative"
            >
              <div
                className="px-12 py-7 border-[6px] border-current rounded-sm font-display text-[80px] tracking-[0.16em] uppercase"
                style={{
                  color: 'var(--color-verdant)',
                  fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 30",
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.04)',
                  textShadow: '0 0 0.5px rgba(31,94,69,0.4), 1px 1px 0 rgba(31,94,69,0.18)',
                  boxShadow: '0 0 0 4px rgba(31,94,69,0.05)',
                }}
              >
                Verified
              </div>
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[var(--color-verdant)] font-mono text-[11px] tracking-[0.24em] uppercase whitespace-nowrap"
                style={{ fontWeight: 700 }}
              >
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })} · Karnataka High Court
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header strip */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/judgments/${params.id}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </Link>
          <div className="text-xs text-[var(--color-border)] hidden md:block">·</div>
          <div className="text-sm">
            <span className="font-mono font-semibold text-[var(--color-azure)]">
              {action.judgment?.case_number}
            </span>
            <span className="text-[var(--color-ink-mute)] mx-2">·</span>
            <span className="text-[var(--color-ink)] font-medium">
              {judgment.bench}
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-mute)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1 rounded-sm">
          Directive {currentIndex + 1} / {queue.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* ── PDF / Source pane ─────────────────────────────────── */}
        <div className="card flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-[var(--color-ink)] border-b border-[var(--color-rule)] flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-soft)]">
              <FileText size={14} className="text-[var(--color-azure)]" />
              Source · Page {action.source_page}
              {activeField?.evidencePara && (
                <span className="text-[var(--color-fg-mute)]">
                  ¶{activeField.evidencePara}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-[var(--color-fg-mute)] truncate max-w-[12rem]">
              {judgment.case_number}.pdf
            </span>
          </div>

          <div
            className="flex-1 relative overflow-hidden flex flex-col items-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, #1A1925 0%, #0E0E18 100%)',
            }}
          >
            <div
              className="w-full max-w-xl flex-1 relative p-8 font-serif text-sm leading-relaxed overflow-y-auto"
              style={{
                background:
                  'linear-gradient(180deg, #F4EEDF 0%, #ECE3CC 100%)',
                color: '#3A2D1A',
                boxShadow: '0 24px 60px -20px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.04)',
                borderRadius: '2px',
              }}
            >
              <div
                className="text-center font-bold mb-6 pb-4 border-b"
                style={{ borderColor: 'rgba(58,45,26,0.25)' }}
              >
                IN THE HIGH COURT OF KARNATAKA AT BENGALURU
                <br />
                <span className="text-[11px] font-normal" style={{ color: '#7A6446' }}>
                  {judgment.bench} · {formatDate(judgment.date_of_judgment)}
                </span>
              </div>

              <p className="mb-4 text-justify" style={{ color: '#4A3A20' }}>
                <span className="font-semibold">Cause Title:</span>{' '}
                {(judgment.parties_petitioner ?? []).join(', ')} … <span className="italic">vs</span>{' '}
                {(judgment.parties_respondent ?? []).slice(0, 2).join(', ')}
                {(judgment.parties_respondent?.length ?? 0) > 2 ? ' & Ors.' : ''}
              </p>

              <p className="mb-4 text-justify" style={{ color: '#4A3A20' }}>
                Having heard the learned counsel for the parties and on a perusal of the
                record, this Court is of the considered view that the following directions
                are necessary in the interest of justice and timely compliance.
              </p>

              {/* Highlighted source span — colour matches active field's tier */}
              <div
                className="relative my-4 p-3 -mx-2 rounded-[2px] cursor-pointer group transition-all"
                style={{
                  background:
                    activeField?.tier === 'C' ? 'rgba(231,140,45,0.18)' : 'rgba(31,107,83,0.16)',
                  border:
                    activeField?.tier === 'C' ? '1px solid rgba(231,140,45,0.5)' : '1px solid rgba(31,107,83,0.4)',
                }}
                onClick={() => activeField && onViewSource(activeField.key)}
              >
                <span
                  className="absolute -left-3 top-0 bottom-0 w-1 rounded-full"
                  style={{
                    background: activeField?.tier === 'C' ? '#C9610A' : '#1F5E45',
                  }}
                />
                <div className="flex items-start gap-2">
                  <Quote size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#7A6446' }} />
                  <div>
                    <div
                      className="text-[10px] font-mono uppercase tracking-[0.14em] mb-1"
                      style={{ color: '#7A6446' }}
                    >
                      {activeField?.label} · ¶{activeField?.evidencePara ?? '—'}
                    </div>
                    <div style={{ color: '#3A2D1A' }}>
                      {activeField?.evidenceQuote ?? action.source_text}
                    </div>
                  </div>
                </div>
                <span
                  className="absolute -top-3 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.12em]"
                  style={{ background: '#14141C', color: '#F4EEDF' }}
                >
                  Click to register source view
                </span>
              </div>

              <p className="mt-4 text-justify" style={{ color: '#4A3A20' }}>
                The Registry shall communicate this order forthwith to the concerned
                authorities for ensuring compliance. Liberty is reserved to the parties to
                move this Court for any further directions, if necessary.
              </p>
            </div>

            {/* Field switcher — quick jump between fields whose source spans
                the reviewer needs to look at. */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {fields.map((f) => {
                const viewed = viewedSources.has(sourceKey(f.key));
                const isActive = activeFieldKey === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => onViewSource(f.key)}
                    className={cn('chip', isActive && 'chip-active')}
                    style={
                      isActive
                        ? {
                            background: 'var(--color-saffron)',
                            color: 'var(--color-ink)',
                            borderColor: 'var(--color-saffron)',
                            boxShadow: '0 0 12px var(--color-saffron-glow)',
                          }
                        : undefined
                    }
                  >
                    <TierBadge tier={f.tier} />
                    {f.label}
                    {viewed && <Eye size={11} style={{ color: isActive ? 'inherit' : 'var(--color-verdant)' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Action plan / decision pane ─────────────────────── */}
        <div
          className="card flex flex-col overflow-hidden shadow-md border-t-4"
          style={{ borderTopColor: 'var(--color-saffron)' }}
        >
          <div className="px-6 py-4 border-b border-[var(--color-rule)] flex items-center justify-between gap-3"
               style={{ background: 'var(--color-ink)' }}>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
                §07 · Reviewer Verification
              </div>
              <h2 className="font-display text-[18px] text-[var(--color-fg)]"
                  style={{ fontVariationSettings: "'opsz' 36, 'WONK' 1, 'SOFT' 50", fontWeight: 580 }}>
                Verify Extracted Action Plan
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-fg-mute)] mt-1.5">
                <DepartmentTag department={action.department} size="sm" />
                <span className="font-mono uppercase tracking-[0.1em]">
                  {action.directive_type ?? 'COMPLIANCE_REQUIRED'}
                </span>
              </div>
            </div>
            <ConfidenceDot
              level={action.confidence_level ?? 'medium'}
              breakdown={action.confidence_breakdown}
              size="md"
              showLabel
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {action.requires_legal_opinion && (
              <div
                className="rounded-[3px] p-3 flex items-start gap-2 text-[12px]"
                style={{
                  background: 'rgba(231,140,45,0.08)',
                  border: '1px solid rgba(231,140,45,0.4)',
                  color: '#F0A04A',
                }}
              >
                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold uppercase tracking-[0.08em] text-[11px] font-mono">
                    Requires legal opinion before commit
                  </div>
                  <div className="text-[var(--color-fg-soft)] mt-1">
                    The directive contains an ambiguous timeline ("expeditiously",
                    "next supplementary budget", or "next date of hearing").
                    Per the SAMIKSHA Limitation calculator (SPEC §5), no deadline is auto-derived.
                  </div>
                </div>
              </div>
            )}

            {fields.map((f) => {
              const decision = decisions[decisionKey(f.key)];
              const viewed = viewedSources.has(sourceKey(f.key));
              const tierCBlocked = f.tier === 'C' && !viewed;
              const isEditing = editingKey === f.key;
              const dotLevel =
                decision === 'APPROVED' ? 'high'
                : decision === 'REJECTED' ? 'low'
                : decision === 'EDITED' ? 'medium'
                : action.confidence_level ?? 'medium';

              return (
                <div
                  key={f.key}
                  className={cn(
                    'rounded-[3px] border p-4 transition-all bg-[var(--color-ink-2)]',
                    activeFieldKey === f.key
                      ? 'border-[var(--color-saffron)] shadow-[0_0_0_1px_var(--color-saffron-glow),0_0_18px_var(--color-saffron-glow)]'
                      : 'border-[var(--color-rule)]',
                    f.tier === 'C' && activeFieldKey !== f.key && 'border-amber-700/30',
                    decision === 'APPROVED' && 'bg-[rgba(79,168,130,0.06)] border-[rgba(79,168,130,0.4)]',
                    decision === 'REJECTED' && 'bg-[rgba(228,94,110,0.06)] border-[rgba(228,94,110,0.4)]',
                    decision === 'EDITED' && 'bg-[rgba(122,160,255,0.05)] border-[rgba(122,160,255,0.4)]'
                  )}
                  onClick={() => setActiveFieldKey(f.key)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)]">
                        {f.label}
                      </span>
                      <TierBadge tier={f.tier} />
                    </div>
                    <ConfidenceDot level={dotLevel} size="sm" />
                  </div>

                  {!isEditing ? (
                    <div
                      className="mt-2 text-[14px] leading-relaxed font-display text-[var(--color-fg)]"
                      style={{ fontVariationSettings: "'opsz' 36, 'WONK' 0", fontWeight: 460 }}
                    >
                      {f.value}
                    </div>
                  ) : (
                    <textarea
                      className="mt-2 w-full"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ minHeight: 92 }}
                    />
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewSource(f.key);
                      }}
                      className={cn('chip', viewed && 'chip-active')}
                    >
                      <Eye size={11} /> {viewed ? 'Source viewed' : 'View source'}
                    </button>

                    {f.tier === 'C' && !viewed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: '#F0A04A' }}>
                        <AlertTriangle size={11} />
                        Tier C · view source first
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconLeft={<Edit3 size={11} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingKey(f.key);
                              setEditValue(f.value);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            iconLeft={<X size={11} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(f);
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            iconLeft={<Check size={11} />}
                            disabled={tierCBlocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(f);
                            }}
                          >
                            Approve
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingKey(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            iconLeft={<Save size={11} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveEdit(f);
                            }}
                          >
                            Save edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Audit log — live capture of every reviewer click */}
            <div className="mt-5 pt-4 border-t border-[var(--color-rule)]">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-3 flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft"
                  aria-hidden="true"
                />
                Audit trail · live this session
              </div>
              {audit.length === 0 ? (
                <div className="text-[11px] text-[var(--color-fg-mute)] italic font-mono">
                  No reviewer actions yet — every click is signed and timestamped.
                </div>
              ) : (
                <ul className="space-y-1.5 text-[11px] font-mono">
                  {audit.slice(-6).reverse().map((e) => (
                    <li key={e.id} className="flex gap-2 items-baseline">
                      <span className="text-[var(--color-fg-mute)]">
                        {new Date(e.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                      </span>
                      <span
                        className="font-semibold uppercase tracking-[0.08em]"
                        style={{
                          color:
                            e.action === 'APPROVED' ? '#5DBC95' :
                            e.action === 'REJECTED' ? '#F08593' :
                            e.action === 'EDITED'   ? '#F0A04A' :
                            e.action === 'VIEWED_SOURCE' ? '#9DBAFF' :
                            'var(--color-fg-soft)',
                        }}
                      >
                        {e.action}
                      </span>
                      <span className="text-[var(--color-fg-soft)]">· {e.field_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="p-4 border-t border-[var(--color-rule)] flex items-center justify-between gap-3"
               style={{ background: 'var(--color-ink)' }}>
            <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-mute)]">
              <span className="font-semibold text-[var(--color-fg)]">
                {Object.keys(decisions).filter((k) => k.startsWith(action.id + '::')).length}
              </span>
              <span> / {fields.length} fields decided</span>
            </div>
            <Button
              variant="success"
              size="lg"
              iconLeft={<Check size={14} />}
              onClick={onFinalize}
              disabled={!allDecided}
            >
              Finalize · write back to CCMS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
