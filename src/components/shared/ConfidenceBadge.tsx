'use client';

// Backwards-compat wrapper. SAMIKSHA SPEC forbids percentages in the UI
// (overreliance risk), so we redirect every legacy `ConfidenceBadge` call
// site to the RAG `ConfidenceDot`. The `showScore` prop is intentionally
// ignored — kept only so existing callers compile.

import ConfidenceDot from './ConfidenceDot';
import type { ConfidenceBreakdown, ConfidenceLevel } from '@/types/samiksha';

interface ConfidenceBadgeProps {
  score?: number;                       // 0..1, legacy
  level?: ConfidenceLevel;              // preferred
  breakdown?: ConfidenceBreakdown;
  size?: 'sm' | 'md';
  showScore?: boolean;                  // ignored
  className?: string;
}

function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

export default function ConfidenceBadge({
  score,
  level,
  breakdown,
  size = 'sm',
  className,
}: ConfidenceBadgeProps) {
  const resolved: ConfidenceLevel =
    level ?? (typeof score === 'number' ? scoreToLevel(score) : 'medium');
  return (
    <ConfidenceDot
      level={resolved}
      breakdown={breakdown}
      size={size}
      showLabel={size !== 'sm'}
      className={className}
    />
  );
}
