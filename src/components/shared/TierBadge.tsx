'use client';

import { cn } from '@/lib/utils';
import type { Tier } from '@/types/samiksha';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md';
  className?: string;
}

const META: Record<
  Tier,
  {
    label: string;
    tooltip: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: typeof Shield;
  }
> = {
  A: {
    label: 'Tier A',
    tooltip: 'Deterministic field — auto-commits when confidence is high',
    color: '#5DBC95',
    bg: 'rgba(93,188,149,0.10)',
    border: 'rgba(93,188,149,0.32)',
    glow: 'rgba(93,188,149,0.0)',
    icon: ShieldCheck,
  },
  B: {
    label: 'Tier B',
    tooltip: 'LLM-extracted — one-click reviewer approval',
    color: '#9DBAFF',
    bg: 'rgba(122,160,255,0.08)',
    border: 'rgba(122,160,255,0.28)',
    glow: 'rgba(122,160,255,0.0)',
    icon: Shield,
  },
  C: {
    label: 'Tier C',
    tooltip: 'Safety-critical — never auto-commits; reviewer must view source',
    color: '#F0A04A',
    bg: 'rgba(231,140,45,0.12)',
    border: 'rgba(231,140,45,0.42)',
    glow: 'rgba(231,140,45,0.20)',
    icon: ShieldAlert,
  },
};

export default function TierBadge({ tier, size = 'sm', className }: TierBadgeProps) {
  const m = META[tier];
  const Icon = m.icon;
  return (
    <span
      title={m.tooltip}
      aria-label={m.tooltip}
      className={cn(
        'inline-flex items-center gap-1 rounded-[3px] border font-mono font-semibold uppercase tracking-[0.08em]',
        size === 'sm' ? 'text-[9px] px-1.5 py-[3px]' : 'text-[10px] px-2 py-1',
        className
      )}
      style={{
        background: m.bg,
        color: m.color,
        borderColor: m.border,
        boxShadow: tier === 'C' ? `0 0 0 1px ${m.glow}, 0 0 12px ${m.glow}` : 'none',
      }}
    >
      <Icon size={size === 'sm' ? 9 : 11} strokeWidth={2.4} />
      {m.label}
    </span>
  );
}
