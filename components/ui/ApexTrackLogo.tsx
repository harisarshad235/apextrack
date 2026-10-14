'use client';

import React from 'react';
import { KynovLogo, KynovLogoProps } from '@/components/brand/KynovLogo';

export type ApexTrackLogoProps = KynovLogoProps;

/**
 * Backward-compatible wrapper forwarding to KynovLogo.
 */
export function ApexTrackLogo(props: ApexTrackLogoProps) {
  return <KynovLogo {...props} />;
}

export { KynovLogo };
export default KynovLogo;
