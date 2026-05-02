import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import cloudinary from '@/utils/cloudinary';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;

    const banner = await Prisma.heroBanner.findUnique({ where: { id } });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    if (banner.imageId) {
      const result = await cloudinary.uploader.destroy(banner.imageId);
      if (result.result !== 'ok') {
        return NextResponse.json(
          { error: 'Failed to delete image from Cloudinary' },
          { status: 400 },
        );
      }
    }

    await Prisma.heroBanner.delete({ where: { id } });

    return NextResponse.json(
      { message: 'Banner deleted successfully' },
      { status: 200 },
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete hero banner' },
      { status: 500 },
    );
  }
}
