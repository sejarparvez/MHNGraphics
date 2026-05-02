/** biome-ignore-all lint/suspicious/noExplicitAny: this is fine */

import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const quizData = await req.json();
    const { id, questions, ...rest } = quizData;

    if (!id) {
      return NextResponse.json(
        { message: 'Invalid request, missing quiz ID' },
        { status: 400 },
      );
    }

    const updatedQuiz = await Prisma.$transaction(
      async (tx) => {
        // 1. Update the quiz scalar fields
        const quiz = await tx.quiz.update({
          where: { id },
          data: {
            ...rest,
          },
        });

        // 2. Delete all existing questions for this quiz
        await tx.question.deleteMany({
          where: { quizId: id },
        });

        // 3. Create all questions with their options in a single batch operation
        if (questions && questions.length > 0) {
          await tx.question.createMany({
            data: questions.map((question: any) => ({
              text: question.text,
              image: question.image || null,
              imageId: question.imageId || null,
              order: question.order,
              quizId: id,
            })),
          });

          // 4. Get the newly created questions to link options
          const createdQuestions = await tx.question.findMany({
            where: { quizId: id },
            orderBy: { order: 'asc' },
          });

          // 5. Create all options in batch
          const optionsToCreate = questions.flatMap(
            (question: any, qIndex: number) =>
              question.options.map((option: any) => ({
                text: option.text,
                isCorrect: option.isCorrect,
                explanation: option.explanation || null,
                questionId: createdQuestions[qIndex].id,
              })),
          );

          if (optionsToCreate.length > 0) {
            await tx.option.createMany({
              data: optionsToCreate,
            });
          }
        }

        return quiz;
      },
      {
        maxWait: 10000, // Increase max wait time to 10 seconds
        timeout: 15000, // Increase timeout to 15 seconds
      },
    );

    return NextResponse.json(
      { message: 'Success', quiz: updatedQuiz },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const id = queryParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Invalid query parameter' },
        { status: 400 },
      );
    }

    await Prisma.quiz.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
