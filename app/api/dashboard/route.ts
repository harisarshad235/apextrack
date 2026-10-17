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

    if (currentUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account suspended by an administrator', status: 'SUSPENDED' },
        { status: 403 }
      );
    }

    // In the Linear / Jira workspace model:
    // Newly registered users receive workspace viewing access with zero assigned projects
    // until an administrator or project manager adds them to project_members.
    const workspaceData = await getWorkspaceData(currentUser);

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
