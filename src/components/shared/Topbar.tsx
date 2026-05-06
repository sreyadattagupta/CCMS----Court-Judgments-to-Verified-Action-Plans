'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, Upload, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Edition',
  '/judgments': 'Docket',
  '/actions': 'Directives',
  '/departments': 'Departments',
  '/reports': 'Almanac',
  '/settings': 'Imprint',
  '/notifications': 'Bulletins',
};

export default function Topbar() {
  const pathname = usePathname();
  const { toggleSidebar, notificationCount } = useAppStore();

  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    return {
      label:
        BREADCRUMBS[path] ||
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      path,
    };
  });

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="topbar" role="banner">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-sm hover:bg-[var(--color-parchment-dark)] transition-colors md:hidden flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} className="text-[var(--color-ink-soft)]" />
        </button>

        {/* Masthead breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-col min-w-0">
          <span className="text-[9px] font-mono uppercase tracking-[0.24em] text-[var(--color-ink-mute)] mb-0.5">
            Karnataka High Court · CCMS
          </span>
          <div className="flex items-baseline gap-2 min-w-0">
            <Link
              href="/dashboard"
              className="topbar-brand text-[20px] hover:text-[var(--color-saffron)] transition-colors flex-shrink-0"
            >
              Samiksha
            </Link>
            {crumbs.map((crumb, i) => (
              <motion.span
                key={crumb.path}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-baseline gap-2 min-w-0"
              >
                <span className="text-[var(--color-saffron)] text-[14px] flex-shrink-0">
                  /
                </span>
                {i === crumbs.length - 1 ? (
                  <span className="font-display text-[14px] font-medium text-[var(--color-ink)] truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="text-[var(--color-ink-mute)] text-[14px] hover:text-[var(--color-ink)] transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </motion.span>
            ))}
          </div>
        </nav>
      </div>

      {/* Right column */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--color-parchment)] border border-[var(--color-border)] rounded-sm px-3 py-1.5 w-64 transition-all focus-within:border-[var(--color-saffron)] focus-within:bg-[var(--color-surface)]">
          <Search size={14} className="text-[var(--color-ink-mute)]" />
          <input
            type="text"
            placeholder="Search docket / dept / directive…"
            className="bg-transparent text-[12px] text-[var(--color-ink)] outline-none flex-1 placeholder:text-[var(--color-ink-mute)] font-mono"
            aria-label="Global search"
          />
          <kbd className="text-[9px] text-[var(--color-ink-mute)] bg-[var(--color-parchment-dark)] rounded-sm px-1 py-0.5 font-mono flex-shrink-0 border border-[var(--color-border)]">
            ⌘K
          </kbd>
        </div>

        {/* Date stamp — hidden on small */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border-l border-[var(--color-border)] text-[var(--color-ink-mute)]">
          <CalendarIcon size={12} />
          <div className="leading-tight">
            <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
              Edition
            </div>
            <div className="text-[11px] font-display text-[var(--color-ink)]">
              {today} <span className="text-[var(--color-ink-mute)] font-mono">· {time} IST</span>
            </div>
          </div>
        </div>

        {/* Upload */}
        <Link
          href="/judgments"
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-[12px] font-mono font-semibold tracking-[0.08em] uppercase text-[var(--color-parchment)] transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(180deg, #C9610A 0%, #8E3D00 100%)',
            boxShadow:
              '0 1px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <Upload size={13} strokeWidth={2.4} />
          File new
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-sm hover:bg-[var(--color-parchment-dark)] transition-colors"
          aria-label={`Bulletins · ${notificationCount} unread`}
        >
          <Bell
            size={18}
            className={
              notificationCount > 0
                ? 'text-[var(--color-saffron)]'
                : 'text-[var(--color-ink-soft)]'
            }
          />
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full px-1 bg-[var(--color-vermilion)] text-white text-[9px] font-bold font-mono flex items-center justify-center"
              aria-hidden="true"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </motion.span>
          )}
        </Link>
      </div>
    </header>
  );
}
