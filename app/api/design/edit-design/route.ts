import { type NextRequest, NextResponse } from 'next/server';
import { UploadImage } from '@/components/helper/image/UploadImage';
import Prisma from '@/lib/prisma';
import cloudinary from '@/utils/cloudinary';

// Helper function to get string value from form data
function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return new NextResponse('Invalid Request Id', { status: 400 });
    }

    const design = await Prisma.design.findUnique({ where: { id } });
    if (!design) {
      return new NextResponse('Design not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(design), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();
    const designId = getStringValue(formData, 'productId');

    if (!designId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const name = getStringValue(formData, 'name');
    const description = getStringValue(formData, 'description');
    const category = getStringValue(formData, 'category');
    const subcategory = getStringValue(formData, 'subcategory');
    const tags = getStringValue(formData, 'tags')
      .split(',')
      .map((tag) => tag.trim());
    const deletedImage = getStringValue(formData, 'deletedImage');
    const imageFile = formData.get('image') as Blob;

    // Check if the design exists
    const currentDesign = await Prisma.design.findUnique({
      where: { id: designId },
    });
    if (!currentDesign) {
      return new NextResponse('Design not found', { status: 404 });
    }

    // Handle image deletion if flagged
    if (deletedImage && currentDesign.imageId) {
      const deleteResult = await cloudinary.uploader.destroy(
        currentDesign.imageId,
      );
      if (deleteResult.result !== 'ok') {
        return new NextResponse('Error deleting image', { status: 400 });
      }
    }

    // Upload new image if provided
    let imageUrl = { secure_url: '', public_id: '' };
    if (imageFile) {
      imageUrl = await UploadImage(imageFile, 'designs/');
    }

    // Construct partial update data
    // biome-ignore lint: error
    const updatedData: any = {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(tags.length > 0 && { tags }),
      ...(imageUrl.secure_url && {
        image: imageUrl.secure_url,
        imageId: imageUrl.public_id,
      }),
    };

    // Perform the update operation
    const updatedDesign = await Prisma.design.update({
      where: { id: designId },
      data: updatedData,
    });

    return NextResponse.json({
      message: 'Design updated successfully',
      design: updatedDesign,
    });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
