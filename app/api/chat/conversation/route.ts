import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/Options';
import type { CustomSession } from '../../profile/route';

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = (await getServerSession(authOptions)) as CustomSession;
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const currentUser = await Prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if conversation already exists between these users
    const existingConversation = await Prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: currentUser.id,
              },
            },
          },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create a new conversation
    const newConversation = await Prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: currentUser.id }, { userId }],
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(newConversation);
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession;
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversations = await Prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Shape response to include "otherUser" and "lastMessage"
    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.user.id !== userId,
      );

      return {
        id: conv.id,
        otherUser: otherParticipant?.user ?? null,
        lastMessage: conv.messages[0] ?? null,
        updatedAt: conv.updatedAt,
      };
    });

    return new NextResponse(JSON.stringify(formatted), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
