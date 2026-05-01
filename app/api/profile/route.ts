import { type NextRequest, NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import Prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/Options';

export interface CustomSession extends Session {
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
    const id = req.nextUrl.searchParams.get('id');
    const take = parseInt(req.nextUrl.searchParams.get('take') || '30', 10);
    const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0', 10); // Get the skip parameter

    if (!id) {
      return new NextResponse('ID parameter is required', { status: 400 });
    }

    // Fetch user data along with total design count
    const response = await Prisma.user.findUnique({
      where: { id },

      select: {
        id: true,
        name: true,
        createdAt: true,
        status: true,
        image: true,
        bio: true,
        email: true,
        phoneNumber: true,
        design: {
          orderBy: {
            createdAt: 'desc',
          },
          take: take,
          skip: skip, // Use skip to prevent duplication
        },
        _count: {
          select: {
            design: true, // Fetch the total count of designs
          },
        },
      },
    });

    if (!response) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(response);
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as CustomSession;

  // Check if user is logged in
  if (!session) {
    return new NextResponse('User not logged in', { status: 401 });
  }

  // Extract authorId and role
  const { role: authorRole } = session.user;

  // Allow only if user is an Administrator or an Author
  if (authorRole !== 'ADMIN') {
    return new NextResponse('Access denied', { status: 403 });
  }
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const userId = queryParams.get('id');
    const data = await req.json();
    if (!userId || !data.status) {
      return new NextResponse('User ID or status not found', { status: 400 });
    }
    const update = await Prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: data.status,
      },
    });
    if (!update) {
      return new NextResponse('Failed to update', { status: 400 });
    }
    return new NextResponse('Updated design', { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
