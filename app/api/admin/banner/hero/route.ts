import { type NextRequest, NextResponse } from 'next/server';
import { UploadImage } from '@/components/helper/image/UploadImage';
import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import { HeroBannerSchema } from '@/lib/Schemas';

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string | null;
    const slogan = formData.get('slogan') as string | null;
    const bannerPosition = (formData.get('bannerPosition') as string) || 'hero';
    const alignment = (formData.get('alignment') as string) || 'left';
    const tag = formData.get('tag') as string | null;
    const isActive = formData.get('isActive') === 'true';
    const imageFile = formData.get('image') as Blob | null;

    // Validate with Zod schema
    const validationResult = HeroBannerSchema.safeParse({
      title,
      subtitle,
      slogan,
      bannerPosition,
      alignment,
      tag,
      isActive,
      image: imageFile ?? undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Ensure imageFile is not null at this point (validated by Zod)
    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const { secure_url, public_id } = await UploadImage(
      imageFile,
      'hero-banners',
    );

    const banner = await Prisma.heroBanner.create({
      data: {
        title,
        subtitle: subtitle || null,
        slogan: slogan || null,
        image: secure_url,
        imageId: public_id,
        bannerPosition,
        alignment,
        tag: tag || null,
        isActive,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create hero banner' },
      { status: 500 },
    );
  }
}
