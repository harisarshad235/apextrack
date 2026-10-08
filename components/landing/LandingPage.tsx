'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { User } from '@/db/schema';

interface LandingPageProps {
  currentUser?: User | null;
}

export function LandingPage({ currentUser }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-zinc-100 transition-colors font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <LandingNavbar currentUser={currentUser} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Interactive Mockup */}
        <LandingHero currentUser={currentUser} />

        {/* Feature Showcase Grid (Sprints, RBAC, Docs, Notifications) */}
        <FeatureGrid />
      </main>

      {/* Footer with Security Badges */}
      <LandingFooter />
    </div>
  );
}
