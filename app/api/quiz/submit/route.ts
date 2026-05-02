import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 10, '1 h', 'quiz-submit');
  if (limit) return limit;

  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Token not found' }, { status: 401 });
    }

    const userId = token.sub;
    const { quizId, answers, timeSpent } = await req.json();

    // FIX: Changed validation to allow the Object structure sent by React Hook Form
    if (!quizId || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { message: 'Invalid input structure' },
        { status: 400 },
      );
    }

    const quiz = await Prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    let score = 0;
    const userAnswers = [];

    // FIX: Convert the { [questionId]: optionId } object into an iterable array
    const submittedEntries = Object.entries(answers as Record<string, string>);

    for (const [qId, selectedOptId] of submittedEntries) {
      const question = quiz.questions.find((q) => q.id === qId);

      if (question) {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        const selectedOption = question.options.find(
          (opt) => opt.id === selectedOptId,
        );

        const isCorrect = !!(
          selectedOption &&
          correctOption &&
          selectedOption.id === correctOption.id
        );

        if (isCorrect) {
          score++;
        }

        userAnswers.push({
          questionId: question.id,
          selectedOptionId: selectedOption?.id || null,
          isCorrect: isCorrect,
          correctOptionId: correctOption?.id || null,
        });
      }
    }

    const totalQuestions = quiz.questions.length;
    const passingScore = quiz.passingScore || 0;
    const passed = score >= passingScore;

    // Determine attempt number
    const latestResult = await Prisma.quizResult.findFirst({
      where: {
        userId: userId,
        quizId: quizId,
      },
      orderBy: {
        attemptNumber: 'desc',
      },
    });

    const attemptNumber = latestResult ? latestResult.attemptNumber + 1 : 1;

    // Create the result in the database
    const quizResult = await Prisma.quizResult.create({
      data: {
        // biome-ignore lint/style/noNonNullAssertion: this is fine
        userId: userId!,
        quizId: quizId,
        score: score,
        totalQuestions: totalQuestions,
        answers: userAnswers, // Ensure your Prisma schema allows Json for this field
        timeSpent: timeSpent,
        passed: passed,
        attemptNumber: attemptNumber,
      },
    });

    return NextResponse.json(
      { message: 'Quiz submitted successfully', quizResult },
      { status: 200 },
    );
  } catch (_error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
