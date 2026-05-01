import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { UploadImage } from '@/components/helper/image/UploadImage';
import Prisma from '@/lib/prisma';
import cloudinary from '@/utils/cloudinary';
import { authOptions } from '../../auth/[...nextauth]/Options';
import type { CustomSession } from '../../profile/route';

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = getStringValue(formData, 'fullName');
    const birthDate = getStringValue(formData, 'birthDay');
    const bloodGroup = getStringValue(formData, 'bloodGroup');
    const allergies = getStringValue(formData, 'allergies');
    const donatedBefore = getStringValue(formData, 'donatedBefore');
    const diseases = getStringValue(formData, 'diseases');
    const district = getStringValue(formData, 'district');
    const address = getStringValue(formData, 'address');
    const occupation = getStringValue(formData, 'Occupation');
    const number = getStringValue(formData, 'number');
    const number2 = getStringValue(formData, 'number2');

    let imageUrl = { secure_url: '', public_id: '' };
    const imageFile = formData.get('image') as Blob;

    if (imageFile) {
      try {
        imageUrl = await UploadImage(imageFile, 'blood-bank/');
        // biome-ignore lint: error
      } catch (uploadError) {
        return NextResponse.json(
          { message: 'Image upload failed' },
          { status: 500 },
        );
      }
    }

    // Save form data and image URL using Prisma
    const bloodDonation = await Prisma.bloodDonation.create({
      data: {
        name,
        birthDate,
        bloodGroup,
        allergies,
        donatedBefore,
        diseases,
        district,
        address,
        occupation,
        number,
        number2,
        image: imageUrl.secure_url,
        imageId: imageUrl.public_id,
      },
    });

    // Return the response data
    return new NextResponse(JSON.stringify(bloodDonation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    Prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();

    const id = getStringValue(formData, 'id');
    if (!id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    const existingApp = await Prisma.bloodDonation.findUnique({
      where: { id },
    });
    if (!existingApp) {
      return new NextResponse('No data found', { status: 404 });
    }

    let image = existingApp.image;
    let imageId = existingApp.imageId;

    const imageData = formData.get('image') as Blob | null;

    // Delete the old image if a new one is provided
    if (imageData && imageId) {
      const deleteResult = await cloudinary.uploader.destroy(imageId);
      if (deleteResult.result !== 'ok') {
        return new NextResponse('Error deleting previous image', {
          status: 400,
        });
      }
    }

    // Upload the new image if provided
    if (imageData && imageData instanceof Blob) {
      const uploadResult = await UploadImage(imageData, 'blood-bank/');
      image = uploadResult.secure_url;
      imageId = uploadResult.public_id;
    }

    // Prepare updated data
    const updatedData: Record<string, string | Date | null> = {
      name: getStringValue(formData, 'fullName'),
      birthDate: getStringValue(formData, 'birthDay'),
      bloodGroup: getStringValue(formData, 'bloodGroup'),
      allergies: getStringValue(formData, 'allergies'),
      donatedBefore: getStringValue(formData, 'donatedBefore'),
      diseases: getStringValue(formData, 'diseases'),
      district: getStringValue(formData, 'district'),
      address: getStringValue(formData, 'address'),
      occupation: getStringValue(formData, 'Occupation'),
      number: getStringValue(formData, 'number'),
      number2: getStringValue(formData, 'number2'),
      image,
      imageId,
    };

    // Remove null or undefined values
    // biome-ignore lint/suspicious/useIterableCallbackReturn: this is fine
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === '' && delete updatedData[key],
    );

    // Save updated data using Prisma
    const bloodDonation = await Prisma.bloodDonation.update({
      where: { id },
      data: updatedData,
    });

    return new NextResponse(JSON.stringify(bloodDonation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    Prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const page = queryParams.get('page')
      ? // biome-ignore lint: error
        parseInt(queryParams.get('page')!, 10)
      : 1;
    const pageSize = 12;

    const skipCount = (page - 1) * pageSize;

    const searchName = queryParams.get('search') || '';
    const bloodGroup = (queryParams.get('bloodGroup') || 'All').trim();

    const allUsers = await Prisma.bloodDonation.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        number: true,
        number2: true,
        district: true,
        address: true,
        diseases: true,
        allergies: true,
        birthDate: true,
        bloodGroup: true,
        donatedBefore: true,
      },

      where: {
        name: {
          contains: searchName,
          mode: 'insensitive',
        },

        ...(bloodGroup !== 'All' && { bloodGroup: { equals: bloodGroup } }),
      },

      skip: skipCount,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalUsersCount = await Prisma.bloodDonation.count({
      where: {
        name: {
          contains: searchName,
          mode: 'insensitive',
        },
        ...(bloodGroup !== 'All' && { bloodGroup: { equals: bloodGroup } }),
      },
    });

    if (allUsers.length > 0) {
      return new NextResponse(
        JSON.stringify({ users: allUsers, count: totalUsersCount }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } else {
      return new NextResponse('No users found.', { status: 200 });
    }
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  } finally {
    Prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession;

    // Check if the user is logged in
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'User not logged in' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { role: authorRole } = session.user;

    // Check if the user is an admin
    if (authorRole !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Only admins have access to this' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const id = queryParams.get('id');

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID not provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Fetch the user details
    const user = await Prisma.bloodDonation.findUnique({
      where: { id },
      select: {
        id: true,
        image: true,
        imageId: true,
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the associated image from Cloudinary
    if (user.imageId) {
      const result = await cloudinary.uploader.destroy(user.imageId);
      if (result.result !== 'ok') {
        return new NextResponse(
          JSON.stringify({ error: 'Error deleting the previous image' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    // Delete the user record from the database
    await Prisma.bloodDonation.delete({
      where: { id },
    });

    return new NextResponse(
      JSON.stringify({ message: 'User deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  } finally {
    await Prisma.$disconnect();
  }
}
