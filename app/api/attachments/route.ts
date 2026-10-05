import { NextResponse } from 'next/server';
import { getBucket, getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { attachments } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const issueKey = (formData.get('issueKey') as string) || null;
    const documentId = (formData.get('documentId') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!issueKey && !documentId) {
      return NextResponse.json(
        { error: 'Attachment must be associated with an issue or document' },
        { status: 400 }
      );
    }

    const bucket = getBucket();
    const db = getDb();

    const attId = `att-${Date.now()}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = issueKey
      ? `issues/${issueKey}/${attId}-${sanitizedFileName}`
      : `documents/${documentId}/${attId}-${sanitizedFileName}`;

    // Upload ArrayBuffer to R2
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    // Save metadata in D1
    const newAtt = {
      id: attId,
      issueKey: issueKey || null,
      documentId: documentId || null,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      r2Key,
      uploadedById: currentUser.id,
    };

    await db.insert(attachments).values(newAtt);

    revalidatePath('/');
    return NextResponse.json({ success: true, attachment: newAtt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
