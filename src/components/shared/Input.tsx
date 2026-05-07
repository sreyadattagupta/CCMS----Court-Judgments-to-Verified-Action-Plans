'use client';

// Form-control primitives for the Night Edition.
// All visual styling is handled by .input / .search-shell / .chip / .kbd
// utilities in globals.css. These wrappers add labels, prefix/suffix slots,
// error messaging, and consistent metric.

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, hint, error, prefix, suffix, size = 'md', mono, className, id, ...rest },
    ref
  ) {
    const reactId = React.useId();
    const fieldId = id ?? `field-${reactId}`;
    const sizeClass = size === 'sm' ? 'input-sm' : size === 'lg' ? 'input-lg' : '';

    return (
      <div className="field">
        {label && (
          <label htmlFor={fieldId} className="field-label">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center gap-2 rounded-[3px] border bg-[var(--color-ink-3)] transition-colors',
            'border-[var(--color-rule)] focus-within:border-[var(--color-saffron)]',
            'focus-within:bg-[var(--color-ink-2)] focus-within:shadow-[0_0_0_3px_var(--color-saffron-glow)]',
            error && 'border-[var(--color-vermilion)] focus-within:border-[var(--color-vermilion)]',
            sizeClass === 'input-sm' && 'px-2.5',
            sizeClass === 'input-lg' && 'px-3.5',
            sizeClass === '' && 'px-3'
          )}
        >
          {prefix && (
            <span className="text-[var(--color-fg-mute)] flex-shrink-0">{prefix}</span>
          )}
          <input
            ref={ref}
            id={fieldId}
            className={cn(
              'flex-1 min-w-0 bg-transparent border-none outline-none text-[var(--color-fg)] placeholder:text-[var(--color-fg-mute)]',
              size === 'sm' ? 'py-1.5 text-[12px]' : size === 'lg' ? 'py-3 text-[14px]' : 'py-2.5 text-[13px]',
              mono && 'font-mono',
              className
            )}
            {...rest}
          />
          {suffix && (
            <span className="text-[var(--color-fg-mute)] flex-shrink-0">{suffix}</span>
          )}
        </div>
        {(hint || error) && (
          <div
            className={cn(
              'text-[11px] mt-1.5 font-mono',
              error ? 'text-[var(--color-vermilion)]' : 'text-[var(--color-fg-mute)]'
            )}
          >
            {error ?? hint}
          </div>
        )}
      </div>
    );
  }
);

/* ── SearchInput ─────────────────────────────────────────────────────── */

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcut?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ onClear, shortcut = '⌘K', value, className, ...rest }, ref) {
    const hasValue = typeof value === 'string' && value.length > 0;
    return (
      <div className={cn('search-shell', className)}>
        <Search size={14} className="text-[var(--color-fg-mute)]" />
        <input ref={ref} value={value} {...rest} />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[var(--color-fg-mute)] hover:text-[var(--color-fg)] transition-colors"
            aria-label="Clear"
          >
            <X size={12} />
          </button>
        ) : (
          shortcut && <kbd className="kbd">{shortcut}</kbd>
        )}
      </div>
    );
  }
);

/* ── Select (native, restyled) ───────────────────────────────────────── */

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md';
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, size = 'md', options, className, children, ...rest }, ref) {
    return (
      <div className="field">
        {label && <label className="field-label">{label}</label>}
        <select
          ref={ref}
          className={cn(
            size === 'sm' && 'py-1.5 text-[11px]',
            className
          )}
          {...rest}
        >
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
      </div>
    );
  }
);

/* ── Chip ────────────────────────────────────────────────────────────── */

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  function Chip({ active, className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={cn('chip', active && 'chip-active', className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

/* ── Kbd ─────────────────────────────────────────────────────────────── */

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn('kbd', className)}>{children}</kbd>;
}
