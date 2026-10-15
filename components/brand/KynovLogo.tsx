'use client';

import React, { useId } from 'react';

export interface KynovLogoProps {
  variant?: 'icon' | 'full' | 'monochrome' | 'boxed' | 'monogram';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showWordmark?: boolean;
  showSubtitle?: boolean;
  className?: string;
  subtitle?: string;
  themeAdaptable?: boolean;
}

/**
 * Kynov Brand Identity Component.
 * 
 * Features the official geometric Kynov monogram mark & wordmark
 * with dynamic sizing and seamless light/dark theme adaptability.
 */
export function KynovLogo({
  variant = 'full',
  size = 'md',
  showWordmark,
  showSubtitle = false,
  className = '',
  subtitle = 'Agile Velocity & Sprint Tracking',
  themeAdaptable = true,
}: KynovLogoProps) {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `kynov-logo-grad-${uniqueId}`;
  const iconGradId = `kynov-icon-grad-${uniqueId}`;

  // Resolve pixel dimensions based on size prop
  let height = 32;
  if (typeof size === 'number') {
    height = size;
  } else {
    switch (size) {
      case 'xs':
        height = 20;
        break;
      case 'sm':
        height = 26;
        break;
      case 'lg':
        height = 42;
        break;
      case 'xl':
        height = 56;
        break;
      case 'md':
      default:
        height = 32;
        break;
    }
  }

  const isIconOnly =
    variant === 'icon' ||
    variant === 'monogram' ||
    showWordmark === false;

  const isMonochrome = variant === 'monochrome';
  const isBoxed = variant === 'boxed';

  // Aspect ratio for full logo: 920 x 260
  const fullWidth = Math.round(height * (920 / 260));

  // 1. Icon-Only SVG (centered on 300 x 300 viewBox)
  const iconSvg = (
    <svg
      width={height}
      height={height}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105"
      aria-label="Kynov"
      role="img"
    >
      <defs>
        {!isMonochrome && (
          <linearGradient
            id={iconGradId}
            x1="15"
            y1="260"
            x2="285"
            y2="10"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#070A26" />
            <stop offset="35%" stopColor="#141B66" />
            <stop offset="70%" stopColor="#2D3FEA" />
            <stop offset="100%" stopColor="#4F62FF" />
          </linearGradient>
        )}
      </defs>

      <g transform="translate(14, 28)">
        {/* Main outer structure and inner cutouts */}
        <path
          d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z"
          fill={isMonochrome ? 'currentColor' : `url(#${iconGradId})`}
          fillRule="evenodd"
        />

        {/* Lower diagonal leg */}
        <path
          d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z"
          fill={isMonochrome ? 'currentColor' : `url(#${iconGradId})`}
        />
      </g>
    </svg>
  );

  // If icon-only is requested
  if (isIconOnly) {
    if (isBoxed) {
      return (
        <div
          className={`inline-flex items-center justify-center p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md transition-all duration-300 group ${className}`}
        >
          {iconSvg}
        </div>
      );
    }
    return <span className={`inline-flex items-center select-none ${className}`}>{iconSvg}</span>;
  }

  // 2. Full Lockup SVG (Mark + Wordmark, ViewBox: 0 0 920 260)
  const fullSvg = (
    <svg
      width={fullWidth}
      height={height}
      viewBox="0 0 920 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-opacity duration-200"
      aria-label="Kynov"
      role="img"
    >
      <defs>
        {!isMonochrome && (
          <linearGradient
            id={gradId}
            x1="10"
            y1="245"
            x2="275"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#070A26" />
            <stop offset="35%" stopColor="#141B66" />
            <stop offset="70%" stopColor="#2D3FEA" />
            <stop offset="100%" stopColor="#4F62FF" />
          </linearGradient>
        )}
      </defs>

      {/* Kynov Monogram Mark */}
      <g transform="translate(10, 8)">
        <path
          d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z"
          fill={isMonochrome ? 'currentColor' : `url(#${gradId})`}
          fillRule="evenodd"
        />
        <path
          d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z"
          fill={isMonochrome ? 'currentColor' : `url(#${gradId})`}
        />
      </g>

      {/* Kynov Wordmark with Theme Adaptability */}
      <text
        x="340"
        y="188"
        fontFamily="Plus Jakarta Sans, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
        fontSize="168"
        fontWeight="800"
        letterSpacing="-0.04em"
        className={
          isMonochrome
            ? 'fill-current'
            : themeAdaptable
            ? 'fill-[#151A33] dark:fill-[#F8FAFC] transition-colors duration-200'
            : 'fill-[#151A33]'
        }
      >
        Kynov
      </text>
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {fullSvg}
      {showSubtitle && (
        <span
          className="hidden sm:inline-block font-medium tracking-normal text-slate-400 dark:text-slate-500 border-l border-slate-300 dark:border-slate-700 pl-2.5 transition-colors whitespace-nowrap"
          style={{ fontSize: `${Math.max(10, height * 0.35)}px` }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

export default KynovLogo;
