import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LandingPage } from '@/components/landing/LandingPage';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection(); // Ensures request-time evaluation for Cloudflare Workers D1 bindings

  const resolvedParams = searchParams ? await searchParams : {};
  const isPreview =
    resolvedParams.overview === 'true' ||
    resolvedParams.preview === 'true';

  const currentUser = await getCurrentUser();

  // If user is already authenticated and didn't explicitly request marketing overview, route to workspace
  if (currentUser && !isPreview) {
    redirect('/dashboard');
  }

  return <LandingPage currentUser={currentUser} />;
}
