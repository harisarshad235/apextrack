'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

function SessionRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isPreview =
      searchParams.get('overview') === 'true' ||
      searchParams.get('preview') === 'true';

    // Fast in-browser session cookie check without D1 database queries
    const cookies = typeof document !== 'undefined' ? document.cookie : '';
    const hasSession =
      cookies.includes('kynov_session=') ||
      cookies.includes('apex_session=') ||
      cookies.includes('kynov_dev_user_id=') ||
      cookies.includes('apex_session_user_id=');

    if (hasSession && !isPreview) {
      router.replace('/dashboard');
    }
  }, [router, searchParams]);

  return null;
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <SessionRedirector />
      </Suspense>
      <LandingPage />
    </>
  );
}
