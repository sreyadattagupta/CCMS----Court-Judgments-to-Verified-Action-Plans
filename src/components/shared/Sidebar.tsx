'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  Building2,
  BarChart3,
  Settings,
  Search,
  Bell,
  ScrollText,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { DEMO_ACTIONS } from '@/lib/demo-data';

const overdueCount = DEMO_ACTIONS.filter((a) => a.status === 'overdue').length;
const reviewQueueCount = DEMO_ACTIONS.filter(
  (a) => a.status === 'pending_verification'
).length;

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: '01' },
  { href: '/judgments', label: 'Judgments', icon: FileText, key: '02' },
  { href: '/actions', label: 'Directives', icon: ListChecks, key: '03' },
  { href: '/departments', label: 'Departments', icon: Building2, key: '04' },
  { href: '/reports', label: 'Reports', icon: BarChart3, key: '05' },
];

const TOOL_ITEMS = [
  { href: '/actions?search=true', label: 'RAG Search', icon: Search, key: '06' },
  { href: '/notifications', label: 'Bulletins', icon: Bell, key: '07' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, notificationCount } = useAppStore();

  return (
    <aside
      className={cn(
        'sidebar transition-transform duration-300',
        !sidebarOpen && '-translate-x-full md:translate-x-0'
      )}
      aria-label="Main navigation"
    >
      {/* Press masthead */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06] relative">
        <div className="flex items-start gap-3">
          {/* Wax-seal mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: -3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-11 h-11 flex-shrink-0"
          >
            <svg viewBox="0 0 44 44" className="w-full h-full">
              <circle
                cx="22"
                cy="22"
                r="20.5"
                fill="none"
                stroke="#C9610A"
                strokeWidth="1"
                strokeDasharray="2 2.5"
                opacity="0.6"
              />
              <circle cx="22" cy="22" r="16" fill="#C9610A" />
              <circle cx="22" cy="22" r="13" fill="none" stroke="#14141C" strokeWidth="0.6" strokeDasharray="0.8 1.2" />
              <text
                x="22"
                y="20.5"
                textAnchor="middle"
                fill="#14141C"
                fontSize="10"
                fontFamily="Fraunces, serif"
                fontWeight="700"
                letterSpacing="0.5"
              >
                S
              </text>
              <text
                x="22"
                y="29"
                textAnchor="middle"
                fill="#14141C"
                fontSize="4.4"
                fontFamily="JetBrains Mono"
                letterSpacing="0.6"
              >
                KHC · CCMS
              </text>
            </svg>
          </motion.div>

          <div className="min-w-0 pt-0.5">
            <div
              className="text-[var(--color-parchment)] text-[18px] leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 36, 'WONK' 1, 'SOFT' 50",
                fontWeight: 580,
                letterSpacing: '-0.005em',
              }}
            >
              SAMIKSHA
            </div>
            <div className="text-white/35 text-[9px] font-mono uppercase tracking-[0.18em] mt-1.5">
              The CCMS Gazette
            </div>
          </div>
        </div>

        {/* Volume / issue strip */}
        <div className="mt-4 grid grid-cols-3 gap-px bg-white/[0.06] rounded-sm overflow-hidden text-center">
          {[
            { label: 'VOL', value: 'II' },
            { label: 'ISSUE', value: '127' },
            { label: 'EDN', value: 'BLR' },
          ].map((m) => (
            <div key={m.label} className="bg-[#0F0F18] py-1.5 px-1">
              <div className="text-[8.5px] font-mono text-white/30 tracking-[0.16em]">
                {m.label}
              </div>
              <div className="text-[12px] font-display text-[#F4A653] mt-0.5">
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline + review status */}
      <div className="px-4 pt-3 space-y-1.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1F2D24] border border-emerald-700/30 rounded-sm">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300" />
          </span>
          <span className="text-emerald-300 text-[10px] font-mono font-semibold tracking-[0.14em]">
            PIPELINE · LIVE
          </span>
          <span className="ml-auto text-emerald-400/40 text-[9px] font-mono">v0.1</span>
        </div>
        {reviewQueueCount > 0 && (
          <Link
            href="/actions?status=pending_verification"
            className="flex items-center gap-2 px-2.5 py-1.5 bg-[#2A2317] border border-amber-700/30 rounded-sm hover:bg-[#332B1D] transition-colors"
          >
            <ScrollText size={11} className="text-amber-300" />
            <span className="text-amber-200 text-[10px] font-mono font-semibold tracking-[0.14em]">
              {reviewQueueCount} AWAITING REVIEW
            </span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 mt-3 overflow-y-auto" role="navigation">
        <SectionHeading label="The Bench" />
        {NAV_ITEMS.map(({ href, label, icon: Icon, key }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn('sidebar-nav-item', isActive && 'active')}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-[9px] font-mono opacity-40 tracking-widest w-5">
                {key}
              </span>
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Directives' && overdueCount > 0 && (
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[var(--color-vermilion)]/30 text-red-200">
                  {overdueCount}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-3 mx-5 h-px bg-white/[0.06]" />

        <SectionHeading label="Auxiliary" />
        {TOOL_ITEMS.map(({ href, label, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'sidebar-nav-item',
              pathname === href.split('?')[0] && 'active'
            )}
          >
            <span className="text-[9px] font-mono opacity-40 tracking-widest w-5">
              {key}
            </span>
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
            {label === 'Bulletins' && notificationCount > 0 && (
              <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[var(--color-saffron)]/30 text-[#F4A653]">
                {notificationCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer — colophon */}
      <div className="border-t border-white/[0.06] py-3">
        <Link
          href="/settings"
          className={cn('sidebar-nav-item', pathname === '/settings' && 'active')}
        >
          <span className="text-[9px] font-mono opacity-40 tracking-widest w-5">
            00
          </span>
          <Settings size={15} strokeWidth={1.8} />
          <span>Imprint</span>
        </Link>

        <div className="flex items-center gap-3 px-5 py-3 mt-2 border-t border-white/[0.06]">
          <div className="relative w-9 h-9 flex-shrink-0">
            <span
              className="absolute inset-0 rounded-sm"
              style={{
                background: 'linear-gradient(135deg, #C9610A, #8E3D00)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              aria-hidden="true"
            />
            <span className="relative flex items-center justify-center w-full h-full text-[var(--color-parchment)] font-display text-sm font-semibold">
              R
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-[12px] font-semibold truncate">
              Registrar (Judicial)
            </div>
            <div className="text-white/40 text-[10px] font-mono truncate">
              karnatakajudiciary.gov.in
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mb-1 px-5 pb-1 flex items-center gap-2">
      <span
        aria-hidden="true"
        className="block w-4 h-px"
        style={{ background: 'rgba(244,166,83,0.4)' }}
      />
      <span className="text-[#F4A653]/60 text-[9px] font-mono uppercase tracking-[0.22em]">
        {label}
      </span>
    </div>
  );
}
