'use client';

import { DEMO_DEPARTMENT_STATS } from '@/lib/demo-data';
import ComplianceRing from '@/components/dashboard/ComplianceRing';
import DepartmentTag from '@/components/shared/DepartmentTag';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import Link from 'next/link';
import { Building2, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { EASE_PAPER } from '@/lib/utils';

export default function DepartmentsPage() {
  return (
    <div className="space-y-6 animate-page-enter">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-fg-mute)] mb-1">
          §04 · Bureaus
        </div>
        <h1 className="headline-md text-[28px] flex items-center gap-3">
          <Building2 size={26} className="text-[var(--color-azure)]" />
          Departments
        </h1>
        <p className="text-[12px] text-[var(--color-fg-soft)] mt-2 max-w-2xl">
          Compliance overview for every Karnataka department carrying
          court-mandated directives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DEMO_DEPARTMENT_STATS.map((dept, i) => {
          const sparkData = (dept.sparkline || []).map((v, i) => ({ i, v }));
          return (
            <motion.div
              key={dept.department}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: EASE_PAPER }}
            >
              <Link
                href={`/departments/${encodeURIComponent(dept.department)}`}
                className="card card-paper p-5 action-card-hover block group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 gap-2">
                  <DepartmentTag department={dept.department} />
                  {dept.overdue > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-[2px]"
                      style={{
                        color: '#F08593',
                        background: 'rgba(228,94,110,0.1)',
                        border: '1px solid rgba(228,94,110,0.32)',
                      }}
                    >
                      <AlertTriangle size={10} />
                      {dept.overdue} overdue
                    </span>
                  )}
                </div>

                {/* Ring + stats */}
                <div className="flex items-center gap-5 mb-4">
                  <ComplianceRing
                    percentage={dept.compliance_pct}
                    size={84}
                    strokeWidth={6}
                    color={dept.color_hex}
                  />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] flex-1">
                    {[
                      { label: 'Total', value: dept.total, color: 'var(--color-fg)' },
                      { label: 'Completed', value: dept.completed, color: 'var(--color-verdant)' },
                      { label: 'In progress', value: dept.in_progress, color: '#BBA9EC' },
                      { label: 'Pending', value: dept.pending, color: 'var(--color-fg-mute)' },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-mute)]">
                          {s.label}
                        </div>
                        <div
                          className="font-display font-semibold text-[18px] numerals-tab"
                          style={{
                            color: s.color,
                            fontVariationSettings: "'opsz' 36, 'WONK' 1",
                          }}
                        >
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sparkline */}
                {sparkData.length > 0 && (
                  <div className="h-12 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={dept.color_hex}
                          strokeWidth={1.6}
                          dot={false}
                        />
                        <Tooltip
                          formatter={(v: any) => [`${v}%`, 'Compliance']}
                          contentStyle={{
                            fontSize: 11,
                            background: 'var(--color-ink-3)',
                            border: '1px solid var(--color-rule-strong)',
                            borderRadius: 3,
                            color: 'var(--color-fg)',
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-rule)]">
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)]">
                    30-day trend
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-saffron)] flex items-center gap-1 group-hover:text-[var(--color-fg)] transition-colors">
                    View directives <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
