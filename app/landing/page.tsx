import { connection } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { LandingPage } from '@/components/landing/LandingPage';

export const dynamic = 'force-dynamic';

export default async function ExplicitLandingPage() {
  await connection();
  const currentUser = await getCurrentUser();
  return <LandingPage currentUser={currentUser} />;
}
