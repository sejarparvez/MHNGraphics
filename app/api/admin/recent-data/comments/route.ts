import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token)
      return NextResponse.json({ message: 'Token not found' }, { status: 401 });

    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    const page = queryParams.get('page')
      ? // biome-ignore lint: error
        parseInt(queryParams.get('page')!, 10)
      : 1;
    const pageSize = queryParams.get('pageSize')
      ? // biome-ignore lint: error
        parseInt(queryParams.get('pageSize')!, 10)
      : 10;
    const searchQuery = queryParams.get('searchQuery')?.trim() || '';

    const limit = pageSize;
    const skip = (page - 1) * limit;

    const whereClause: {
      userId?: string;
      content?: { contains: string; mode: 'insensitive' };
    } = {};

    // Role-based filtering: Admin gets all, normal users get only their comments
    if (token.role !== 'ADMIN') {
      whereClause.userId = token.sub;
    }

    // Apply search filter if a search query is provided
    if (searchQuery) {
      whereClause.content = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    // Fetch comments with filtering and pagination
    const comments = await Prisma.comment.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        design: { select: { id: true, name: true } },
        user: { select: { name: true, image: true } },
      },
    });

    // Get the total count for pagination metadata
    const totalCount = await Prisma.comment.count({ where: whereClause });

    return NextResponse.json(
      {
        data: comments,
        meta: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
