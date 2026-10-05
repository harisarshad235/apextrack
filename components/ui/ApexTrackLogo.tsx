import React from 'react';

interface ApexTrackLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export function ApexTrackLogo({
  size = 36,
  className = '',
  showGlow = true,
}: ApexTrackLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ApexTrack Logo"
    >
      <defs>
        {/* Background Squircle Gradient */}
        <linearGradient id="apexBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Primary Track Gradient (Electric Blue -> Cyan) */}
        <linearGradient id="apexTrackBlue" x1="8" y1="32" x2="20" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Secondary Track Gradient (Indigo -> Electric Blue) */}
        <linearGradient id="apexTrackIndigo" x1="20" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="40%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Crossbar & Accent Gradient */}
        <linearGradient id="apexAccent" x1="12" y1="22" x2="28" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Subtle Ambient Glow */}
        {showGlow && (
          <filter id="apexGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="10"
        fill="url(#apexBg)"
        stroke="#1E293B"
        strokeWidth="1.5"
      />

      {/* Outer Dual-Track Apex Chevron (Left Ascending Wing) */}
      <path
        d="M 9.5 30 L 19 8.5 C 19.4 7.6 20.6 7.6 21 8.5 L 30.5 30 C 30.9 30.8 30.2 31.8 29.3 31.8 L 26.2 31.8 C 25.6 31.8 25.1 31.4 24.8 30.8 L 20 18.5 L 15.2 30.8 C 14.9 31.4 14.4 31.8 13.8 31.8 L 10.7 31.8 C 9.8 31.8 9.1 30.8 9.5 30 Z"
        fill="url(#apexTrackBlue)"
      />

      {/* Outer Dual-Track Right Wing Overlay (for Indigo depth) */}
      <path
        d="M 20 8.5 C 20.3 7.8 20.7 7.8 21 8.5 L 30.5 30 C 30.9 30.8 30.2 31.8 29.3 31.8 L 26.2 31.8 C 25.6 31.8 25.1 31.4 24.8 30.8 L 20 18.5 Z"
        fill="url(#apexTrackIndigo)"
        opacity="0.95"
      />

      {/* Inner Chevron Track (Creating the distinctive dual-track agile speedway) */}
      <path
        d="M 14.5 29 L 19.3 18 C 19.6 17.3 20.4 17.3 20.7 18 L 25.5 29"
        stroke="#020617"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Geometric Dynamic Crossbar - Forms Letter "A" */}
      <path
        d="M 13.5 23.5 L 26.5 23.5 C 27.2 23.5 27.6 24.4 27.1 24.9 L 25.5 26.5 C 25.2 26.8 24.8 27 24.4 27 L 15.6 27 C 15.2 27 14.8 26.8 14.5 26.5 L 12.9 24.9 C 12.4 24.4 12.8 23.5 13.5 23.5 Z"
        fill="url(#apexAccent)"
        filter={showGlow ? "url(#apexGlow)" : undefined}
      />

      {/* Apex Chevron Peak Accent Point */}
      <circle cx="20" cy="8.5" r="1.5" fill="#38BDF8" />
    </svg>
  );
}
