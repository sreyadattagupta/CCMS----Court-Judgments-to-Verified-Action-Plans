'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

interface ComplianceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export default function ComplianceRing({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = '#1F5E45',
  sublabel,
  animate: shouldAnimate = true,
}: ComplianceRingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, { once: true, margin: '-15%' });
  const [display, setDisplay] = useState(shouldAnimate ? 0 : percentage);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (!shouldAnimate || !inView) return;
    const controls = animate(0, percentage, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [percentage, inView, shouldAnimate]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-label={`Compliance ${percentage} per cent`} role="img">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeOpacity={0.45}
          strokeWidth={strokeWidth}
        />
        {/* Inner soft ring decoration */}
        <circle
          cx={cx}
          cy={cy}
          r={radius - strokeWidth - 1}
          fill="none"
          stroke="var(--color-border)"
          strokeOpacity={0.18}
          strokeWidth={0.6}
          strokeDasharray="1 3"
        />
        {/* Progress */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={
            inView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }
          }
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
        {/* Tip dot */}
        <motion.circle
          cx={cx}
          cy={cy - radius}
          r={strokeWidth / 2 + 1}
          fill={color}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: percentage > 0 ? 1 : 0 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          style={{
            transform: `rotate(${(percentage / 100) * 360 - 90}deg)`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-display font-semibold leading-none numerals-tab"
          style={{
            fontSize: size * 0.26,
            color,
            fontVariationSettings: "'opsz' 96, 'WONK' 1",
          }}
        >
          {display}
          <span style={{ fontSize: size * 0.14, marginLeft: 1 }}>%</span>
        </span>
        {sublabel && (
          <span
            className="text-[var(--color-ink-mute)] leading-tight mt-0.5 font-mono uppercase tracking-widest"
            style={{ fontSize: size * 0.075 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
