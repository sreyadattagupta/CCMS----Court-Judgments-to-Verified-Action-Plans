'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/shared/Button';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

export default function DropZone({ onFileAccepted, disabled, maxSizeMB = 50 }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError(rejected[0].errors[0].message);
        return;
      }
      if (accepted.length > 0) {
        setFile(accepted[0]);
        onFileAccepted(accepted[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    disabled,
  });

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  if (file) {
    return (
      <div
        className="card p-6 flex items-center gap-5"
        style={{
          background: 'rgba(79,168,130,0.06)',
          borderColor: 'rgba(79,168,130,0.32)',
        }}
      >
        <div
          className="w-12 h-12 rounded-[3px] flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(79,168,130,0.12)',
            color: '#5DBC95',
            border: '1px solid rgba(79,168,130,0.28)',
          }}
        >
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[14px] text-[var(--color-fg)] truncate"
               style={{ fontVariationSettings: "'opsz' 36, 'WONK' 0", fontWeight: 500 }}>
            {file.name}
          </div>
          <div className="text-[11px] text-[var(--color-fg-mute)] font-mono mt-0.5 uppercase tracking-[0.1em]">
            {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
          </div>
        </div>
        <IconButton onClick={clear} aria-label="Remove file" tone="danger" size="sm">
          <X size={14} />
        </IconButton>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'dropzone p-10 flex flex-col items-center justify-center text-center cursor-pointer',
          isDragActive && 'active',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        role="button"
        aria-label="Upload PDF judgment file"
        tabIndex={0}
      >
        <input {...getInputProps()} aria-hidden="true" />
        <div
          className={cn(
            'w-16 h-16 rounded-[3px] flex items-center justify-center mb-4 transition-transform duration-300',
            isDragActive && 'scale-110 rotate-3'
          )}
          style={{
            background: isDragActive
              ? 'rgba(231,140,45,0.12)'
              : 'rgba(242,235,216,0.04)',
            border: isDragActive
              ? '1px solid rgba(231,140,45,0.4)'
              : '1px solid var(--color-rule)',
            boxShadow: isDragActive ? '0 0 30px var(--color-saffron-glow)' : 'none',
          }}
        >
          <Upload
            size={26}
            style={{
              color: isDragActive ? 'var(--color-saffron)' : 'var(--color-fg-mute)',
            }}
            strokeWidth={1.6}
          />
        </div>

        <p className="font-display text-[16px] text-[var(--color-fg)] mb-1"
           style={{ fontVariationSettings: "'opsz' 36, 'WONK' 1", fontWeight: 540 }}>
          {isDragActive ? 'Drop your PDF here' : 'Drag & drop judgment PDF'}
        </p>
        <p className="text-[12px] text-[var(--color-fg-soft)] mb-3">
          or{' '}
          <span className="text-[var(--color-saffron)] font-medium cursor-pointer hover:underline underline-offset-2">
            browse to upload
          </span>
        </p>
        <p className="text-[10px] text-[var(--color-fg-mute)] font-mono uppercase tracking-[0.18em]">
          PDF only · max {maxSizeMB}MB
        </p>
      </div>
      {error && (
        <div
          className="mt-3 flex items-center gap-2 text-[12px] font-mono px-3 py-2 rounded-[3px]"
          style={{
            background: 'rgba(228,94,110,0.06)',
            color: '#F08593',
            border: '1px solid rgba(228,94,110,0.3)',
          }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}
