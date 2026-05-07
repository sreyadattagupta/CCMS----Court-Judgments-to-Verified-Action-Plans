'use client';

import { motion } from 'framer-motion';
import StatsBar from '@/components/dashboard/StatsBar';
import ComplianceRing from '@/components/dashboard/ComplianceRing';
import MastheadHero from '@/components/dashboard/MastheadHero';
import DirectiveFlow from '@/components/dashboard/DirectiveFlow';
import DeadlineHeatmap from '@/components/dashboard/DeadlineHeatmap';
import ActionCard from '@/components/actions/ActionCard';
import DepartmentTag from '@/components/shared/DepartmentTag';
import {
  DEMO_ACTIONS,
  DEMO_JUDGMENTS,
  DEMO_DEPARTMENT_STATS,
} from '@/lib/demo-data';
import { formatDate, EASE_PAPER } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Quote,
} from 'lucide-react';

export default function DashboardPage() {
  const overdueActions = DEMO_ACTIONS.filter((a) => a.status === 'overdue');
  const reviewActions = DEMO_ACTIONS.filter(
    (a) => a.status === 'pending_verification'
  );
  const recentActions = [...DEMO_ACTIONS]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 4);
  const totalCompleted = DEMO_ACTIONS.filter(
    (a) => a.status === 'completed'
  ).length;
  const overallCompliance = Math.round(
    (totalCompleted / DEMO_ACTIONS.length) * 100
  );

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Pull a directive that flagged "requires legal opinion" so we can feature
  // it as the editorial pull-quote on the page.
  const featuredDirective =
    DEMO_ACTIONS.find((a) => a.requires_legal_opinion) ?? DEMO_ACTIONS[0];

  return (
    <div className="space-y-14 px-1 md:px-3 py-2 animate-page-enter">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <MastheadHero
        todayLabel={dateStr}
        overdueCount={overdueActions.length}
        reviewCount={reviewActions.length}
        compliancePct={overallCompliance}
      />

      {/* ── Section §02 · Stats ─────────────────────────────────── */}
      <Section number="§02" title="The Edition's Numbers">
        <StatsBar />
      </Section>

      {/* ── Section §03 · Directive Flow ──────────────────────── */}
      <DirectiveFlow />

      {/* ── Section §04 · Deadline Heatmap ──────────────────────── */}
      <DeadlineHeatmap />

      {/* ── Section §05 · Department Compliance ─────────────────── */}
      <Section number="§05" title="Department Compliance" rightSlot={
        <Link
          href="/departments"
          className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-saffron)] hover:text-[var(--color-saffron-deep)] inline-flex items-center gap-1 transition-colors"
        >
          All bureaus <ArrowRight size={11} />
        </Link>
      }>
        <div className="card card-paper p-9 md:p-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 stagger">
            {DEMO_DEPARTMENT_STATS.map((dept, i) => (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: EASE_PAPER }}
              >
                <Link
                  href={`/departments/${encodeURIComponent(dept.department)}`}
                  className="dept-ring-card flex flex-col items-center gap-6 px-6 py-7 rounded-md cursor-pointer group border border-transparent transition-all duration-200 hover:bg-[rgba(242,235,216,0.03)] hover:border-[var(--color-rule)]"
                >
                  <ComplianceRing
                    percentage={dept.compliance_pct}
                    size={86}
                    strokeWidth={6}
                    color={dept.color_hex}
                    sublabel="DONE"
                  />
                  <div className="text-center w-full space-y-2">
                    <DepartmentTag department={dept.department} size="sm" />
                    <div className="text-[10px] text-[var(--color-ink-mute)] font-mono">
                      {dept.completed}/{dept.total} complete
                    </div>
                    {dept.overdue > 0 ? (
                      <div className="text-[10px] text-[var(--color-vermilion)] font-mono font-semibold flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <AlertTriangle size={9} />
                        {dept.overdue} overdue
                      </div>
                    ) : (
                      <div className="text-[10px] text-[var(--color-verdant)] font-mono font-semibold flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 size={9} />
                        On track
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Section §06 · Editorial split (pull-quote + sidebar) ─ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT — featured pull-quote + recent actions */}
        <div className="xl:col-span-2 space-y-8">
          {featuredDirective && (
            <motion.figure
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: EASE_PAPER }}
              className="card card-paper p-8 md:p-10 relative"
            >
              <Quote
                size={40}
                className="absolute top-7 left-7 text-[var(--color-saffron)] opacity-25"
              />
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-mute)] mb-6 ml-16">
                §06 · From the day&apos;s rulings
              </div>
              <blockquote
                className="font-display text-[22px] md:text-[26px] leading-[1.45] text-[var(--color-fg)] ml-16"
                style={{
                  fontVariationSettings: "'opsz' 96, 'WONK' 1, 'SOFT' 50",
                  fontWeight: 460,
                }}
              >
                &ldquo;{featuredDirective.directive_text}&rdquo;
              </blockquote>
              <figcaption className="mt-7 ml-16 flex items-center gap-3 text-[12px] text-[var(--color-ink-mute)] font-mono">
                <span>—</span>
                <Link
                  href={`/judgments/${featuredDirective.judgment_id}`}
                  className="text-[var(--color-azure)] hover:text-[var(--color-saffron)] transition-colors font-semibold"
                >
                  {featuredDirective.judgment?.case_number}
                </Link>
                <span>·</span>
                <span>{featuredDirective.judgment?.court}</span>
                {featuredDirective.requires_legal_opinion && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[var(--color-saffron-deep)] font-semibold">
                    <AlertTriangle size={11} />
                    Legal opinion sought
                  </span>
                )}
              </figcaption>
            </motion.figure>
          )}

          <Section number="§07" title="Recently filed directives">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentActions.map((action) => (
                <ActionCard key={action.id} action={action} compact />
              ))}
            </div>
          </Section>
        </div>

        {/* RIGHT — overdue stack + recent judgments */}
        <div className="space-y-8">
          {overdueActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: EASE_PAPER }}
              className="card card-paper p-7 border-[var(--color-vermilion)]/40 bg-[#FBE7E9]/40"
            >
              <h3 className="font-display font-semibold text-[var(--color-vermilion)] text-[15px] mb-5 flex items-center gap-2.5 uppercase tracking-[0.08em]">
                <Clock size={14} />
                Overdue Notice
                <span className="ml-auto text-[10px] font-mono bg-[var(--color-vermilion)]/15 text-[var(--color-vermilion)] px-2 py-1 rounded-md">
                  {overdueActions.length}
                </span>
              </h3>
              <div className="space-y-3">
                {overdueActions.slice(0, 3).map((action) => (
                  <ActionCard key={action.id} action={action} compact />
                ))}
              </div>
              {overdueActions.length > 3 && (
                <Link
                  href="/actions?status=overdue"
                  className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[var(--color-vermilion)] hover:text-[var(--color-fg)] uppercase tracking-[0.12em] pt-4 border-t border-[var(--color-vermilion)]/20 transition-colors"
                >
                  All overdue <ArrowRight size={11} />
                </Link>
              )}
            </motion.div>
          )}

          {/* Recent judgments — newspaper-list style */}
          <div className="card card-paper p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
                  §08
                </div>
                <h3 className="font-display font-semibold text-[var(--color-fg)] text-[16px]">
                  Today&apos;s Docket
                </h3>
              </div>
              <Link
                href="/judgments"
                className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-saffron)] hover:text-[var(--color-saffron-deep)] inline-flex items-center gap-1.5 transition-colors"
              >
                All <ArrowRight size={10} />
              </Link>
            </div>
            <div className="divide-y divide-[var(--color-divider)]">
              {DEMO_JUDGMENTS.slice(0, 5).map((j) => {
                const compliancePct = j.action_count
                  ? Math.round(((j.completed_count || 0) / j.action_count) * 100)
                  : 0;
                return (
                  <Link
                    key={j.id}
                    href={`/judgments/${j.id}`}
                    className="block py-4 group"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <span className="text-[10px] font-mono font-semibold text-[var(--color-azure)] tracking-wide">
                        {j.case_number}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-ink-mute)]">
                        {formatDate(j.date_of_judgment)}
                      </span>
                    </div>
                    <div
                      className="font-display text-[13px] leading-relaxed text-[var(--color-fg)] line-clamp-2 group-hover:text-[var(--color-saffron-deep)] transition-colors"
                      style={{ fontVariationSettings: "'opsz' 36, 'WONK' 0", fontWeight: 480 }}
                    >
                      {j.case_title}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1 bg-[var(--color-ink-3)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full"
                          style={{
                            background:
                              compliancePct >= 70
                                ? 'var(--color-verdant)'
                                : compliancePct >= 40
                                  ? 'var(--color-saffron)'
                                  : 'var(--color-vermilion)',
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${compliancePct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2, ease: EASE_PAPER }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-mono font-semibold tabular-nums w-9 text-right"
                        style={{
                          color:
                            compliancePct >= 70
                              ? 'var(--color-verdant)'
                              : compliancePct >= 40
                                ? 'var(--color-saffron-deep)'
                                : 'var(--color-vermilion)',
                        }}
                      >
                        {compliancePct}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Colophon */}
          <div
            className="card px-6 py-8 text-center relative overflow-hidden space-y-2"
            style={{
              background:
                'radial-gradient(ellipse at top, rgba(231,140,45,0.12) 0%, transparent 60%), var(--color-ink)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-4 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(231,140,45,0.5), transparent)',
              }}
            />
            <div
              className="text-[15px] font-display text-[var(--color-fg)] pt-2"
              style={{ fontVariationSettings: "'opsz' 36, 'WONK' 1, 'SOFT' 50", fontWeight: 580 }}
            >
              Hand-set in Bengaluru
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-saffron)] mt-2">
              Karnataka State Data Centre · MMXXVI
            </div>
            <div className="text-[9px] font-mono text-[var(--color-fg-mute)] mt-1.5">
              {today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  number: string;
  title: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ number, title, rightSlot, children }: SectionProps) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ink-mute)]">
            {number}
          </div>
          <h2
            className="font-display text-[22px] text-[var(--color-fg)] leading-tight"
            style={{
              fontVariationSettings: "'opsz' 36, 'WONK' 1, 'SOFT' 50",
              fontWeight: 580,
              letterSpacing: '-0.012em',
            }}
          >
            {title}
          </h2>
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}
