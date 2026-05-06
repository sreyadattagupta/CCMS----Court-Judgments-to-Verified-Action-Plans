import { ActionStatus } from '@/types/action';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<ActionStatus, { label: string; cls: string }> = {
  pending_verification: { label: 'Pending review',  cls: 'badge-pending' },
  verified:             { label: 'Verified',         cls: 'badge-verified' },
  assigned:             { label: 'Assigned',         cls: 'badge-assigned' },
  in_progress:          { label: 'In progress',      cls: 'badge-in-progress' },
  completed:            { label: 'Completed',        cls: 'badge-completed' },
  overdue:              { label: 'Overdue',          cls: 'badge-overdue' },
  rejected:             { label: 'Rejected',         cls: 'badge-rejected' },
};

interface StatusBadgeProps {
  status: ActionStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({
  status,
  showDot = true,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_verification;
  return (
    <span
      className={cn(
        'badge',
        config.cls,
        !showDot && 'badge-no-dot',
        size === 'sm' && 'text-[9px] px-1.5 py-0.5',
        className
      )}
      aria-label={`Status: ${config.label}`}
      role="status"
    >
      {config.label}
    </span>
  );
}
