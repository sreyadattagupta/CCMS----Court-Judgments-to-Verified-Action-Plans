'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { AppNotification, NotificationType } from '@/lib/notifications';
import {
  Bell,
  BellOff,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileSearch,
  Cpu,
  ArrowRight,
  Check,
} from 'lucide-react';
import { cn, EASE_PAPER } from '@/lib/utils';
import Button from '@/components/shared/Button';
import { Chip } from '@/components/shared/Input';

interface TypeConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  overdue: {
    label: 'Overdue',
    icon: <AlertTriangle size={14} />,
    color: '#F08593',
    bg: 'rgba(228,94,110,0.08)',
    border: 'rgba(228,94,110,0.32)',
  },
  due_soon: {
    label: 'Due soon',
    icon: <Clock size={14} />,
    color: '#F0A04A',
    bg: 'rgba(231,140,45,0.08)',
    border: 'rgba(231,140,45,0.32)',
  },
  pending_review: {
    label: 'Review',
    icon: <FileSearch size={14} />,
    color: '#9DBAFF',
    bg: 'rgba(122,160,255,0.08)',
    border: 'rgba(122,160,255,0.32)',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 size={14} />,
    color: '#5DBC95',
    bg: 'rgba(79,168,130,0.08)',
    border: 'rgba(79,168,130,0.32)',
  },
  system: {
    label: 'System',
    icon: <Cpu size={14} />,
    color: '#BBA9EC',
    bg: 'rgba(161,139,227,0.08)',
    border: 'rgba(161,139,227,0.32)',
  },
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_soon', label: 'Due soon' },
  { value: 'pending_review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

const SUMMARY_ITEMS: { type: NotificationType; label: string }[] = [
  { type: 'overdue', label: 'Overdue' },
  { type: 'due_soon', label: 'Due soon' },
  { type: 'pending_review', label: 'Needs review' },
  { type: 'system', label: 'System' },
];

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function NotificationItem({
  notif,
  onRead,
  index,
}: {
  notif: AppNotification;
  onRead: (id: string) => void;
  index: number;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  const actionHref = notif.actionId
    ? `/actions/${notif.actionId}`
    : notif.judgmentId
    ? `/judgments/${notif.judgmentId}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: EASE_PAPER }}
      className={cn(
        'flex gap-4 p-4 rounded-[3px] border transition-all duration-200',
        notif.read
          ? 'border-[var(--color-rule)] opacity-55'
          : 'border-[var(--color-rule-strong)]'
      )}
      style={{
        background: notif.read ? 'var(--color-ink-2)' : cfg.bg,
        borderColor: notif.read ? 'var(--color-rule)' : cfg.border,
      }}
    >
      {/* Unread dot */}
      {!notif.read ? (
        <div className="flex-shrink-0 mt-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: cfg.color,
              boxShadow: `0 0 8px ${cfg.color}`,
            }}
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-2" />
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 border"
        style={{
          background: notif.read ? 'rgba(242,235,216,0.04)' : cfg.bg,
          color: notif.read ? 'var(--color-fg-mute)' : cfg.color,
          borderColor: notif.read ? 'var(--color-rule)' : cfg.border,
        }}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-[2px]"
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
            {notif.caseNumber && (
              <span className="text-[10px] font-mono text-[var(--color-azure)] font-semibold">
                {notif.caseNumber}
              </span>
            )}
            {notif.department && (
              <span className="text-[10px] font-mono text-[var(--color-fg-mute)]">
                {notif.department}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[var(--color-fg-mute)] font-mono shrink-0 mt-0.5">
            {formatTimeAgo(notif.createdAt)}
          </span>
        </div>

        <p
          className="font-display text-[14px] text-[var(--color-fg)] mt-1"
          style={{ fontVariationSettings: "'opsz' 36, 'WONK' 0", fontWeight: 540 }}
        >
          {notif.title}
        </p>
        <p className="text-[12px] text-[var(--color-fg-soft)] mt-1 leading-relaxed">
          {notif.body}
        </p>

        <div className="flex items-center gap-3 mt-3">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={() => onRead(notif.id)}
              className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.14em] hover:opacity-80 transition-opacity"
              style={{ color: notif.read ? 'var(--color-fg-mute)' : cfg.color }}
            >
              View directive <ArrowRight size={10} />
            </Link>
          )}
          {!notif.read && (
            <button
              onClick={() => onRead(notif.id)}
              className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] hover:text-[var(--color-fg)] transition-colors"
            >
              <Check size={11} /> Mark read
            </button>
          )}
          {notif.read && (
            <span className="ml-auto text-[10px] text-[var(--color-fg-fade)] font-mono inline-flex items-center gap-1">
              <Check size={9} /> Read
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { notifications, notificationCount, markNotificationRead, markAllRead } = useAppStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const counts: Record<string, number> = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    overdue: notifications.filter((n) => n.type === 'overdue').length,
    due_soon: notifications.filter((n) => n.type === 'due_soon').length,
    pending_review: notifications.filter((n) => n.type === 'pending_review').length,
    completed: notifications.filter((n) => n.type === 'completed').length,
  };

  return (
    <div className="space-y-6 animate-page-enter max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-fg-mute)] mb-1">
            §07 · Bulletins
          </div>
          <h1 className="headline-md text-[28px] flex items-center gap-3">
            <div className="relative">
              <Bell size={26} className="text-[var(--color-saffron)]" />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--color-vermilion)',
                    color: '#FFF',
                    boxShadow: '0 0 8px rgba(228,94,110,0.5)',
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
            Notifications
          </h1>
          <p className="text-[12px] text-[var(--color-fg-soft)] mt-2">
            {notificationCount > 0
              ? `${notificationCount} unread — court-mandated actions require attention`
              : 'All caught up — no unread notifications'}
          </p>
        </div>

        {notificationCount > 0 && (
          <Button
            variant="secondary"
            size="md"
            iconLeft={<BellOff size={13} />}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Summary strip */}
      {notificationCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_ITEMS.map(({ type, label }) => {
            const count = notifications.filter((n) => n.type === type && !n.read).length;
            if (count === 0) return null;
            const cfg = TYPE_CONFIG[type];
            const isActive = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className="card p-3 text-left transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: isActive ? cfg.border : 'var(--color-rule)',
                  background: isActive ? cfg.bg : 'var(--color-ink-2)',
                }}
              >
                <div
                  className="text-[20px] font-display font-semibold numerals-tab"
                  style={{
                    color: cfg.color,
                    fontVariationSettings: "'opsz' 96, 'WONK' 1",
                  }}
                >
                  {count}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-mute)] mt-0.5">
                  {label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter tabs (chips) */}
      <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-[var(--color-rule)]">
        {FILTER_TABS.map((tab) => {
          const count = counts[tab.value] ?? 0;
          return (
            <Chip
              key={tab.value}
              active={filter === tab.value}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="text-[9px] font-mono px-1 py-0 rounded-[2px] ml-0.5"
                  style={{
                    background:
                      filter === tab.value
                        ? 'rgba(0,0,0,0.2)'
                        : 'rgba(242,235,216,0.06)',
                  }}
                >
                  {count}
                </span>
              )}
            </Chip>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-16 text-center">
            <BellOff size={36} className="mx-auto mb-3 text-[var(--color-fg-mute)] opacity-50" />
            <p className="font-display text-[16px] text-[var(--color-fg-soft)]">
              {filter === 'unread' ? 'All caught up!' : 'No notifications in this category'}
            </p>
            <p className="text-[10px] font-mono mt-1 text-[var(--color-fg-mute)] uppercase tracking-[0.14em]">
              Nothing to show here
            </p>
          </div>
        )}
        {filtered.map((notif, i) => (
          <NotificationItem
            key={notif.id}
            notif={notif}
            onRead={markNotificationRead}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
