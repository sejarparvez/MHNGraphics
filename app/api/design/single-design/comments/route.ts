import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const token = await getToken({ req, secret });
    if (!token) {
      return new NextResponse('You are not authenticated', { status: 401 });
    }

    const body = await req.json();
    const { comment, designId } = body;

    if (!comment || !designId) {
      return NextResponse.json(
        { message: 'Missing required fields: comment or designId' },
        { status: 400 },
      );
    }

    await Prisma.comment.create({
      data: {
        content: comment,
        userId: token.id as string,
        designId: designId,
      },
    });

    return new NextResponse('Comment submitted successfully', { status: 201 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const token = await getToken({ req, secret });

    if (!token) {
      return new NextResponse('You are not authenticated', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return new NextResponse('CommentId not found', { status: 404 });
    }

    //
    // Fetch the comment to verify ownership or admin privileges
    const comment = await Prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true }, // Include user to check ownership
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }
    if (token.role !== 'ADMIN' && token.sub !== comment.userId) {
      return new NextResponse('You are not authorized', { status: 403 });
    }

    // Delete the comment
    await Prisma.comment.delete({
      where: { id: commentId },
    });

    return new NextResponse('Comment deleted successfully', { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
