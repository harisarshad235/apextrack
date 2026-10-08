import { connection } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { LandingPage } from '@/components/landing/LandingPage';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connection(); // Ensures request-time evaluation for Cloudflare Workers D1 bindings

  const currentUser = await getCurrentUser();

  return <LandingPage currentUser={currentUser} />;
}
