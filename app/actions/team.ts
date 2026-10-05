'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole, getCurrentUser, DEV_USER_COOKIE } from '@/lib/auth';
import { users, UserRole } from '@/db/schema';

export async function inviteUser(data: {
  name: string;
  email: string;
  role: UserRole;
  department: string;
}) {
  try {
    const adminUser = await requireRole(['Admin']);
    const db = getDb();

    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase().trim()),
    });

    if (existing) {
      return { success: false, error: 'A user with this email address already exists.' };
    }

    const userId = `u-${Date.now()}`;

    await db.insert(users).values({
      id: userId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role,
      status: 'APPROVED', // Invited by Admin directly -> APPROVED
      department: data.department.trim() || 'Engineering',
      avatarUrl: null, // Default to clean initials badge
      approvedById: adminUser.id,
      approvedAt: new Date(),
    });

    revalidatePath('/');
    return { success: true, message: `User ${data.name} invited as ${data.role}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to invite user';
    return { success: false, error: message };
  }
}

export async function approveUser(userId: string) {
  try {
    const adminUser = await requireRole(['Admin']);
    const db = getDb();

    await db
      .update(users)
      .set({
        status: 'APPROVED',
        approvedById: adminUser.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath('/');
    return { success: true, message: 'User approved' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve user';
    return { success: false, error: message };
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const adminUser = await requireRole(['Admin']);
    if (userId === adminUser.id && newRole !== 'Admin') {
      return { success: false, error: 'You cannot revoke your own Admin privileges.' };
    }

    const db = getDb();

    await db
      .update(users)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath('/');
    return { success: true, message: `Updated user role to ${newRole}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user role';
    return { success: false, error: message };
  }
}

export async function removeUser(userId: string) {
  try {
    const adminUser = await requireRole(['Admin']);
    if (userId === adminUser.id) {
      return { success: false, error: 'Cannot remove currently logged-in Admin account.' };
    }

    const db = getDb();

    await db.delete(users).where(eq(users.id, userId));

    revalidatePath('/');
    return { success: true, message: 'Team member removed' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove user';
    return { success: false, error: message };
  }
}

export async function switchPersona(userId: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(DEV_USER_COOKIE, userId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to switch persona';
    return { success: false, error: message };
  }
}

export async function updateUserProfile(data: {
  name?: string;
  department?: string;
  avatarUrl?: string | null;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const db = getDb();
    const updateData: {
      name?: string;
      department?: string;
      avatarUrl?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined && data.name.trim()) {
      updateData.name = data.name.trim();
    }
    if (data.department !== undefined) {
      updateData.department = data.department.trim();
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }

    await db.update(users).set(updateData).where(eq(users.id, currentUser.id));

    revalidatePath('/');
    return { success: true, message: 'Profile and avatar updated' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return { success: false, error: message };
  }
}

