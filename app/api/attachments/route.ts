import { NextResponse } from 'next/server';
import { getBucket, getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { attachments } from '@/db/schema';
import { revalidatePath } from 'next/cache';

import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizePlainText } from '@/lib/sanitize';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);

    // Rate limiting: max 15 uploads per minute
    const clientIp = await getClientIp();
    const rateLimit = await checkRateLimit(`upload:${currentUser.id || clientIp}`, 15, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const rawIssueKey = (formData.get('issueKey') as string) || null;
    const rawDocumentId = (formData.get('documentId') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit (25MB)' },
        { status: 413 }
      );
    }

    const issueKey = rawIssueKey ? sanitizePlainText(rawIssueKey.trim()) : null;
    const documentId = rawDocumentId ? sanitizePlainText(rawDocumentId.trim()) : null;

    if (issueKey && !/^[A-Za-z0-9_-]+$/.test(issueKey)) {
      return NextResponse.json({ error: 'Invalid issue key format' }, { status: 400 });
    }
    if (documentId && !/^[A-Za-z0-9_-]+$/.test(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
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
    const status = message.includes('Unauthenticated') ? 401 : message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
