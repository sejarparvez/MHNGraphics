import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import Prisma from '@/lib/prisma';
import cloudinary from '@/utils/cloudinary';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req, ['ADMIN']);
  if (authError) return authError;

  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const page = queryParams.get('page')
      ? // biome-ignore lint: error
        parseInt(queryParams.get('page')!, 10)
      : 1;
    const limit = queryParams.get('pageSize')
      ? // biome-ignore lint: error
        parseInt(queryParams.get('pageSize')!, 10)
      : 30;
    const searchQuery = queryParams.get('searchQuery') || '';
    const skip = (page - 1) * limit;

    // Define where clause for verified users
    const whereClause = {
      emailVerified: { not: null }, // Only fetch users with a non-null emailVerified date
      ...(searchQuery && {
        name: {
          contains: searchQuery,
          mode: 'insensitive' as const, // Using "insensitive" with TypeScript const assertion
        },
      }),
    };

    // Fetch verified users with pagination and filtering
    const response = await Prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        image: true,
        status: true,
        createdAt: true,
      },
    });

    // Get total count of verified users for pagination metadata
    const totalCount = await Prisma.user.count({
      where: whereClause,
    });

    const result = {
      data: response,
      meta: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(result, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
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

    // Validate ID
    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Retrieve the user by ID
    const user = await Prisma.user.findUnique({
      where: { id },
    });

    // Check if the user exists
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Prevent deletion of admin accounts
    if (user.status?.toUpperCase() === 'ADMIN') {
      return new NextResponse('Admin accounts cannot be deleted', {
        status: 403,
      });
    }

    // Delete user's image from Cloudinary, if any
    if (user.imageId) {
      const userImageResult = await cloudinary.uploader.destroy(user.imageId);
      if (userImageResult.result !== 'ok') {
        return new NextResponse('Failed to delete user profile image', {
          status: 500,
        });
      }
    }

    // Fetch all designs by the user to delete their images from Cloudinary
    const designs = await Prisma.design.findMany({
      where: { authorId: id },
      select: { imageId: true },
    });

    // Delete each design image from Cloudinary
    for (const design of designs) {
      if (design.imageId) {
        const designImageResult = await cloudinary.uploader.destroy(
          design.imageId,
        );
        if (designImageResult.result !== 'ok') {
          // biome-ignore lint: error
          console.error(
            `Failed to delete design image: ${design.imageId}`,
            designImageResult,
          );
        }
      }
    }
    // Delete all design by the user
    await Prisma.design.deleteMany({
      where: {
        authorId: user.id,
      },
    });

    // Delete all comments by the user
    await Prisma.comment.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Delete user application
    await Prisma.application.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Delete the user (cascade deletes associated records)
    await Prisma.user.delete({
      where: { id },
    });

    return new NextResponse('User and associated data deleted successfully', {
      status: 200,
    });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
