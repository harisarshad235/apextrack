import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getWorkspaceData } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Account pending approval', status: 'PENDING' },
        { status: 403 }
      );
    }

    const workspaceData = await getWorkspaceData();

    return NextResponse.json(
      {
        currentUser,
        ...workspaceData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error fetching dashboard data' },
      { status: 500 }
    );
  }
}
