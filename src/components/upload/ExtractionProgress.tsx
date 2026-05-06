'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { ExtractionProgress, EXTRACTION_STEPS, ExtractionStep } from '@/types/extraction';
import { cn } from '@/lib/utils';

interface ExtractionProgressProps {
  progress: ExtractionProgress;
}

const stepIndex = (step: ExtractionStep) =>
  EXTRACTION_STEPS.findIndex((s) => s.key === step);

export default function ExtractionProgressStepper({ progress }: ExtractionProgressProps) {
  const currentIdx = stepIndex(progress.step);

  return (
    <div className="card card-paper p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-mute)] mb-1">
            Pipeline
          </div>
          <h3 className="headline-md text-[16px]">Extraction in progress</h3>
        </div>
        {progress.extracted_count !== undefined && (
          <span
            className="text-[11px] font-mono px-2 py-1 rounded-[2px] border"
            style={{
              borderColor: 'rgba(231,140,45,0.3)',
              color: '#F0A04A',
              background: 'rgba(231,140,45,0.06)',
            }}
          >
            {progress.extracted_count} actions found
          </span>
        )}
      </div>

      {/* Overall progress bar */}
      <div
        className="w-full h-1 rounded-[1px] mb-6 overflow-hidden"
        style={{ background: 'var(--color-ink-3)' }}
      >
        <div
          className="h-full rounded-[1px] transition-all duration-500"
          style={{
            width: `${progress.progress}%`,
            background:
              progress.step === 'error'
                ? 'var(--color-vermilion)'
                : 'linear-gradient(90deg, var(--color-saffron), var(--color-verdant))',
            boxShadow:
              progress.step === 'error'
                ? '0 0 12px rgba(228,94,110,0.5)'
                : '0 0 12px var(--color-saffron-glow)',
          }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {EXTRACTION_STEPS.filter((s) => s.key !== 'error').map((step, idx) => {
          const isDone = currentIdx > idx || progress.step === 'complete';
          const isCurrent = progress.step === step.key;
          const isError = progress.step === 'error' && isCurrent;
          const isPending = currentIdx < idx && progress.step !== 'complete';

          return (
            <div
              key={step.key}
              className="flex items-center gap-3 transition-opacity duration-300"
              style={{ opacity: isPending ? 0.45 : 1 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isDone
                    ? 'rgba(79,168,130,0.12)'
                    : isCurrent && !isError
                      ? 'rgba(231,140,45,0.12)'
                      : isError
                        ? 'rgba(228,94,110,0.12)'
                        : 'rgba(242,235,216,0.04)',
                  color: isDone
                    ? '#5DBC95'
                    : isCurrent && !isError
                      ? '#F0A04A'
                      : isError
                        ? '#F08593'
                        : 'var(--color-fg-mute)',
                  boxShadow:
                    isCurrent && !isError ? '0 0 0 2px var(--color-saffron-glow)' : 'none',
                  border: '1px solid currentColor',
                  borderColor: isDone
                    ? 'rgba(79,168,130,0.3)'
                    : isCurrent && !isError
                      ? 'rgba(231,140,45,0.4)'
                      : isError
                        ? 'rgba(228,94,110,0.4)'
                        : 'var(--color-rule)',
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={14} />
                ) : isCurrent && !isError ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isError ? (
                  <XCircle size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-[13px]',
                    isDone && 'text-[var(--color-verdant)]',
                    isCurrent && !isError && 'text-[var(--color-saffron)] font-semibold',
                    isError && 'text-[var(--color-vermilion)]',
                    isPending && 'text-[var(--color-fg-mute)]'
                  )}
                >
                  {step.label}
                </div>
                {isCurrent && progress.message && (
                  <div className="text-[11px] text-[var(--color-fg-mute)] mt-0.5 font-mono">
                    {progress.message}
                  </div>
                )}
              </div>
              {isCurrent && !isError && (
                <span className="text-[11px] font-mono numerals-tab font-semibold" style={{ color: '#F0A04A' }}>
                  {progress.progress}%
                </span>
              )}
              {isDone && (
                <span className="text-[10px] font-mono" style={{ color: '#5DBC95' }}>
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {progress.step === 'error' && progress.error && (
        <div
          className="mt-4 p-3 rounded-[3px] text-[12px] font-mono"
          style={{
            background: 'rgba(228,94,110,0.06)',
            border: '1px solid rgba(228,94,110,0.3)',
            color: '#F08593',
          }}
        >
          Error: {progress.error}
        </div>
      )}
    </div>
  );
}
