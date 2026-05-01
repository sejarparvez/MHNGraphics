import type { DesignStatus } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const category = queryParams.get('category') || 'all';
    const searchQuery = queryParams.get('searchQuery') || '';

    const limit = 5;

    const whereClause: {
      status?: DesignStatus;
      category?: string;
      name?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {};

    if (category !== 'all') {
      whereClause.category = category;
    }
    if (searchQuery) {
      whereClause.name = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    // Fetch designs with pagination and filtering
    const response = await Prisma.design.findMany({
      where: whereClause,
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

    return NextResponse.json(JSON.stringify(response), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
