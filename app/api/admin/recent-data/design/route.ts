import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  try {
    const designs = await Prisma.design.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
      take: 5,
    });

    return new NextResponse(JSON.stringify(designs), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
