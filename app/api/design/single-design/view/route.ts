import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

//  Create a new POST endpoint for view counting
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const cookieName = `viewed_${id}`;

    if (!id) {
      return new NextResponse('Missing ID', { status: 400 });
    }

    // Check for existing view cookie
    const hasViewed = req.cookies.get(cookieName)?.value;

    if (hasViewed) {
      const design = await Prisma.design.findUnique({
        where: { id },
        select: { viewCount: true },
      });
      return NextResponse.json({ viewCount: design?.viewCount || 0 });
    }

    // Increment view count if new viewer
    const updatedDesign = await Prisma.design.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const response = NextResponse.json({
      viewCount: updatedDesign.viewCount,
    });

    // Set cookie to prevent duplicate counts (24 hours)
    response.cookies.set(cookieName, 'true', {
      maxAge: 86400,
      path: '/',
      sameSite: 'lax',
    });

    return response;
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
