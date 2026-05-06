'use client';

// MastheadHero — the gazette nameplate. Treats the dashboard like the front
// page of a printed law journal: Volume / Issue stamp, edition date,
// hand-set serif headline with word-by-word reveal, animated balance-scales
// emblem, and a live pipeline ticker beneath.

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Activity, ArrowUpRight, Scale } from 'lucide-react';
import Link from 'next/link';
import { DEMO_ACTIONS, DEMO_JUDGMENTS } from '@/lib/demo-data';

interface Props {
  todayLabel: string;
  overdueCount: number;
  reviewCount: number;
  compliancePct: number;
}

const REVEAL = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function MastheadHero({
  todayLabel,
  overdueCount,
  reviewCount,
  compliancePct,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  // Volume/issue derived deterministically from today's date so it changes
  // daily but stays stable for a session — like a real periodical.
  const issueMeta = useMemo(() => {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (today.getTime() - yearStart.getTime()) / 86400000
    );
    const volume = today.getFullYear() - 2024; // since SAMIKSHA started
    const issue = String(dayOfYear).padStart(3, '0');
    return { volume, issue };
  }, []);

  // The ticker pulls real records from the dataset so it feels alive.
  const tickerItems = useMemo(() => {
    const recent = [...DEMO_ACTIONS]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 8);
    return recent.map((a) => ({
      id: a.id,
      tag: a.judgment?.case_number ?? 'KHC',
      text:
        a.status === 'completed'
          ? `Completed by ${a.assigned_to ?? a.department}`
          : a.status === 'overdue'
            ? `OVERDUE — ${a.department}`
            : `${a.department} · ${a.deadline_raw ?? 'pending'}`,
    }));
  }, []);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="dashboard-hero rounded-sm p-8 md:p-10 text-[var(--color-parchment)] relative"
    >
      <div className="hero-rule" />
      <div className="hero-grain" />

      {/* Top metadata strip — Volume · Issue · Date · Place */}
      <motion.div
        variants={REVEAL}
        className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-[#C9BFA4]/70 pb-5 border-b border-white/8"
      >
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          <span>Volume {issueMeta.volume}</span>
          <span aria-hidden="true">·</span>
          <span>Issue No. {issueMeta.issue}</span>
          <span aria-hidden="true">·</span>
          <span>Bengaluru &amp; Branches</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft"
              aria-hidden="true"
            />
            Pipeline live
          </span>
          <span aria-hidden="true">·</span>
          <span>{todayLabel}</span>
        </div>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 mt-7 items-start">
        {/* ── Left: nameplate + headline ─────────────────────────── */}
        <div className="min-w-0">
          <motion.div
            variants={REVEAL}
            className="flex items-baseline gap-3 text-[#F4A653] mb-4"
          >
            <span
              className="font-display text-[15px] tracking-[0.5em] uppercase"
              style={{ fontVariationSettings: "'opsz' 18, 'WONK' 1, 'SOFT' 50" }}
            >
              The Samiksha Gazette
            </span>
            <span className="h-px flex-1 bg-[#F4A653]/30" />
          </motion.div>

          <motion.h1
            variants={REVEAL}
            className="headline-xl text-[44px] md:text-[60px] lg:text-[68px] text-[var(--color-parchment)] mb-5"
          >
            Court orders, <em
              className="not-italic relative inline-block"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1",
              }}
            >
              made
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="10"
                viewBox="0 0 220 10"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 6 Q 60 1, 120 5 T 218 4"
                  stroke="#C9610A"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </em>{' '}
            <span className="text-[#C58319]">accountable</span>.
          </motion.h1>

          <motion.p
            variants={REVEAL}
            className="text-[15px] md:text-[16px] leading-[1.6] text-[#DCD2BC] max-w-xl drop-cap"
          >
            Every directive issued by the High Court of Karnataka, parsed by
            <span className="text-[#F4A653]"> InLegalBERT </span>
            and Claude Sonnet, then verified by a registrar before it touches
            the trusted dashboard. Source spans cited. Tier C deadlines
            human-confirmed. Audit trail signed.
          </motion.p>

          {/* Stat strip */}
          <motion.div
            variants={REVEAL}
            className="mt-7 grid grid-cols-3 gap-px bg-white/8 rounded-sm overflow-hidden border border-white/8"
          >
            {[
              {
                label: 'Awaiting review',
                value: reviewCount,
                tone: 'text-[#F4A653]',
              },
              {
                label: 'Overdue directives',
                value: overdueCount,
                tone: 'text-[#E67782]',
              },
              {
                label: 'Compliance rate',
                value: `${compliancePct}%`,
                tone: 'text-[#7BC9A1]',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#0F0F18]/80 px-5 py-4 flex flex-col gap-1"
              >
                <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-white/40">
                  {s.label}
                </span>
                <span
                  className={`headline-md text-[26px] md:text-[30px] numerals-tab ${s.tone}`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: animated emblem ────────────────────────────── */}
        <motion.div variants={REVEAL} className="relative">
          <Emblem inView={inView} />
          <div className="mt-5 text-center">
            <Link
              href="/judgments"
              className="inline-flex items-center gap-2 text-[#F4A653] hover:text-[#FFC07A] text-sm font-mono uppercase tracking-[0.18em] transition-colors group"
            >
              Today&apos;s docket
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Live pipeline ticker ────────────────────────────────── */}
      <motion.div
        variants={REVEAL}
        className="relative z-10 mt-9 -mx-8 md:-mx-10 -mb-8 md:-mb-10 overflow-hidden border-t border-white/10 bg-black/20 backdrop-blur-[2px]"
      >
        <div className="flex items-center text-[11px] font-mono">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#C9610A] text-[#14141C] font-bold uppercase tracking-[0.18em] flex-shrink-0">
            <Activity size={11} strokeWidth={3} />
            Pipeline
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-track py-2.5 whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((t, i) => (
                <span
                  key={`${t.id}-${i}`}
                  className="inline-flex items-center gap-2 text-white/70"
                >
                  <span className="text-[#F4A653] font-bold">{t.tag}</span>
                  <span className="text-white/30">·</span>
                  <span>{t.text}</span>
                  <span className="text-white/15 mx-2">◇</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

// ── Emblem: balance scales + dharmachakra wheel, animated ─────────────
function Emblem({ inView }: { inView: boolean }) {
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto">
      {/* Outer ring */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full animate-spin-slow"
        aria-hidden="true"
      >
        <defs>
          <path
            id="emblemRing"
            d="M 100, 100 m -84, 0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
          />
        </defs>
        <text
          fill="#F4A653"
          fontFamily="JetBrains Mono"
          fontSize="8.5"
          letterSpacing="3"
          opacity="0.55"
        >
          <textPath href="#emblemRing" startOffset="0">
            ·  HIGH  COURT  OF  KARNATAKA  ·  CCMS  ·  SAMIKSHA  ·  ESTD  2024  ·  HIGH  COURT  OF  KARNATAKA  ·  CCMS  ·  SAMIKSHA  ·
          </textPath>
        </text>
      </svg>

      {/* Inner emblem */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Decorative outer dotted ring */}
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="rgba(244,166,83,0.18)"
          strokeWidth="0.6"
          strokeDasharray="1 4"
        />

        {/* Dharmachakra wheel */}
        <g transform="translate(100, 100)">
          <motion.circle
            r="44"
            fill="none"
            stroke="#F4A653"
            strokeWidth="1.4"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            pathLength={1}
          />
          <motion.circle
            r="38"
            fill="none"
            stroke="#F4A653"
            strokeWidth="0.7"
            opacity="0.4"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            pathLength={1}
          />
          {/* 24 spokes — spinning slowly */}
          <g className="origin-center">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.line
                key={i}
                x1="0"
                y1="-44"
                x2="0"
                y2="-12"
                stroke="#F4A653"
                strokeWidth="0.85"
                opacity="0.65"
                transform={`rotate(${i * 15})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 0.65 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.8 + i * 0.025,
                  ease: 'easeOut',
                }}
              />
            ))}
          </g>

          {/* Hub */}
          <circle r="6" fill="#C9610A" />
          <circle r="3" fill="#14141C" />
        </g>

        {/* Balance scales */}
        <motion.g
          transform="translate(100, 100)"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Pivot */}
          <line x1="0" y1="-58" x2="0" y2="-30" stroke="#F4EEDF" strokeWidth="1.4" />
          <motion.g
            initial={{ rotate: -8 }}
            animate={inView ? { rotate: [- 8, 6, -3, 2, 0] } : {}}
            transition={{ duration: 2.2, delay: 1.4, ease: [0.45, 0, 0.55, 1] }}
            style={{ transformOrigin: '0px -58px' }}
          >
            {/* Beam */}
            <line x1="-32" y1="-58" x2="32" y2="-58" stroke="#F4EEDF" strokeWidth="1.6" strokeLinecap="round" />
            {/* Left pan */}
            <line x1="-32" y1="-58" x2="-32" y2="-44" stroke="#F4EEDF" strokeWidth="0.8" />
            <path d="M -42 -44 Q -32 -36, -22 -44 L -32 -44 Z" fill="none" stroke="#F4EEDF" strokeWidth="1.2" />
            {/* Right pan */}
            <line x1="32" y1="-58" x2="32" y2="-44" stroke="#F4EEDF" strokeWidth="0.8" />
            <path d="M 22 -44 Q 32 -36, 42 -44 L 32 -44 Z" fill="none" stroke="#F4EEDF" strokeWidth="1.2" />
          </motion.g>
        </motion.g>
      </svg>

      {/* Center serial number stamp */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-[9px] font-mono tracking-[0.4em] text-[#F4A653]/70 mt-[58%] uppercase">
          ssj/khc
        </div>
        <div className="text-[10px] font-mono tracking-widest text-white/30 mt-1">
          2026
        </div>
      </div>
    </div>
  );
}
