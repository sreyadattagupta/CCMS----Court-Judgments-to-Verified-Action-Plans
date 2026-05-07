'use client';

import { useState } from 'react';
import { DEMO_ACTIONS } from '@/lib/demo-data';
import { formatDate, formatDateRelative } from '@/lib/utils';
import ActionCard from '@/components/actions/ActionCard';
import ActionTimeline from '@/components/actions/ActionTimeline';
import { Filter, LayoutList, Columns, ListChecks } from 'lucide-react';
import { ActionStatus } from '@/types/action';
import { cn } from '@/lib/utils';
import { SearchInput, Select, Chip } from '@/components/shared/Input';

const STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending_verification', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const DEPARTMENTS = [
  'all',
  'Environment',
  'Finance',
  'Health',
  'Infrastructure',
  'Education',
  'Home Affairs',
  'Water Resources',
  'Social Justice',
];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

export default function ActionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dept, setDept] = useState('all');
  const [priority, setPriority] = useState('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const filtered = DEMO_ACTIONS.filter((a) => {
    const matchSearch =
      !search ||
      a.directive_text.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || a.status === status;
    const matchDept = dept === 'all' || a.department === dept;
    const matchPriority = priority === 'all' || a.priority === priority;
    return matchSearch && matchStatus && matchDept && matchPriority;
  });

  const kanbanCols: { key: ActionStatus; label: string }[] = [
    { key: 'pending_verification', label: 'Pending' },
    { key: 'verified', label: 'Verified' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="space-y-8 animate-page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-fg-mute)] mb-1">
            §03 · Directives Register
          </div>
          <h1 className="headline-md text-[28px] flex items-center gap-3">
            <ListChecks size={26} className="text-[var(--color-saffron)]" />
            Action Directives
          </h1>
          <p className="text-[12px] font-mono text-[var(--color-fg-mute)] mt-1.5 uppercase tracking-[0.1em]">
            {filtered.length} of {DEMO_ACTIONS.length} listed
          </p>
        </div>
        {/* View toggle */}
        <div className="inline-flex items-center bg-[var(--color-ink-3)] border border-[var(--color-rule)] rounded-[3px] p-1">
          <button
            onClick={() => setView('list')}
            className={cn(
              'p-2 rounded-[2px] transition-colors',
              view === 'list'
                ? 'bg-[var(--color-saffron)] text-[var(--color-ink)]'
                : 'text-[var(--color-fg-mute)] hover:text-[var(--color-fg)]'
            )}
            aria-label="List view"
          >
            <LayoutList size={15} />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn(
              'p-2 rounded-[2px] transition-colors',
              view === 'kanban'
                ? 'bg-[var(--color-saffron)] text-[var(--color-ink)]'
                : 'text-[var(--color-fg-mute)] hover:text-[var(--color-fg)]'
            )}
            aria-label="Kanban view"
          >
            <Columns size={15} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <ActionTimeline actions={DEMO_ACTIONS} />

      {/* Filters */}
      <div className="card p-5">
        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput
            className="flex-1 min-w-[260px]"
            placeholder="Search directives, departments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            aria-label="Search actions"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            options={STATUSES}
          />
          <Select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            aria-label="Filter by department"
            options={DEPARTMENTS.map((d) => ({ value: d, label: d === 'all' ? 'All Depts' : d }))}
          />
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Filter by priority"
            options={PRIORITIES.map((p) => ({ value: p, label: p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1) }))}
          />
        </div>
        {/* Quick chips for common combos */}
        <div className="mt-3 pt-3 border-t border-[var(--color-rule)] flex flex-wrap gap-2">
          {[
            { label: 'Overdue', s: 'overdue' },
            { label: 'Pending review', s: 'pending_verification' },
            { label: 'In progress', s: 'in_progress' },
            { label: 'Completed', s: 'completed' },
          ].map((q) => (
            <Chip
              key={q.s}
              active={status === q.s}
              onClick={() => setStatus(status === q.s ? 'all' : q.s)}
            >
              {q.label}
            </Chip>
          ))}
          {(status !== 'all' || dept !== 'all' || priority !== 'all' || search) && (
            <Chip
              onClick={() => {
                setStatus('all');
                setDept('all');
                setPriority('all');
                setSearch('');
              }}
              className="ml-auto"
            >
              Clear all
            </Chip>
          )}
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          {filtered.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
          {filtered.length === 0 && (
            <div className="card p-16 text-center">
              <Filter size={36} className="mx-auto mb-3 text-[var(--color-fg-mute)] opacity-50" />
              <p className="font-display text-[16px] text-[var(--color-fg-soft)]">
                No directives match your filters
              </p>
              <p className="text-[10px] font-mono mt-1 text-[var(--color-fg-mute)] uppercase tracking-[0.14em]">
                Try clearing one of the chips above
              </p>
            </div>
          )}
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanCols.map((col) => {
            const colActions = filtered.filter((a) => a.status === col.key);
            return (
              <div key={col.key} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[11px] font-mono font-semibold text-[var(--color-fg-soft)] uppercase tracking-[0.12em]">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono bg-[var(--color-ink-3)] border border-[var(--color-rule)] text-[var(--color-fg-mute)] px-1.5 py-0.5 rounded-[2px]">
                    {colActions.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colActions.map((action) => (
                    <ActionCard key={action.id} action={action} compact />
                  ))}
                  {colActions.length === 0 && (
                    <div className="p-4 text-center text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-mute)] border border-dashed border-[var(--color-rule)] rounded-[3px]">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
