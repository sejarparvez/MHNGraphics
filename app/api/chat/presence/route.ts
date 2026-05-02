import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/Options';
import { validateCsrf } from '@/lib/csrf';
import { getUserStatus, updateUserStatus } from '@/lib/presence';

interface CustomSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

// API route to update user's online status
export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = (await getServerSession(authOptions)) as CustomSession;
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { isOnline } = await req.json();

    if (typeof isOnline !== 'boolean') {
      return new NextResponse('Invalid status', { status: 400 });
    }

    await updateUserStatus(session.user.id, isOnline);

    return new NextResponse('Success', { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// API route to get user's online status
export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession;
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const status = await getUserStatus(userId);

    if (!status) {
      return new NextResponse('User not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(status), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
