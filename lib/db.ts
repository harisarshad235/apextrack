import 'server-only';
import { cache } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from '@/db/schema';

/**
 * Per-request Drizzle client bound to the Cloudflare D1 `apextrack_db` binding.
 * Works in `next dev` (via initOpenNextCloudflareForDev → local Miniflare D1)
 * and in production on Cloudflare Workers/Pages.
 */
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.apextrack_db, { schema });
});

export const getBucket = cache(() => getCloudflareContext().env.ATTACHMENTS);

export type Db = ReturnType<typeof getDb>;
