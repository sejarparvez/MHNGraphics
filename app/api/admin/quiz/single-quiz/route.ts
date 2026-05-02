import Prisma from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('id');

    if (!slug) {
      return new Response('Bad Request: Missing slug parameter', {
        status: 400,
      });
    }

    const quiz = await Prisma.quiz.findUnique({
      where: {
        id: slug,
      },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        passingScore: true,
        status: true,
        difficulty: true,
        category: true,
        tags: true,
        _count: {
          select: {
            questions: true,
          },
        },

        questions: {
          select: {
            id: true,
            text: true,
            order: true,
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(quiz, { status: 200 });
  } catch (_error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
