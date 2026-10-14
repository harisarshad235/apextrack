'use client';

import React, { useId } from 'react';

export interface KynovLogoProps {
  variant?: 'icon' | 'full' | 'monochrome' | 'boxed' | 'monogram';
  size?: 'sm' | 'md' | 'lg' | number;
  showWordmark?: boolean;
  showSubtitle?: boolean;
  className?: string;
  subtitle?: string;
}

/**
 * The "Kinetic Pulse" Kynov Logo Component.
 * 
 * Concept:
 * - A stylized, geometric 'K' formed with a solid stem and forward-pointing chevron slash
 * - Electric gradient featuring Electric Indigo (#6366F1) & Cyan Pulse (#06B6D4)
 * - Kinetic speed nodes & razor-sharp chamfers representing agile velocity & momentum
 * 
 * Supports:
 * - variant: 'icon' | 'full' | 'monochrome' (plus backward-compatible 'boxed' | 'monogram')
 * - size: 'sm' (24px) | 'md' (32px) | 'lg' (44px) | custom number
 */
export function KynovLogo({
  variant = 'full',
  size = 'md',
  showWordmark,
  showSubtitle = true,
  className = '',
  subtitle = 'Agile Velocity & Sprint Tracking',
}: KynovLogoProps) {
  const uniqueId = useId().replace(/:/g, '');
  const gradStemId = `kynov-grad-stem-${uniqueId}`;
  const gradChevronId = `kynov-grad-chevron-${uniqueId}`;
  const gradGlowId = `kynov-glow-${uniqueId}`;

  // Resolve numerical pixel dimension
  let pixelSize = 32;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'sm':
        pixelSize = 24;
        break;
      case 'lg':
        pixelSize = 44;
        break;
      case 'md':
      default:
        pixelSize = 32;
        break;
    }
  }

  // Determine display flags based on variant
  const isMonochrome = variant === 'monochrome';
  const isBoxed = variant === 'boxed';
  const shouldRenderWordmark =
    showWordmark !== undefined
      ? showWordmark
      : variant === 'full';

  const svgMark = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105"
      aria-label="Kynov - The Kinetic Pulse"
      role="img"
    >
      <defs>
        {!isMonochrome && (
          <>
            {/* Primary Electric Gradient for Stem: Indigo to Deep Blue */}
            <linearGradient id={gradStemId} x1="16" y1="12" x2="36" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="45%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>

            {/* Kinetic Pulse Chevron Gradient: Electric Indigo through Cyan Pulse */}
            <linearGradient id={gradChevronId} x1="38" y1="84" x2="88" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="35%" stopColor="#6366F1" />
              <stop offset="75%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>

            {/* Kinetic Pulse Glow Filter */}
            <filter id={gradGlowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.3" />
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#6366F1" floodOpacity="0.25" />
            </filter>
          </>
        )}
      </defs>

      {/* 1. Solid Geometric Vertical Stem */}
      <rect
        x="16"
        y="14"
        width="18"
        height="72"
        rx="7"
        fill={isMonochrome ? 'currentColor' : `url(#${gradStemId})`}
      />

      {/* Stem Specular Inner Chamfer Accent */}
      {!isMonochrome && (
        <rect
          x="19"
          y="17"
          width="4"
          height="32"
          rx="2"
          fill="#FFFFFF"
          opacity="0.35"
        />
      )}

      {/* 2. Upper Kinetic Pulse Chevron Wing */}
      <path
        d="M 40 47 
           C 40 44, 42 42, 45 40 
           L 72 17.5 
           C 75.5 14.5, 81 17, 81 21.5 
           L 81 33 
           C 81 35.5, 79.5 37.5, 77 39.5 
           L 54 58 
           C 51 60.5, 47 58.5, 47 55 
           Z"
        fill={isMonochrome ? 'currentColor' : `url(#${gradChevronId})`}
        filter={!isMonochrome ? `url(#${gradGlowId})` : undefined}
      />

      {/* 3. Lower Forward-Pointing Kinetic Chevron Slash */}
      <path
        d="M 41 51
           L 73 80.5
           C 76.5 83.5, 82 81.5, 82 76.5
           L 82 66
           C 82 63.5, 80.5 61.5, 78 59.5
           L 55 41
           C 51.5 38.5, 47 41, 47 45.5
           Z"
        fill={isMonochrome ? 'currentColor' : `url(#${gradChevronId})`}
        filter={!isMonochrome ? `url(#${gradGlowId})` : undefined}
      />

      {/* 4. High-Velocity Forward Arrow Tip Accent (The Pulse Vertex) */}
      {!isMonochrome && (
        <path
          d="M 52 44 L 75 25 C 77 23.5, 80 25, 80 27.5 L 80 32 L 60 49 Z"
          fill="#E0F2FE"
          opacity="0.6"
        />
      )}

      {/* 5. Center Pulse Energy Dot */}
      {!isMonochrome && (
        <circle
          cx="44"
          cy="49"
          r="3"
          fill="#22D3EE"
          className="animate-pulse"
        />
      )}
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Icon with optional Glass/Boxed container */}
      {isBoxed ? (
        <div className="flex items-center justify-center p-2 rounded-xl bg-[#11141B]/90 border border-[#232836] shadow-inner backdrop-blur-md transition-all duration-300 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          {svgMark}
        </div>
      ) : (
        svgMark
      )}

      {/* Wordmark Lockup */}
      {shouldRenderWordmark && (
        <div className="flex flex-col justify-center leading-none min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors"
              style={{ fontSize: `${Math.max(16, pixelSize * 0.54)}px` }}
            >
              Kynov
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          {showSubtitle && (
            <span
              className="font-medium tracking-normal text-slate-500 dark:text-slate-400 mt-1 transition-colors whitespace-nowrap"
              style={{ fontSize: `${Math.max(8, pixelSize * 0.22)}px` }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default KynovLogo;
