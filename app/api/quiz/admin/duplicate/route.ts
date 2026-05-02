import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 },
      );
    }

    const originalQuiz = await Prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!originalQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const duplicatedQuiz = await Prisma.$transaction(
      async (tx) => {
        const newQuiz = await tx.quiz.create({
          data: {
            title: `Copy of ${originalQuiz.title}`,
            description: originalQuiz.description,
            category: originalQuiz.category,
            difficulty: originalQuiz.difficulty,
            image: originalQuiz.image,
            imageId: originalQuiz.imageId,
            tags: originalQuiz.tags,
            status: 'DRAFT',
            timeLimit: originalQuiz.timeLimit,
            passingScore: originalQuiz.passingScore,
          },
        });

        // ✅ Run all question creates in parallel instead of sequentially
        await Promise.all(
          originalQuiz.questions.map((question) =>
            tx.question.create({
              data: {
                text: question.text,
                image: question.image,
                imageId: question.imageId,
                order: question.order,
                quizId: newQuiz.id,
                options: {
                  create: question.options.map((option) => ({
                    text: option.text,
                    isCorrect: option.isCorrect,
                    explanation: option.explanation,
                  })),
                },
              },
            }),
          ),
        );

        return newQuiz;
      },
      { timeout: 15000 }, // ✅ 15s timeout as a safety net
    );

    return NextResponse.json(duplicatedQuiz, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to duplicate quiz' },
      { status: 500 },
    );
  }
}
