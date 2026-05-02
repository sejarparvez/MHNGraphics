import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/Options';
import { AblyService } from '@/lib/ably';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

interface CustomSession extends Session {
  user: {
    name: string;
    email: string;
    image: string;
    id: string;
    role: string; // Add any other roles you may have
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession;

    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    if (!conversationId) {
      return new NextResponse(
        JSON.stringify({ message: 'Conversation ID is required' }),
        {
          status: 400,
        },
      );
    }

    if (Number.isNaN(limit) || limit <= 0) {
      return new NextResponse(JSON.stringify({ message: 'Invalid limit' }), {
        status: 400,
      });
    }

    const currentUser = await Prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!currentUser) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
      });
    }

    const isParticipant = await Prisma.conversationParticipant.count({
      where: {
        conversationId,
        userId: currentUser.id,
      },
    });

    if (!isParticipant) {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      });
    }

    const messages = await Prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Fire-and-forget mark-as-read
    Prisma.message
      .updateMany({
        where: {
          conversationId,
          receiverId: currentUser.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
      // biome-ignore lint: error
      .catch((err) => console.error('Failed to mark messages as read:', err));

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;

    return new NextResponse(
      JSON.stringify({
        items: messages.reverse(),
        nextCursor,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 30, '1 h', 'chat-message');
  if (limit) return limit;

  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = (await getServerSession(authOptions)) as CustomSession;
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { content } = await req.json();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!content || !conversationId) {
      return new NextResponse('Content is required', { status: 400 });
    }

    const currentUser = await Prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the conversation and check if the current user is a participant
    const conversation = await Prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.userId === currentUser.id,
    );

    if (!isParticipant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Find the other participant to set as receiver
    const otherParticipant = conversation.participants.find(
      (participant) => participant.userId !== currentUser.id,
    );

    if (!otherParticipant) {
      return new NextResponse('Receiver not found', { status: 404 });
    }

    // Create the message
    const message = await Prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId: otherParticipant.userId,
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation's updatedAt
    await Prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Publish to Ably
    const ably = AblyService.getInstance();
    const channel = ably.channels.get(`conversation:${conversationId}`);
    await channel.publish('new-message', message);

    return NextResponse.json(message);
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
