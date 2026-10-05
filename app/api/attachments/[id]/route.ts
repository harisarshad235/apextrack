import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getBucket, getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { attachments } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const bucket = getBucket();

    const att = await db.query.attachments.findFirst({
      where: eq(attachments.id, id),
    });

    if (!att) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    const object = await bucket.get(att.r2Key);

    if (!object) {
      return NextResponse.json({ error: 'File object missing from storage' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', att.contentType || 'application/octet-stream');
    headers.set(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(att.fileName)}"`
    );
    headers.set('Content-Length', att.sizeBytes.toString());

    return new Response(object.body as ReadableStream, {
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch attachment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['Admin', 'Member']);
    const { id } = await params;
    const db = getDb();
    const bucket = getBucket();

    const att = await db.query.attachments.findFirst({
      where: eq(attachments.id, id),
    });

    if (att) {
      await bucket.delete(att.r2Key);
      await db.delete(attachments).where(eq(attachments.id, id));
    }

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
