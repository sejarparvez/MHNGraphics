import { authOptions } from '@/app/api/auth/[...nextauth]/Options';
import type { CustomSession } from '@/app/api/profile/route';
import Prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession;
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return new NextResponse('Query parameter is required', { status: 400 });
    }

    const currentUser = await Prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Search for users by name or email
    const users = await Prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        NOT: {
          id: currentUser.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
