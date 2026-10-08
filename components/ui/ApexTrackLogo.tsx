'use client';

import React from 'react';
import { ApexLogo } from '@/components/brand/ApexLogo';

export interface ApexTrackLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

/**
 * Backward-compatible wrapper forwarding to the new minimalist enterprise ApexLogo.
 */
export function ApexTrackLogo({
  size = 36,
  className = '',
}: ApexTrackLogoProps) {
  return <ApexLogo size={size} showWordmark={false} className={className} />;
}

export default ApexTrackLogo;
