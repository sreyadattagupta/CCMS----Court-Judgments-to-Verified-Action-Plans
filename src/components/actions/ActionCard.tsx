'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  formatDate,
  formatDateRelative,
  getDaysUntilDeadline,
  truncate,
} from '@/lib/utils';
import { ActionItem } from '@/types/action';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfidenceDot from '@/components/shared/ConfidenceDot';
import TierBadge from '@/components/shared/TierBadge';
import DepartmentTag from '@/components/shared/DepartmentTag';
import {
  Calendar,
  User,
  ArrowRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEPARTMENT_COLORS } from '@/types/department';

interface ActionCardProps {
  action: ActionItem;
  compact?: boolean;
  onClick?: () => void;
  highlighted?: boolean;
}

function scoreToLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.85) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

export default function ActionCard({ action, compact = false, onClick, highlighted }: ActionCardProps) {
  const daysLeft = getDaysUntilDeadline(action.deadline_iso);
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const deptColor = DEPARTMENT_COLORS[action.department] || '#6B7886';
  const level = action.confidence_level ?? scoreToLevel(action.confidence);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'card action-card-hover p-5 cursor-pointer relative group',
        highlighted && 'ring-1 ring-[var(--color-saffron)]/60',
        action.tier === 'C' && 'ring-1 ring-amber-300/50'
      )}
      onClick={onClick}
      role="article"
      aria-label={`Action: ${action.directive_text.slice(0, 60)}...`}
    >
      {/* Left ink-rule accent — newspaper-module convention */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-sm transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: deptColor, opacity: 0.85 }}
      />

      {/* Eyebrow strip — case + date + tier */}
      <div className="flex items-center gap-2 mb-2 pl-2 -ml-2 flex-wrap">
        {action.judgment && (
          <Link
            href={`/judgments/${action.judgment_id}`}
            className="text-[10px] font-mono font-semibold tracking-[0.08em] text-[var(--color-azure)] hover:text-[var(--color-saffron)] transition-colors inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText size={10} strokeWidth={2.4} />
            {action.judgment.case_number}
          </Link>
        )}
        <span className="text-[10px] font-mono text-[var(--color-ink-mute)]">·</span>
        <span className="text-[10px] font-mono text-[var(--color-ink-mute)]">
          p.{action.source_page}
          {action.evidence_spans?.[0]?.paragraph_num != null && ` ¶${action.evidence_spans[0].paragraph_num}`}
        </span>
        {action.tier && (
          <span className="ml-auto">
            <TierBadge tier={action.tier} />
          </span>
        )}
      </div>

      {/* Top row — dept, status, confidence */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          <DepartmentTag department={action.department} size="sm" />
          <StatusBadge status={action.status} size="sm" />
          {action.requires_legal_opinion && (
            <span
              title="Flagged: requires legal opinion before commit"
              className="inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em]"
              style={{
                background: 'rgba(231,140,45,0.1)',
                color: '#F0A04A',
                border: '1px solid rgba(231,140,45,0.32)',
                boxShadow: '0 0 8px rgba(231,140,45,0.15)',
              }}
            >
              <AlertTriangle size={10} /> Legal
            </span>
          )}
        </div>
        <ConfidenceDot
          level={level}
          breakdown={action.confidence_breakdown}
          size="sm"
        />
      </div>

      {/* Directive — set in serif, like a pull quote */}
      <p
        className="font-display text-[15px] leading-[1.45] text-[var(--color-ink)]"
        style={{
          fontVariationSettings: "'opsz' 36, 'WONK' 0",
          fontWeight: 460,
        }}
      >
        {compact ? truncate(action.directive_text, 140) : action.directive_text}
      </p>

      {/* Section rule */}
      <div className="my-3 h-px bg-[var(--color-divider)]" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--color-ink-mute)] font-mono">
        {action.deadline_iso ? (
          <span
            className={cn(
              'flex items-center gap-1.5',
              isOverdue && 'text-[var(--color-vermilion)] font-semibold',
              isUrgent && !isOverdue && 'text-[var(--color-saffron)] font-semibold'
            )}
            aria-label={`Deadline ${formatDate(action.deadline_iso)}`}
          >
            <Calendar size={11} />
            {formatDateRelative(action.deadline_iso)}
          </span>
        ) : action.deadline_confidence === 'REQUIRES_LEGAL_OPINION' ? (
          <span className="flex items-center gap-1.5 text-[var(--color-saffron)]">
            <AlertTriangle size={11} />
            Deadline ambiguous
          </span>
        ) : null}

        {action.assigned_to && (
          <span className="flex items-center gap-1.5">
            <User size={11} />
            <span className="truncate max-w-[14ch]">{action.assigned_to}</span>
          </span>
        )}

        {!compact && (
          <Link
            href={`/actions/${action.id}`}
            className="ml-auto inline-flex items-center gap-1 text-[var(--color-azure)] hover:text-[var(--color-saffron)] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Read brief <ArrowRight size={10} />
          </Link>
        )}
      </div>
    </motion.article>
  );
}
