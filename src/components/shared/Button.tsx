'use client';

// Button — single component for every button in the app.
//
// Variants ride on the `.btn` utility classes defined in globals.css so the
// look stays consistent without per-call tailwind incantations. Polymorphic
// `as` lets you render it as a Next.js Link or a plain anchor without
// duplicating the styling.

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'danger'
  | 'success'
  | 'outline-danger'
  | 'outline-success';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

type PolymorphicProps<E extends React.ElementType> = ButtonOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof ButtonOwnProps | 'as'>;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  link: 'btn-link',
  danger: 'btn-danger',
  success: 'btn-success',
  'outline-danger': 'btn-outline-danger',
  'outline-success': 'btn-outline-success',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

function ButtonInner<E extends React.ElementType = 'button'>(
  {
    as,
    variant = 'secondary',
    size = 'md',
    block,
    loading,
    iconLeft,
    iconRight,
    className,
    children,
    disabled,
    ...rest
  }: PolymorphicProps<E>,
  ref: React.Ref<Element>
) {
  const Tag = (as ?? 'button') as React.ElementType;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn(
        'btn',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        block && 'btn-block',
        className
      )}
      aria-disabled={disabled || loading || undefined}
      data-loading={loading || undefined}
      // Only pass `disabled` when rendering an actual <button>; anchors and
      // Links don't accept it and React will warn.
      {...(Tag === 'button' ? { disabled: disabled || loading } : {})}
      {...rest}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        iconLeft && (
          <span className="btn-icon-left" aria-hidden="true">
            {iconLeft}
          </span>
        )
      )}
      <span>{children}</span>
      {iconRight && !loading && (
        <span className="btn-icon-right" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </Tag>
  );
}

const Button = React.forwardRef(ButtonInner) as <E extends React.ElementType = 'button'>(
  p: PolymorphicProps<E> & { ref?: React.Ref<Element> }
) => React.ReactElement | null;

export default Button;

/* ── IconButton ─────────────────────────────────────────────────────────── */

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  tone?: 'neutral' | 'saffron' | 'danger' | 'success';
}

const ICON_TONE: Record<NonNullable<IconButtonProps['tone']>, string> = {
  neutral: '',
  saffron:
    'hover:!border-[var(--color-saffron)] hover:!text-[var(--color-saffron)] hover:!bg-[rgba(231,140,45,0.08)]',
  danger:
    'hover:!border-[var(--color-vermilion)] hover:!text-[var(--color-vermilion)] hover:!bg-[rgba(228,94,110,0.08)]',
  success:
    'hover:!border-[var(--color-verdant)] hover:!text-[var(--color-verdant)] hover:!bg-[rgba(79,168,130,0.08)]',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ size = 'md', tone = 'neutral', className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'btn-icon',
          size === 'sm' && 'btn-icon-sm',
          ICON_TONE[tone],
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
