'use client';

import React from 'react';

export interface ApexLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Minimalist, enterprise-grade geometric emblem for ApexTrack.
 * Precision SVG apex peak with subtle linear gradient strokes (#3B82F6 to #6366F1).
 */
export function ApexLogo({
  size = 32,
  showWordmark = false,
  className = '',
}: ApexLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Apex Peak Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-200"
        aria-label="ApexTrack Logo"
      >
        <defs>
          <linearGradient
            id="apexPeakGradient"
            x1="4"
            y1="28"
            x2="28"
            y2="4"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient
            id="apexPeakFacet"
            x1="16"
            y1="4"
            x2="16"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Ambient Facet Fill */}
        <path
          d="M 16 3.75 L 4.5 25.5 C 4.1 26.3 4.7 27.25 5.6 27.25 L 12 27.25 L 16 19.5 L 20 27.25 L 26.4 27.25 C 27.3 27.25 27.9 26.3 27.5 25.5 L 16 3.75 Z"
          fill="url(#apexPeakFacet)"
        />

        {/* Outer Precision Geometric Apex Peak Stroke */}
        <path
          d="M 16 3.75 L 4.5 25.5 C 4.1 26.3 4.7 27.25 5.6 27.25 L 12 27.25 L 16 19.5 L 20 27.25 L 26.4 27.25 C 27.3 27.25 27.9 26.3 27.5 25.5 L 16 3.75 Z"
          stroke="url(#apexPeakGradient)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Apex Vertex Blade / Dynamic Crossbar */}
        <path
          d="M 11.2 18.2 L 20.8 18.2"
          stroke="url(#apexPeakGradient)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Apex Core Focal Accent */}
        <circle cx="16" cy="11.5" r="1.5" fill="#60A5FA" />
      </svg>

      {/* Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none select-none min-w-0">
          <div className="flex items-center">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
              Apex
            </span>
            <span className="font-normal text-slate-500 dark:text-slate-400 text-base tracking-tight">
              Track
            </span>
          </div>
          <span className="text-[9px] tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono mt-0.5">
            Enterprise
          </span>
        </div>
      )}
    </div>
  );
}

export default ApexLogo;
