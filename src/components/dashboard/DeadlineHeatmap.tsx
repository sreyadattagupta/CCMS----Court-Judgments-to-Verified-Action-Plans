'use client';

// DeadlineHeatmap — a year-long calendar grid plotting every directive
// deadline. Colour intensity scales with urgency (overdue > 7d > 30d > later)
// and density (more directives in a single day = darker). Hover any cell
// to see the directives due that day.

import { useMemo, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { DEMO_ACTIONS } from '@/lib/demo-data';
import { EASE_PAPER } from '@/lib/utils';

const TODAY = new Date('2026-05-07');
const WEEKS_BACK = 8;
const WEEKS_FORWARD = 36;

interface DayCell {
  date: Date;
  iso: string;
  count: number;
  overdue: number;
  cases: { caseNumber: string; directive: string }[];
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());
  return out;
}

function buildGrid(): { weeks: DayCell[][]; monthLabels: { weekIdx: number; label: string }[] } {
  const start = startOfWeek(new Date(TODAY.getTime() - WEEKS_BACK * 7 * 86400000));
  const totalWeeks = WEEKS_BACK + WEEKS_FORWARD + 1;

  // Bucket directives by ISO date.
  const byDate = new Map<string, DayCell>();
  for (const a of DEMO_ACTIONS) {
    if (!a.deadline_iso) continue;
    const iso = a.deadline_iso.slice(0, 10);
    const cur = byDate.get(iso);
    const isOverdue = new Date(iso) < TODAY && a.status !== 'completed';
    const entry = cur ?? {
      date: new Date(iso),
      iso,
      count: 0,
      overdue: 0,
      cases: [],
    };
    entry.count += 1;
    if (isOverdue) entry.overdue += 1;
    entry.cases.push({
      caseNumber: a.judgment?.case_number ?? a.judgment_id,
      directive: a.directive_text.slice(0, 80),
    });
    byDate.set(iso, entry);
  }

  const weeks: DayCell[][] = [];
  const monthLabels: { weekIdx: number; label: string }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < totalWeeks; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * 86400000);
      const iso = date.toISOString().slice(0, 10);
      const existing = byDate.get(iso);
      week.push(
        existing ?? {
          date,
          iso,
          count: 0,
          overdue: 0,
          cases: [],
        }
      );
      if (d === 0 && date.getMonth() !== lastMonth) {
        monthLabels.push({
          weekIdx: w,
          label: date.toLocaleDateString('en-IN', { month: 'short' }),
        });
        lastMonth = date.getMonth();
      }
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

function cellColour(cell: DayCell): string {
  if (cell.count === 0) return 'transparent';
  if (cell.overdue > 0) return cell.overdue > 1 ? '#871318' : '#B0161F';
  const days = Math.round((cell.date.getTime() - TODAY.getTime()) / 86400000);
  if (days < 0) return '#3A2D29'; // Already past, but completed → dark ink
  if (days <= 7) return '#C58319';
  if (days <= 30) return '#E0A45C';
  if (days <= 90) return '#9CB89D';
  return '#1F5E45';
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DeadlineHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [hover, setHover] = useState<DayCell | null>(null);

  const { weeks, monthLabels } = useMemo(buildGrid, []);

  const todayIso = TODAY.toISOString().slice(0, 10);

  // Bucket totals for the legend strip
  const totals = useMemo(() => {
    let overdue = 0,
      next7 = 0,
      next30 = 0,
      later = 0;
    for (const w of weeks) {
      for (const c of w) {
        if (c.count === 0) continue;
        if (c.overdue > 0) overdue += c.count;
        else {
          const days = Math.round((c.date.getTime() - TODAY.getTime()) / 86400000);
          if (days >= 0 && days <= 7) next7 += c.count;
          else if (days <= 30) next30 += c.count;
          else if (days > 30) later += c.count;
        }
      }
    }
    return { overdue, next7, next30, later };
  }, [weeks]);

  return (
    <section ref={ref} className="card card-paper p-6 relative">
      <header className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-mute)] mb-1">
            §04 · Deadline Almanac
          </div>
          <h2 className="headline-md text-[24px] text-[var(--color-ink)]">
            When the calendar comes due
          </h2>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--color-ink-mute)]">
          <Legend swatch="#871318" label={`overdue · ${totals.overdue}`} />
          <Legend swatch="#C58319" label={`≤ 7d · ${totals.next7}`} />
          <Legend swatch="#E0A45C" label={`≤ 30d · ${totals.next30}`} />
          <Legend swatch="#1F5E45" label={`later · ${totals.later}`} />
        </div>
      </header>

      <div className="relative">
        {/* Month labels row */}
        <div
          className="grid mb-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-mute)]"
          style={{ gridTemplateColumns: `28px repeat(${weeks.length}, 14px)`, columnGap: '2px' }}
        >
          <span />
          {weeks.map((_, i) => {
            const m = monthLabels.find((ml) => ml.weekIdx === i);
            return (
              <span key={i} style={{ gridColumn: i + 2 }}>
                {m?.label ?? ''}
              </span>
            );
          })}
        </div>

        <div className="flex items-start gap-2">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[2px] text-[9px] font-mono text-[var(--color-ink-mute)] mt-px">
            {DAY_LABELS.map((d, i) => (
              <span key={d} className="h-[12px] leading-[12px]">
                {i % 2 === 1 ? d : ''}
              </span>
            ))}
          </div>

          {/* Cells */}
          <div className="overflow-x-auto flex-1">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${weeks.length}, 12px)`,
                gridTemplateRows: 'repeat(7, 12px)',
                columnGap: '2px',
                rowGap: '2px',
                gridAutoFlow: 'column',
              }}
            >
              {weeks.flatMap((w, wIdx) =>
                w.map((cell, dIdx) => {
                  const isToday = cell.iso === todayIso;
                  const colour = cellColour(cell);
                  const hasData = cell.count > 0;
                  return (
                    <motion.div
                      key={`${wIdx}-${dIdx}`}
                      className="relative"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.45,
                        delay: 0.005 * (wIdx * 7 + dIdx),
                        ease: EASE_PAPER,
                      }}
                      onMouseEnter={() => hasData && setHover(cell)}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: hasData ? 'pointer' : 'default' }}
                    >
                      <div
                        className="w-3 h-3 rounded-[1.5px] transition-transform duration-200"
                        style={{
                          background:
                            colour === 'transparent'
                              ? 'rgba(31,26,24,0.06)'
                              : colour,
                          outline: isToday
                            ? '1.5px solid #C9610A'
                            : 'none',
                          outlineOffset: '1px',
                          boxShadow: hasData ? '0 1px 0 rgba(20,20,28,0.06)' : 'none',
                          transform: hover?.iso === cell.iso ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                      {/* Burst marker on overdue cells */}
                      {cell.overdue > 0 && (
                        <span
                          className="absolute inset-0 rounded-[1.5px] animate-pulse-soft pointer-events-none"
                          style={{ boxShadow: '0 0 0 1.5px rgba(176,22,31,0.35)' }}
                          aria-hidden="true"
                        />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Hover detail */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute right-0 top-full mt-3 max-w-md w-full md:w-auto p-4 bg-[var(--color-ink)] text-[var(--color-parchment)] rounded-sm shadow-lg z-10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#F4A653]">
                  {hover.date.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  {hover.count} due · {hover.overdue} overdue
                </span>
              </div>
              <ul className="space-y-1.5">
                {hover.cases.slice(0, 4).map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[12px] leading-snug"
                  >
                    <span className="font-mono text-[#F4A653] flex-shrink-0">
                      {c.caseNumber}
                    </span>
                    <span className="text-white/70 line-clamp-1">
                      {c.directive}…
                    </span>
                  </li>
                ))}
                {hover.cases.length > 4 && (
                  <li className="text-[11px] text-white/40 font-mono">
                    + {hover.cases.length - 4} more
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-[1.5px]"
        style={{ background: swatch }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
