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
      : 1;
    const category = queryParams.get('category') || 'all';
    const searchQuery = queryParams.get('searchQuery') || '';

    const limit = pageSize;
    const skip = (page - 1) * limit;

    const whereClause: {
      authorId?: string | undefined;
      category?: string;
      name?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {};

    if (category !== 'all') {
      whereClause.category = category;
    }

    if (token.role !== 'ADMIN') {
      whereClause.authorId = token.sub;
    }
    if (searchQuery) {
      whereClause.name = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    // Fetch designs with pagination and filtering
    const response = await Prisma.design.findMany({
      where: whereClause, // Add the where clause here
      skip,
      take: limit,

      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Get the total count of designs for pagination metadata with filtering
    const totalCount = await Prisma.design.count({
      where: whereClause, // Add the where clause here
    });

    const result = {
      data: response,
      meta: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(result, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
