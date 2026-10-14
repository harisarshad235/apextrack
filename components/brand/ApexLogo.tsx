'use client';

import React from 'react';
import { KynovLogo, KynovLogoProps } from './KynovLogo';

export type ApexLogoProps = KynovLogoProps;

/**
 * Backwards-compatible alias forwarding to KynovLogo.
 */
export function ApexLogo(props: ApexLogoProps) {
  return <KynovLogo {...props} />;
}

export default ApexLogo;
