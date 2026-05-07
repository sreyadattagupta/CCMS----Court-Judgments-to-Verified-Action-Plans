'use client';

import { DEMO_ACTIONS, DEMO_DEPARTMENT_STATS } from '@/lib/demo-data';
import ComplianceRing from '@/components/dashboard/ComplianceRing';
import DepartmentTag from '@/components/shared/DepartmentTag';
import ActionCard from '@/components/actions/ActionCard';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function DeptDetailPage(props: PageProps<'/departments/[dept]'>) {
  const params = use(props.params);
  const deptName = decodeURIComponent(params.dept);
  const stats = DEMO_DEPARTMENT_STATS.find((d) => d.department === deptName);
  const actions = DEMO_ACTIONS.filter((a) => a.department === deptName);

  return (
    <div className="space-y-8 animate-page-enter">
      <Link
        href="/departments"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] hover:text-[var(--color-saffron)] transition-colors"
      >
        <ChevronLeft size={14} /> Back to bureaus
      </Link>

      <div className="flex items-start gap-6 flex-wrap">
        <div className="flex-1">
          <DepartmentTag department={deptName} size="md" />
          <h1
            className="headline-md text-[32px] mt-3"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 50", fontWeight: 580 }}
          >
            {deptName}
          </h1>
          <p className="text-[12px] text-[var(--color-fg-soft)] mt-2 font-mono uppercase tracking-[0.1em]">
            {actions.length} court-mandated directives
          </p>
        </div>
        {stats && (
          <ComplianceRing
            percentage={stats.compliance_pct}
            size={108}
            color={stats.color_hex}
            sublabel="COMPLIANT"
          />
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'var(--color-fg)' },
            { label: 'Completed', value: stats.completed, color: 'var(--color-verdant)' },
            { label: 'In progress', value: stats.in_progress, color: '#BBA9EC' },
            { label: 'Overdue', value: stats.overdue, color: 'var(--color-vermilion)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card card-paper p-4 text-center">
              <div
                className="text-[28px] font-display font-semibold numerals-tab leading-none"
                style={{ color, fontVariationSettings: "'opsz' 96, 'WONK' 1" }}
              >
                {value}
              </div>
              <div className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.16em] mt-2">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
              §02 · Directives
            </div>
            <h2 className="headline-md text-[20px]">Action items for this bureau</h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)]">
            {actions.length} listed
          </span>
        </div>
        <div className="space-y-3">
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
          {actions.length === 0 && (
            <div className="card p-12 text-center">
              <p className="font-display text-[14px] text-[var(--color-fg-soft)]">
                No directives currently allocated to this bureau.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
