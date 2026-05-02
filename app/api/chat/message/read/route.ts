import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/Options';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';

interface CustomSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = (await getServerSession(authOptions)) as CustomSession;
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new NextResponse('Conversation ID is required', { status: 400 });
    }

    const { messageIds } = await req.json();

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return new NextResponse('Message IDs are required', { status: 400 });
    }

    // Verify the user is a participant in this conversation
    const isParticipant = await Prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    });

    if (!isParticipant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Mark messages as read
    const result = await Prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        conversationId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
