import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams;
    const postId = search.get('id');

    if (!postId) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const application = await Prisma.application.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!application) {
      return new NextResponse('Resource not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify({ application }));
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await Prisma.$disconnect();
  }
}
