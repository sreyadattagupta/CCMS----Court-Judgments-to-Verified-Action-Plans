'use client';

// DirectiveFlow — a Sankey-style diagram tracing every directive from its
// judgment cause through the responsible department to its current status.
// Drawn as flowing ink ribbons so it reads like an editorial infographic
// rather than a SaaS chart. Hover-isolates a single ribbon.

import { useMemo, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { DEMO_ACTIONS } from '@/lib/demo-data';
import { DEPARTMENT_COLORS } from '@/types/department';
import { EASE_PAPER } from '@/lib/utils';

const W = 880;
const H = 320;
const PAD_X = 130;
const NODE_W = 8;

const STATUS_LABEL: Record<string, string> = {
  completed: 'Complete',
  in_progress: 'In progress',
  verified: 'Verified',
  assigned: 'Assigned',
  pending_verification: 'Pending review',
  overdue: 'Overdue',
  rejected: 'Rejected',
};
const STATUS_TONE: Record<string, string> = {
  completed: '#1F5E45',
  verified: '#1E3A8A',
  in_progress: '#5E5BB5',
  assigned: '#5E5BB5',
  pending_verification: '#C58319',
  overdue: '#B0161F',
  rejected: '#5A5564',
};

interface Ribbon {
  id: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  value: number;
  deptColor: string;
  statusKey: string;
  caseNumber: string;
}

export default function DirectiveFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [hoverDept, setHoverDept] = useState<string | null>(null);
  const [hoverStatus, setHoverStatus] = useState<string | null>(null);

  const { deptNodes, statusNodes, ribbons, totals } = useMemo(() => {
    // Aggregate dept totals and per-(dept, status) counts.
    const deptTotals = new Map<string, number>();
    const statusTotals = new Map<string, number>();
    const cells = new Map<string, { dept: string; status: string; count: number }>();

    for (const a of DEMO_ACTIONS) {
      deptTotals.set(a.department, (deptTotals.get(a.department) ?? 0) + 1);
      statusTotals.set(a.status, (statusTotals.get(a.status) ?? 0) + 1);
      const k = `${a.department}::${a.status}`;
      const cur = cells.get(k);
      if (cur) cur.count += 1;
      else cells.set(k, { dept: a.department, status: a.status, count: 1 });
    }

    const totalActions = DEMO_ACTIONS.length;

    // Sort dept by volume descending; status in canonical order.
    const deptList = [...deptTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const STATUS_ORDER = [
      'completed',
      'verified',
      'in_progress',
      'assigned',
      'pending_verification',
      'overdue',
      'rejected',
    ];
    const statusList = STATUS_ORDER
      .filter((s) => statusTotals.has(s))
      .map((name) => ({ name, count: statusTotals.get(name)! }));

    // Lay nodes out vertically — height proportional to count, with thin gaps.
    const GAP = 6;
    function layout(items: { name: string; count: number }[], x: number) {
      const totalGap = (items.length - 1) * GAP;
      const usable = H - 30 - totalGap;
      let y = 15;
      const out = items.map((it) => {
        const h = (it.count / totalActions) * usable;
        const node = { ...it, x, y, h };
        y += h + GAP;
        return node;
      });
      return out;
    }

    const deptNodes = layout(deptList, PAD_X - NODE_W);
    const statusNodes = layout(statusList, W - PAD_X);

    // Build ribbons. Each cell becomes a flowing ribbon between dept and
    // status, with thickness proportional to the cell count.
    const ribbons: Ribbon[] = [];
    // Track running offset within each node so multiple ribbons stack.
    const deptOff = new Map<string, number>();
    const statOff = new Map<string, number>();
    deptNodes.forEach((n) => deptOff.set(n.name, 0));
    statusNodes.forEach((n) => statOff.set(n.name, 0));

    // Iterate cells in canonical status order so ribbon stacking is stable.
    const cellList = [...cells.values()].sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );

    for (const cell of cellList) {
      const dn = deptNodes.find((n) => n.name === cell.dept)!;
      const sn = statusNodes.find((n) => n.name === cell.status)!;
      const thickness = (cell.count / totalActions) * (H - 30 - 6 * Math.max(deptNodes.length, statusNodes.length));
      const dOff = deptOff.get(cell.dept) ?? 0;
      const sOff = statOff.get(cell.status) ?? 0;
      const sourceY = dn.y + dOff + thickness / 2;
      const targetY = sn.y + sOff + thickness / 2;
      ribbons.push({
        id: `${cell.dept}-${cell.status}`,
        source: { x: dn.x + NODE_W, y: sourceY },
        target: { x: sn.x, y: targetY },
        value: thickness,
        deptColor: DEPARTMENT_COLORS[cell.dept] ?? '#6B7886',
        statusKey: cell.status,
        caseNumber: `${cell.count}× ${cell.dept} → ${STATUS_LABEL[cell.status] ?? cell.status}`,
      });
      deptOff.set(cell.dept, dOff + thickness);
      statOff.set(cell.status, sOff + thickness);
    }

    return { deptNodes, statusNodes, ribbons, totals: { actions: totalActions } };
  }, []);

  return (
    <section ref={ref} className="card card-paper p-6 relative">
      <header className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-mute)] mb-1">
            §03 · The Flow of Compliance
          </div>
          <h2 className="headline-md text-[24px] text-[var(--color-ink)]">
            Department <em className="font-display">→</em> Status
          </h2>
        </div>
        <div className="text-[11px] font-mono text-[var(--color-ink-mute)]">
          {totals.actions} directives mapped
        </div>
      </header>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 720 }}
          role="img"
          aria-label="Directive flow from departments to compliance statuses"
        >
          <defs>
            {ribbons.map((r) => (
              <linearGradient
                key={`grad-${r.id}`}
                id={`grad-${r.id}`}
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor={r.deptColor} stopOpacity="0.55" />
                <stop offset="100%" stopColor={STATUS_TONE[r.statusKey]} stopOpacity="0.55" />
              </linearGradient>
            ))}
          </defs>

          {/* Ribbons */}
          <g>
            {ribbons.map((r, i) => {
              const dimmed =
                (hoverDept && r.id.split('-')[0] !== hoverDept) ||
                (hoverStatus && r.statusKey !== hoverStatus);
              return (
                <motion.path
                  key={r.id}
                  d={ribbonPath(r)}
                  fill="none"
                  stroke={`url(#grad-${r.id})`}
                  strokeWidth={Math.max(2, r.value)}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: dimmed ? 0.06 : 0.85 } : {}}
                  transition={{
                    pathLength: { duration: 1.4, delay: 0.2 + i * 0.06, ease: EASE_PAPER },
                    opacity: { duration: 0.3 },
                  }}
                >
                  <title>{r.caseNumber}</title>
                </motion.path>
              );
            })}
          </g>

          {/* Department nodes */}
          <g>
            {deptNodes.map((n, i) => {
              const dimmed = hoverDept && n.name !== hoverDept;
              return (
                <g
                  key={n.name}
                  onMouseEnter={() => setHoverDept(n.name)}
                  onMouseLeave={() => setHoverDept(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={n.h}
                    fill={DEPARTMENT_COLORS[n.name] ?? '#6B7886'}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={inView ? { scaleY: 1, opacity: dimmed ? 0.25 : 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.04, ease: EASE_PAPER }}
                    style={{ transformOrigin: `${n.x + NODE_W / 2}px ${n.y + n.h / 2}px` }}
                  />
                  <motion.text
                    x={n.x - 10}
                    y={n.y + n.h / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontFamily="var(--font-body)"
                    fontWeight="600"
                    fill={dimmed ? '#A6A096' : 'var(--color-ink)'}
                    initial={{ opacity: 0, x: n.x }}
                    animate={inView ? { opacity: 1, x: n.x - 10 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.04 }}
                  >
                    {n.name}
                  </motion.text>
                  <motion.text
                    x={n.x - 10}
                    y={n.y + n.h / 2 + 13}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fill="var(--color-ink-mute)"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: dimmed ? 0.3 : 0.7 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.04 }}
                  >
                    {n.count}
                  </motion.text>
                </g>
              );
            })}
          </g>

          {/* Status nodes */}
          <g>
            {statusNodes.map((n, i) => {
              const dimmed = hoverStatus && n.name !== hoverStatus;
              return (
                <g
                  key={n.name}
                  onMouseEnter={() => setHoverStatus(n.name)}
                  onMouseLeave={() => setHoverStatus(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={n.h}
                    fill={STATUS_TONE[n.name] ?? '#5A5564'}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={inView ? { scaleY: 1, opacity: dimmed ? 0.25 : 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.04, ease: EASE_PAPER }}
                    style={{ transformOrigin: `${n.x + NODE_W / 2}px ${n.y + n.h / 2}px` }}
                  />
                  <motion.text
                    x={n.x + NODE_W + 10}
                    y={n.y + n.h / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontFamily="var(--font-body)"
                    fontWeight="600"
                    fill={dimmed ? '#A6A096' : 'var(--color-ink)'}
                    initial={{ opacity: 0, x: n.x + NODE_W }}
                    animate={inView ? { opacity: 1, x: n.x + NODE_W + 10 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.04 }}
                  >
                    {STATUS_LABEL[n.name] ?? n.name}
                  </motion.text>
                  <motion.text
                    x={n.x + NODE_W + 10}
                    y={n.y + n.h / 2 + 13}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fill="var(--color-ink-mute)"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: dimmed ? 0.3 : 0.7 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.04 }}
                  >
                    {n.count}
                  </motion.text>
                </g>
              );
            })}
          </g>

          {/* Vertical labels at each axis */}
          <text
            x={PAD_X - NODE_W - 60}
            y={4}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--color-ink-mute)"
            opacity="0.6"
            transform={`rotate(-90 ${PAD_X - NODE_W - 60} 8)`}
            letterSpacing="3"
          >
            DEPT
          </text>
          <text
            x={W - PAD_X + NODE_W + 60}
            y={4}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--color-ink-mute)"
            opacity="0.6"
            transform={`rotate(-90 ${W - PAD_X + NODE_W + 60} 8)`}
            letterSpacing="3"
          >
            STATUS
          </text>
        </svg>
      </div>

      <footer className="mt-4 pt-4 border-t border-[var(--color-divider)] flex items-center justify-between text-[11px] text-[var(--color-ink-mute)]">
        <span className="font-mono">Hover any rail to isolate · ribbons sized by directive count</span>
        <span className="font-mono">▢ live</span>
      </footer>
    </section>
  );
}

// Smooth bezier from source rail to target rail.
function ribbonPath(r: Ribbon): string {
  const { source, target } = r;
  const midX = (source.x + target.x) / 2;
  return `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;
}
