'use client';

// SAMIKSHA SPEC §"Non-negotiables":
//   "Confidence is shown as red/amber/green dots, not percentages.
//    Research shows percentages cause overreliance."

import * as Tooltip from '@radix-ui/react-tooltip';
import type {
  ConfidenceBreakdown,
  ConfidenceLevel,
} from '@/types/samiksha';
import { cn } from '@/lib/utils';

interface ConfidenceDotProps {
  level: ConfidenceLevel;
  breakdown?: ConfidenceBreakdown;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const COLOR: Record<
  ConfidenceLevel,
  { core: string; halo: string; ring: string; label: string }
> = {
  high: {
    core: '#5DBC95',
    halo: 'rgba(93,188,149,0.45)',
    ring: 'rgba(93,188,149,0.18)',
    label: 'High confidence',
  },
  medium: {
    core: '#F0A04A',
    halo: 'rgba(240,160,74,0.45)',
    ring: 'rgba(240,160,74,0.18)',
    label: 'Review suggested',
  },
  low: {
    core: '#E45E6E',
    halo: 'rgba(228,94,110,0.45)',
    ring: 'rgba(228,94,110,0.18)',
    label: 'Manual verification required',
  },
};

const SIZE: Record<NonNullable<ConfidenceDotProps['size']>, number> = {
  xs: 7,
  sm: 9,
  md: 12,
};

export default function ConfidenceDot({
  level,
  breakdown,
  size = 'sm',
  showLabel = false,
  className,
}: ConfidenceDotProps) {
  const c = COLOR[level];
  const px = SIZE[size];

  const dot = (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      role="img"
      aria-label={c.label}
    >
      <span
        className="relative inline-block flex-shrink-0"
        style={{ width: px + 6, height: px + 6 }}
      >
        {/* Outer ring (low alpha) */}
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: c.ring }}
          aria-hidden="true"
        />
        {/* Inner dot with glow */}
        <span
          className="absolute rounded-full"
          style={{
            inset: 3,
            background: c.core,
            boxShadow: `0 0 ${px * 0.8}px ${c.halo}, 0 0 0 1px rgba(0,0,0,0.4) inset`,
          }}
          aria-hidden="true"
        />
      </span>
      {showLabel && (
        <span
          className="text-[10px] font-mono uppercase tracking-[0.14em]"
          style={{ color: c.core }}
        >
          {c.label}
        </span>
      )}
    </span>
  );

  if (!breakdown) return dot;

  return (
    <Tooltip.Provider delayDuration={120}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button" className="inline-flex cursor-help">
            {dot}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-50 max-w-xs rounded-sm p-3 shadow-2xl text-[12px] animate-fade-up"
            style={{
              background: 'var(--color-ink-3)',
              border: '1px solid var(--color-rule-strong)',
              color: 'var(--color-fg)',
            }}
          >
            <div className="font-semibold mb-2 flex items-center gap-2">
              <span
                className="inline-block rounded-full"
                style={{
                  width: 9,
                  height: 9,
                  background: c.core,
                  boxShadow: `0 0 8px ${c.halo}`,
                }}
                aria-hidden="true"
              />
              <span style={{ color: c.core }}>{c.label}</span>
            </div>
            <div className="space-y-1.5">
              {breakdown.signals.map((s) => (
                <div key={s.name} className="flex gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: s.fired ? '#5DBC95' : 'rgba(242,235,216,0.18)',
                      boxShadow: s.fired ? '0 0 5px rgba(93,188,149,0.6)' : 'none',
                    }}
                  />
                  <span className="leading-snug">
                    <span className="font-mono font-semibold text-[var(--color-fg)]">
                      {s.name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[var(--color-fg-mute)]"> — {s.description}</span>
                  </span>
                </div>
              ))}
            </div>
            {breakdown.requires_legal_opinion && (
              <div
                className="mt-2.5 pt-2 border-t border-[var(--color-rule)] text-[10px] font-mono uppercase tracking-[0.14em]"
                style={{ color: '#F0A04A' }}
              >
                Flagged · requires legal opinion
              </div>
            )}
            <Tooltip.Arrow style={{ fill: 'var(--color-ink-3)' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
