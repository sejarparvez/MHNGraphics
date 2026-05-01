import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token)
      return NextResponse.json({ message: 'Token not found' }, { status: 401 });

    const id = token.sub;

    const userData = await Prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        createdAt: true,
        bio: true,
        status: true,
        applications: {
          select: {
            id: true,
            studentName: true,
            duration: true,
            image: true,
            status: true,
            course: true,
            createdAt: true,
            certificate: true,
            roll: true,
            editable: true,
          },
        },
        design: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Return a 404 if the user doesn't exist
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json(userData, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    // Return an error response
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 },
    );
  }
}
