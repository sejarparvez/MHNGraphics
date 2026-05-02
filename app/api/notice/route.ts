import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { NoticeSchema } from '@/lib/Schemas';
import { deletePDF, UploadPDF } from '@/utils/cloudinary';

const ALLOWED_ORIGINS = ['https://www.training.oylkka.com'];

function corsHeaders(origin: string | null): Record<string, string> | null {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }
  return null;
}

export async function OPTIONS(req: NextRequest) {
  const headers = corsHeaders(req.headers.get('origin'));
  return new NextResponse(null, { status: 204, headers: headers || undefined });
}

// POST: Upload a PDF and save a new Notice record
export async function POST(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const pdf = formData.get('pdf') as File;

    // Validate with Zod schema
    const validationResult = NoticeSchema.safeParse({ title, pdf });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Upload the PDF to Cloudinary in the "notices" folder
    const uploadResult = await UploadPDF(pdf, 'notices');

    // Save notice details into the database
    const notice = await Prisma.notice.create({
      data: {
        title,
        pdfUrl: uploadResult.secure_url,
        pdfPublicId: uploadResult.public_id,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: 'PDF uploaded and notice saved successfully',
        notice,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET: Fetch Notice records with pagination support
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    // Get page and pageSize from the query, with defaults if not provided
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Run both the findMany and count queries in parallel
    const [notices, totalNotices] = await Promise.all([
      Prisma.notice.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      Prisma.notice.count(),
    ]);

    const totalPages = Math.ceil(totalNotices / pageSize);

    return new NextResponse(
      JSON.stringify({
        page,
        pageSize,
        totalPages,
        totalNotices,
        notices,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...(corsHeaders(req.headers.get('origin')) ?? {}),
        },
      },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    // Retrieve the 'id' parameter from the query string.
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Notice ID is required', { status: 400 });
    }

    // Find the notice by its ID.
    const notice = await Prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return new NextResponse('Notice not found', { status: 404 });
    }

    // Optionally delete the associated PDF from Cloudinary if a public ID exists.
    if (notice.pdfPublicId) {
      await deletePDF(notice.pdfPublicId);
    }

    // Delete the notice record from the database.
    await Prisma.notice.delete({
      where: { id },
    });

    return new NextResponse(
      JSON.stringify({ message: 'Notice deleted successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
