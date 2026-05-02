import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

const QuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  order: z.number().int().nonnegative(),
  image: z.string().optional(),
  imageId: z.string().optional(),
  options: z.array(OptionSchema).min(2, 'At least 2 options are required'),
});

const QuizCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  timeLimit: z.number().int().positive().optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  image: z.string().optional(),
  imageId: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
  scheduledFor: z.coerce.date().optional(),
  questions: z
    .array(QuestionSchema)
    .min(1, 'At least one question is required'),
});

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const validation = QuizCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid data', errors: validation.error.errors },
        { status: 400 },
      );
    }

    const { questions, ...quizData } = validation.data;

    const newQuiz = await Prisma.quiz.create({
      data: {
        ...quizData,
        questions: {
          create: questions.map((q) => ({
            ...q,
            options: {
              create: q.options,
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: newQuiz },
      { status: 201 },
    );
  } catch (_error) {
    return NextResponse.json(
      { message: 'Failed to create quiz' },
      { status: 500 },
    );
  }
}
