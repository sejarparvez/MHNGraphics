import type { DesignStatus } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { SlugToText } from '@/components/helper/slug/SlugToText';
import Prisma from '@/lib/prisma';

// Helper function to normalize text to lowercase
const normalizeText = (text: string) => text.trim().toLowerCase();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    const page = queryParams.get('page')
      ? // biome-ignore lint: error
        parseInt(queryParams.get('page')!, 10)
      : 1;
    const category = queryParams.get('category') || 'all';
    const searchQuery = queryParams.get('searchQuery') || '';

    // Ensure tag is valid before applying transformation
    const tagParam = queryParams.get('tag');
    const tag = tagParam ? SlugToText(tagParam) : '';

    const limit = 30;
    const skip = (page - 1) * limit;

    const whereClause: {
      category?: string;
      status?: DesignStatus;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        category?: { contains: string; mode: 'insensitive' };
        tags?: { has: string };
      }>;
      tags?: { has: string };
    } = { status: 'PUBLISHED' }; // Default status is "PUBLISHED"

    if (category !== 'all') {
      whereClause.category = category;
    }

    // Handle search query filtering
    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: normalizeText(searchQuery) } }, // Case-insensitive tag search by normalized value
      ];
    }

    // Handle tag filter
    if (tag) {
      whereClause.tags = { has: normalizeText(tag) }; // Filters for a specific tag with case insensitivity
    }

    // Fetch designs with pagination and filtering
    const response = await Prisma.design.findMany({
      where: whereClause,
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
      where: whereClause,
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
