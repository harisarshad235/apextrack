'use client';

import React, { useId } from 'react';

export interface ApexLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  subtitle?: string;
}

/**
 * Enterprise-grade ApexTrack Blade Emblem & Wordmark.
 * Precision SVG dual-blade emblem with Cyan-to-Electric-Indigo gradient (#06B6D4 -> #3B82F6 -> #6366F1),
 * metallic slate negative-space wing, and dark/light mode responsive typography.
 */
export function ApexLogo({
  size = 32,
  showWordmark = false,
  className = '',
  subtitle = 'ENTERPRISE CORE',
}: ApexLogoProps) {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `bladeGrad-${uniqueId}`;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Container Tile & Blade Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="20 20 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-200"
        aria-label="ApexTrack Logo"
      >
        <defs>
          {/* Cyan-to-Electric-Indigo Gradient */}
          <linearGradient id={gradId} x1="30" y1="80" x2="90" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* Container / Background Tile */}
        <rect x="20" y="20" width="80" height="80" rx="22" fill="#090D16" />
        <rect
          x="20"
          y="20"
          width="80"
          height="80"
          rx="22"
          stroke="#1E293B"
          strokeWidth="1.5"
          className="stroke-slate-300 dark:stroke-[#1E293B]"
        />

        {/* Left Ascending Fin */}
        <path d="M40 76 L57 37 C57.8 35.2 60 35.2 60.8 37 L65 46 L47 76 Z" fill={`url(#${gradId})`} />

        {/* Right Descending Wing with Precision Negative-Space Gap */}
        <path
          d="M68 53 L74 66 C74.8 67.8 74.2 70 72.5 71 L53 82 L79 82 C80.7 82 82 80.7 81.3 79.1 L62.5 37 C61.8 35.4 59.5 35.4 58.8 37 L56 43 L68 53 Z"
          fill="#94A3B8"
          opacity="0.9"
        />
      </svg>

      {/* Typography Wordmark (Dark/Light mode responsive) */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none min-w-0">
          <div className="flex items-center tracking-[-0.035em]">
            <span
              className="font-bold text-slate-900 dark:text-slate-100 transition-colors"
              style={{ fontSize: `${Math.max(15, size * 0.48)}px` }}
            >
              Apex
            </span>
            <span
              className="font-normal text-slate-500 dark:text-slate-400 transition-colors"
              style={{ fontSize: `${Math.max(15, size * 0.48)}px` }}
            >
              Track
            </span>
          </div>
          <span
            className="font-semibold tracking-[0.22em] text-slate-500 dark:text-slate-400 uppercase font-mono mt-0.5 transition-colors"
            style={{ fontSize: `${Math.max(7, size * 0.22)}px` }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

export default ApexLogo;
