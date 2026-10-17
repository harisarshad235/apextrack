'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { documents } from '@/db/schema';

import { createDocumentSchema, updateDocumentSchema } from '@/lib/schemas';

export async function createDocument(data: {
  title: string;
  category: string;
  content: string;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const parsed = createDocumentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid document payload',
      };
    }

    const validData = parsed.data;
    const db = getDb();
    const docId = `doc-${Date.now()}`;

    await db.insert(documents).values({
      id: docId,
      title: validData.title,
      category: validData.category,
      content: validData.content,
      authorId: currentUser.id,
      updatedById: currentUser.id,
    });

    revalidatePath('/');
    return { success: true, docId, message: 'Document published successfully' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create document';
    return { success: false, error: message };
  }
}

export async function updateDocument(
  id: string,
  data: {
    title?: string;
    category?: string;
    content?: string;
  }
) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const parsed = updateDocumentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid document update payload',
      };
    }

    const validData = parsed.data;
    const db = getDb();

    await db
      .update(documents)
      .set({
        ...validData,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id));

    revalidatePath('/');
    return { success: true, message: 'Document updated successfully' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update document';
    return { success: false, error: message };
  }
}

export async function deleteDocument(id: string) {
  try {
    await requireRole(['Admin']);
    const db = getDb();

    await db.delete(documents).where(eq(documents.id, id));

    revalidatePath('/');
    return { success: true, message: 'Document deleted' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete document';
    return { success: false, error: message };
  }
}
