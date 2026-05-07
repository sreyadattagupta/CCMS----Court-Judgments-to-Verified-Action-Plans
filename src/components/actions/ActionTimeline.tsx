'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ActionItem } from '@/types/action';
import { formatDate } from '@/lib/utils';
import { DEPARTMENT_COLORS } from '@/types/department';

interface ActionTimelineProps {
  actions: ActionItem[];
  onActionClick?: (action: ActionItem) => void;
}

export default function ActionTimeline({ actions, onActionClick }: ActionTimelineProps) {
  const withDeadlines = actions
    .filter((a) => a.deadline_iso)
    .sort((a, b) => new Date(a.deadline_iso!).getTime() - new Date(b.deadline_iso!).getTime())
    .slice(0, 15)
    .map((a) => ({
      ...a,
      label: a.department.slice(0, 10),
      date: formatDate(a.deadline_iso),
      daysLeft: Math.ceil(
        (new Date(a.deadline_iso!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      color: DEPARTMENT_COLORS[a.department] || '#6B7280',
    }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof withDeadlines[0] }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div
        className="p-3 text-[11px] max-w-xs rounded-[3px] shadow-2xl"
        style={{
          background: 'var(--color-ink-3)',
          border: '1px solid var(--color-rule-strong)',
          color: 'var(--color-fg)',
        }}
      >
        <div className="font-display text-[13px] mb-1 line-clamp-2"
             style={{ fontVariationSettings: "'opsz' 36", fontWeight: 540 }}>
          {d.directive_text}
        </div>
        <div className="text-[var(--color-fg-mute)] font-mono">
          Deadline: <span className="text-[var(--color-fg-soft)]">{d.date}</span>
        </div>
        <div className="text-[var(--color-fg-mute)] font-mono">
          Dept: <span style={{ color: d.color }}>{d.department}</span>
        </div>
        <div
          className="font-mono font-semibold mt-1"
          style={{
            color:
              d.daysLeft < 0 ? '#F08593' : d.daysLeft <= 7 ? '#F0A04A' : '#5DBC95',
          }}
        >
          {d.daysLeft < 0 ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d remaining`}
        </div>
      </div>
    );
  };

  return (
    <div className="card card-paper p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
            Deadline horizon
          </div>
          <h3 className="headline-md text-[16px]">Directives by days remaining</h3>
        </div>
        <span className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.14em]">
          {withDeadlines.length} items
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={withDeadlines} layout="vertical" barSize={9}
          onClick={(data: any) => {
            if (data?.activePayload?.[0] && onActionClick) {
              onActionClick(data.activePayload[0].payload as ActionItem);
            }
          }}
        >
          <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="rgba(242,235,216,0.06)" />
          <XAxis
            type="number"
            dataKey="daysLeft"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--color-fg-mute)' }}
            tickFormatter={(v) => `${v}d`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--color-fg-soft)' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(242,235,216,0.04)' }} />
          <Bar dataKey="daysLeft" radius={[0, 3, 3, 0]}>
            {withDeadlines.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.daysLeft < 0 ? '#E45E6E' : entry.daysLeft <= 7 ? '#F0A04A' : entry.color}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
