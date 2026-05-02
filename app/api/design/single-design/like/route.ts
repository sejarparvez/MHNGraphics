import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 30, '1 m', 'like');
  if (limit) return limit;

  try {
    const body = await req.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return NextResponse.json(
        { message: 'Missing post ID or user ID' },
        { status: 400 },
      );
    }

    const existingLike = await Prisma.like.findFirst({
      where: {
        userId,
        designId: postId,
      },
    });

    if (existingLike) {
      // Remove like if it exists
      await Prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json(
        { message: 'Like removed', status: 'success' },
        { status: 200 },
      );
    } else {
      // Add like if it does not exist
      await Prisma.like.create({
        data: {
          userId,
          designId: postId,
        },
      });

      return NextResponse.json(
        { message: 'Like added', status: 'success' },
        { status: 201 },
      );
    }
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
