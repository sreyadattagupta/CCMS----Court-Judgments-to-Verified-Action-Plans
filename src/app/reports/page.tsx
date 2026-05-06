'use client';

import { DEMO_ACTIONS, DEMO_DEPARTMENT_STATS } from '@/lib/demo-data';
import DepartmentTag from '@/components/shared/DepartmentTag';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfidenceDot from '@/components/shared/ConfidenceDot';
import TierBadge from '@/components/shared/TierBadge';
import Button from '@/components/shared/Button';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';

export default function ReportsPage() {
  const totalActions = DEMO_ACTIONS.length;
  const completed = DEMO_ACTIONS.filter((a) => a.status === 'completed').length;
  const overdue = DEMO_ACTIONS.filter((a) => a.status === 'overdue').length;
  const verified = DEMO_ACTIONS.filter((a) => ['verified', 'in_progress', 'assigned', 'completed'].includes(a.status)).length;

  const pieData = [
    { name: 'Completed', value: completed, color: '#2D6A4F' },
    { name: 'In Progress', value: DEMO_ACTIONS.filter(a => a.status === 'in_progress').length, color: '#7F77DD' },
    { name: 'Pending', value: DEMO_ACTIONS.filter(a => a.status === 'pending_verification').length, color: '#9CA3AF' },
    { name: 'Overdue', value: overdue, color: '#C1121F' },
    { name: 'Verified', value: DEMO_ACTIONS.filter(a => a.status === 'verified').length, color: '#185FA5' },
  ];

  const deptBarData = DEMO_DEPARTMENT_STATS.map((d) => ({
    name: d.department.split(' ')[0],
    compliance: d.compliance_pct,
    fill: d.color_hex,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-fg-mute)] mb-1">
            §05 · Almanac
          </div>
          <h1 className="headline-md text-[28px] flex items-center gap-3">
            <BarChart3 size={26} className="text-[var(--color-violet)]" />
            Compliance Reports
          </h1>
          <p className="text-[12px] text-[var(--color-fg-soft)] mt-2">
            Exportable compliance summaries across all judgments and departments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" iconLeft={<FileSpreadsheet size={13} />}>
            Export CSV
          </Button>
          <Button variant="primary" iconLeft={<FileText size={13} />}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total directives', value: totalActions, color: 'var(--color-fg)' },
          { label: '% Verified', value: `${Math.round((verified / totalActions) * 100)}%`, color: 'var(--color-azure)' },
          { label: '% Compliant', value: `${Math.round((completed / totalActions) * 100)}%`, color: 'var(--color-verdant)' },
          { label: 'Overdue', value: overdue, color: 'var(--color-vermilion)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card card-paper p-5 text-center">
            <div
              className="text-[34px] font-display font-semibold numerals-tab leading-none"
              style={{ color, fontVariationSettings: "'opsz' 96, 'WONK' 1, 'SOFT' 30" }}
            >
              {value}
            </div>
            <div className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.16em] mt-2">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="card card-paper p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
            §05.1
          </div>
          <h2 className="headline-md text-[18px] mb-4">Actions by status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="var(--color-ink)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => [`${v} directives`, '']}
                contentStyle={{
                  background: 'var(--color-ink-3)',
                  border: '1px solid var(--color-rule-strong)',
                  borderRadius: 3,
                  color: 'var(--color-fg)',
                  fontSize: 11,
                }}
              />
              <Legend
                formatter={(v: any) => (
                  <span className="text-[11px] font-mono text-[var(--color-fg-soft)] uppercase tracking-[0.08em]">
                    {v}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="card card-paper p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
            §05.2
          </div>
          <h2 className="headline-md text-[18px] mb-4">Compliance by department</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptBarData} barSize={26}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(242,235,216,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--color-fg-mute)', fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--color-fg-mute)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v: any) => [`${v}%`, 'Compliance']}
                contentStyle={{
                  background: 'var(--color-ink-3)',
                  border: '1px solid var(--color-rule-strong)',
                  borderRadius: 3,
                  color: 'var(--color-fg)',
                  fontSize: 11,
                }}
                cursor={{ fill: 'rgba(242,235,216,0.04)' }}
              />
              <Bar dataKey="compliance" radius={[3, 3, 0, 0]}>
                {deptBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action items table */}
      <div className="card card-paper overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-rule)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)]">
              §05.3
            </div>
            <h2 className="headline-md text-[18px]">All directives</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] hover:text-[var(--color-saffron)] transition-colors">
            <Download size={13} /> Download
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table" role="table" aria-label="Action items report">
            <thead>
              <tr>
                {['Case', 'Department', 'Directive', 'Deadline', 'Priority', 'Status', 'Tier', 'Confidence'].map((h) => (
                  <th key={h} className="whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_ACTIONS.map((a) => (
                <tr key={a.id}>
                  <td className="font-mono text-[11px] text-[var(--color-azure)] whitespace-nowrap">
                    {a.judgment?.case_number}
                  </td>
                  <td>
                    <DepartmentTag department={a.department} size="sm" />
                  </td>
                  <td className="max-w-xs truncate text-[var(--color-fg-soft)]" title={a.directive_text}>
                    {a.directive_text.slice(0, 60)}…
                  </td>
                  <td className="font-mono text-[11px] text-[var(--color-fg-soft)] whitespace-nowrap">
                    {a.deadline_iso ? new Date(a.deadline_iso).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: a.priority === 'high'
                          ? 'rgba(228,94,110,0.12)'
                          : a.priority === 'medium'
                            ? 'rgba(231,140,45,0.12)'
                            : 'rgba(146,140,127,0.10)',
                        color: a.priority === 'high'
                          ? '#F08593'
                          : a.priority === 'medium'
                            ? '#F0A04A'
                            : '#B7AE9D',
                        borderColor: a.priority === 'high'
                          ? 'rgba(228,94,110,0.3)'
                          : a.priority === 'medium'
                            ? 'rgba(231,140,45,0.3)'
                            : 'rgba(146,140,127,0.25)',
                      }}
                    >
                      {a.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={a.status} size="sm" showDot />
                  </td>
                  <td>
                    {a.tier ? <TierBadge tier={a.tier} /> : <span className="text-[var(--color-fg-fade)]">—</span>}
                  </td>
                  <td>
                    <ConfidenceDot
                      level={a.confidence_level ?? (a.confidence >= 0.85 ? 'high' : a.confidence >= 0.7 ? 'medium' : 'low')}
                      breakdown={a.confidence_breakdown}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
