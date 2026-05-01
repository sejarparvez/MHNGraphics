import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  try {
    const designCount = await Prisma.design.count();
    const subscriberCount = await Prisma.subscriber.count();
    const commentsCount = await Prisma.comment.count();
    const userCount = await Prisma.user.count();
    const applicationCount = await Prisma.application.count();

    const data = {
      designCount,
      subscriberCount,
      commentsCount,
      userCount,
      applicationCount,
    };

    return new NextResponse(JSON.stringify(data));
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
