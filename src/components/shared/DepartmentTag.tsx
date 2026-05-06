import { DEPARTMENT_COLORS } from '@/types/department';
import { cn } from '@/lib/utils';

interface DepartmentTagProps {
  department: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function DepartmentTag({
  department,
  size = 'md',
  className,
}: DepartmentTagProps) {
  const color = DEPARTMENT_COLORS[department] || '#93A4B6';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[3px] font-mono uppercase tracking-[0.08em]',
        size === 'sm' ? 'text-[10px] px-1.5 py-[3px]' : 'text-[11px] px-2 py-1',
        'border transition-colors',
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color,
        borderColor: `${color}40`,
        boxShadow: `inset 0 0 0 1px ${color}10`,
      }}
      aria-label={`Department: ${department}`}
    >
      <span
        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}80`,
        }}
        aria-hidden="true"
      />
      {department}
    </span>
  );
}
