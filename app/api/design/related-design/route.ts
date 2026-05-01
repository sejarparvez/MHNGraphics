import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

const SCORE_WEIGHTS = {
  TAG_MATCH: 3,
  CATEGORY_MATCH: 2,
  NAME_MATCH: 2,
  RECENCY: 0.05,
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const id = queryParams.get('id');
    const limit = Math.min(Number(queryParams.get('limit')) || 10, 50);

    // Validate ID
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid ID format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the target design
    const design = await Prisma.design.findUnique({
      where: { id },
    });

    if (!design) {
      return new NextResponse(JSON.stringify({ error: 'Design not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create name conditions by splitting the design name into keywords (ignoring short words)
    const designNameWords = design.name
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 2);
    const nameConditions = designNameWords.map((word) => ({
      name: { contains: word },
    }));

    // Fetch potential related designs using tags, category, or name conditions
    const potentialDesigns = await Prisma.design.findMany({
      where: {
        id: { not: design.id },
        status: 'PUBLISHED',
        OR: [
          { tags: { hasSome: design.tags } },
          { category: design.category },
          ...nameConditions,
        ],
      },
      take: 100, // Retrieve more candidates for better scoring
    });

    // Calculate scores for each potential design
    const scoredDesigns = potentialDesigns.map((d) => {
      // Tag matching score
      const commonTags = d.tags.filter((tag) =>
        design.tags.includes(tag),
      ).length;

      // Name matching score using word intersections
      const candidateNameWords = d.name
        .split(' ')
        .filter((word) => word.length > 2);
      const commonNameWords = candidateNameWords.filter((word) =>
        designNameWords.some(
          (designWord) => designWord.toLowerCase() === word.toLowerCase(),
        ),
      ).length;

      // Recency factor: Favor newer designs (days since creation)
      const daysSinceCreation = Math.floor(
        (Date.now() - d.createdAt.getTime()) / (1000 * 3600 * 24),
      );

      return {
        ...d,
        score:
          commonTags * SCORE_WEIGHTS.TAG_MATCH +
          (d.category === design.category ? SCORE_WEIGHTS.CATEGORY_MATCH : 0) +
          commonNameWords * SCORE_WEIGHTS.NAME_MATCH +
          (1 / (daysSinceCreation + 1)) * SCORE_WEIGHTS.RECENCY,
      };
    });

    // Sort by score descending, select top results, and remove internal scoring data
    const relatedDesigns = scoredDesigns
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...rest }) => rest);

    const response = NextResponse.json({
      data: relatedDesigns,
      count: relatedDesigns.length,
    });

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=1800',
    );

    return response;
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
