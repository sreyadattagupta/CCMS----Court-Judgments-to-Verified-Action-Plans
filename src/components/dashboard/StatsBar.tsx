'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { FileText, ListChecks, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DEMO_ACTIONS, DEMO_JUDGMENTS } from '@/lib/demo-data';
import { EASE_PAPER } from '@/lib/utils';

const totalJudgments = DEMO_JUDGMENTS.length;
const totalActions = DEMO_ACTIONS.length;
const overdueCount = DEMO_ACTIONS.filter((a) => a.status === 'overdue').length;
const completedCount = DEMO_ACTIONS.filter((a) => a.status === 'completed').length;
const compliancePct = Math.round((completedCount / totalActions) * 100);

interface Stat {
  label: string;
  value: number;
  prev: number;          // 7d-ago notional value for the trend chip
  icon: React.ReactNode;
  tone: 'azure' | 'saffron' | 'vermilion' | 'verdant';
  suffix?: string;
  sublabel?: string;
  // 7-day sparkline values, last value === current value
  spark: number[];
}

const TONE: Record<Stat['tone'], { fg: string; ink: string; spark: string; rule: string }> = {
  azure:     { fg: '#1E3A8A', ink: '#0F1E4A', spark: '#1E3A8A', rule: '#1E3A8A' },
  saffron:   { fg: '#8E3D00', ink: '#5C2700', spark: '#C9610A', rule: '#C9610A' },
  vermilion: { fg: '#871318', ink: '#5C0B0F', spark: '#B0161F', rule: '#B0161F' },
  verdant:   { fg: '#1F5E45', ink: '#103D2C', spark: '#1F5E45', rule: '#1F5E45' },
};

const STATS: Stat[] = [
  {
    label: 'Judgments ingested',
    value: totalJudgments,
    prev: Math.max(1, totalJudgments - 2),
    icon: <FileText size={14} strokeWidth={2.2} />,
    tone: 'azure',
    sublabel: `${DEMO_JUDGMENTS.filter((j) => j.status === 'verified').length} verified · ${DEMO_JUDGMENTS.filter((j) => j.status === 'extracting').length} extracting`,
    spark: spline(totalJudgments, 7, 0.45),
  },
  {
    label: 'Action directives',
    value: totalActions,
    prev: Math.max(1, totalActions - 5),
    icon: <ListChecks size={14} strokeWidth={2.2} />,
    tone: 'saffron',
    sublabel: `across ${new Set(DEMO_ACTIONS.map((a) => a.department)).size} departments`,
    spark: spline(totalActions, 7, 0.55),
  },
  {
    label: 'Overdue',
    value: overdueCount,
    prev: overdueCount + 1,
    icon: <AlertTriangle size={14} strokeWidth={2.2} />,
    tone: 'vermilion',
    sublabel: 'awaiting executive escalation',
    spark: spline(overdueCount + 2, 7, 0.7, true),
  },
  {
    label: 'Compliance',
    value: compliancePct,
    prev: Math.max(0, compliancePct - 6),
    icon: <CheckCircle2 size={14} strokeWidth={2.2} />,
    tone: 'verdant',
    suffix: '%',
    sublabel: `${completedCount} of ${totalActions} directives complete`,
    spark: spline(compliancePct, 7, 0.5),
  },
];

// Generate a plausible 7-day spark — start lower, end at `value`.
function spline(value: number, points: number, jitter = 0.5, descending = false): number[] {
  const start = Math.max(0, descending ? value + 3 : Math.round(value * (1 - jitter)));
  const arr: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * jitter * 0.6;
    arr.push(Math.max(0, Math.round(start + (value - start) * t + noise)));
  }
  arr[points - 1] = value;
  return arr;
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.2,
      ease: EASE_PAPER,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="numerals-tab tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const W = 110;
  const H = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = W / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  // Smooth fill area underneath the line
  const fill = `${path} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={fill}
        fill={`url(#spark-${color.slice(1)})`}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: EASE_PAPER }}
      />
      {/* End-point dot */}
      <motion.circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="2.4"
        fill={color}
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      />
    </svg>
  );
}

function StatModule({ stat, index }: { stat: Stat; index: number }) {
  const tone = TONE[stat.tone];
  const delta = stat.value - stat.prev;
  const deltaPct = stat.prev > 0 ? Math.round((delta / stat.prev) * 100) : 0;
  // For 'overdue' the trend is inverted — a reduction is good.
  const isImprovement = stat.tone === 'vermilion' ? delta < 0 : delta > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_PAPER }}
      whileHover={{ y: -3 }}
      className="card card-paper p-7 relative overflow-hidden"
    >
      {/* Eyebrow rule */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-sm"
          style={{ background: `${tone.rule}1A`, color: tone.rule }}
        >
          {stat.icon}
        </span>
        <span
          className="text-[10px] font-mono uppercase tracking-[0.16em]"
          style={{ color: tone.fg }}
        >
          {stat.label}
        </span>
        {/* Delta chip */}
        <span
          className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-sm border"
          style={{
            color: isImprovement ? '#1F5E45' : '#871318',
            borderColor: isImprovement ? '#A6C9B5' : '#E0AAB0',
            background: isImprovement ? '#E5F2EB' : '#FBE7E9',
          }}
          title={`vs 7 days ago`}
        >
          {delta > 0 ? '+' : ''}
          {delta}
          {stat.tone === 'verdant' || stat.suffix === '%' ? 'pp' : ''}
        </span>
      </div>

      {/* Big numeral */}
      <div className="flex items-end justify-between gap-2">
        <div
          className="headline-md text-[42px] leading-none"
          style={{
            color: tone.ink,
            fontVariationSettings: "'opsz' 96, 'WONK' 1, 'SOFT' 30",
          }}
        >
          <CountUp to={stat.value} suffix={stat.suffix ?? ''} />
        </div>
        <Sparkline values={stat.spark} color={tone.spark} />
      </div>

      {stat.sublabel && (
        <div className="mt-3 text-[12px] text-[var(--color-ink-mute)] leading-snug">
          {stat.sublabel}
        </div>
      )}
    </motion.article>
  );
}

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat, i) => (
        <StatModule key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}
