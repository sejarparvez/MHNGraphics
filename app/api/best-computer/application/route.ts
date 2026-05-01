import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UploadImage } from '@/components/helper/image/UploadImage';
import { bkashConfig } from '@/lib/bkash';
import Prisma from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';
import { createPayment } from '@/services/bkash';
import { cleanupUserPendingApplications } from '@/utils/applicationCleanup';
import cloudinary from '@/utils/cloudinary';

const myUrl = process.env.NEXT_PUBLIC_SITE_URL;
const secret = process.env.NEXTAUTH_SECRET;

// Utility function to safely retrieve string values
const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

// Utility function to safely retrieve number values
const getNumberValue = (formData: FormData, key: string): number | null => {
  const value = formData.get(key);
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      return NextResponse.json(
        { message: 'User not logged in or userId missing' },
        { status: 401 },
      );
    }

    const existingApplication = await Prisma.application.findFirst({
      where: { userId },
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'User has already submitted an application' },
        { status: 400 },
      );
    }

    const formData = await req.formData();

    const studentName = getStringValue(formData, 'studentName');
    const email = getStringValue(formData, 'email');
    const fatherName = getStringValue(formData, 'fatherName');
    const motherName = getStringValue(formData, 'motherName');
    const birthDay = getStringValue(formData, 'birthDay');
    const bloodGroup = getStringValue(formData, 'bloodGroup');
    const mobileNumber = getStringValue(formData, 'mobileNumber');
    const guardianNumber = getStringValue(formData, 'guardianNumber');
    const gender = getStringValue(formData, 'gender');
    const religion = getStringValue(formData, 'religion');
    const fullAddress = getStringValue(formData, 'fullAddress');
    const district = getStringValue(formData, 'district');
    const education = getStringValue(formData, 'education');
    const board = getStringValue(formData, 'educationBoard');
    const rollNumber = getStringValue(formData, 'rollNumber');
    const regNumber = getStringValue(formData, 'regNumber');
    const passingYear = getStringValue(formData, 'passingYear');
    const gpa = getStringValue(formData, 'gpaCgpa');
    const nid = getStringValue(formData, 'nidBirthReg');
    const nationality = getStringValue(formData, 'nationality');
    const course = getStringValue(formData, 'course');
    const duration = getStringValue(formData, 'duration');
    const pc = getStringValue(formData, 'pc');
    const session = getNumberValue(formData, 'session');
    const transactionId = getStringValue(formData, 'trxId');
    const fatherOccupation = getStringValue(formData, 'fatherOccupation');
    const maritalStatus = getStringValue(formData, 'maritalStatus');

    if (session === null) {
      return NextResponse.json(
        { message: 'Invalid session value' },
        { status: 400 },
      );
    }

    let imageUrl = { secure_url: '', public_id: '' };
    const imageFile = formData.get('image') as Blob;

    if (imageFile) {
      try {
        imageUrl = await UploadImage(imageFile, 'application-images/');
        // biome-ignore lint: error
      } catch (uploadError) {
        return NextResponse.json(
          { message: 'Image upload failed' },
          { status: 500 },
        );
      }
    }

    let roll = 2000;
    const lastApplication = await Prisma.application.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { roll: true },
    });

    if (lastApplication?.roll) {
      roll = lastApplication.roll + 1;
    }

    if (!birthDay || Number.isNaN(Date.parse(birthDay))) {
      return NextResponse.json(
        { message: 'Invalid birth date format. Use ISO format (YYYY-MM-DD)' },
        { status: 400 },
      );
    }

    const birthDate = new Date(birthDay);

    try {
      const newApplication = await Prisma.application.create({
        data: {
          studentName,
          fatherName,
          motherName,
          birthDay: birthDate,
          bloodGroup,
          mobileNumber,
          guardianNumber,
          gender,
          religion,
          fullAddress,
          district,
          education,
          board,
          rollNumber,
          regNumber,
          passingYear,
          gpa,
          nid,
          nationality,
          course,
          duration,
          email,
          pc,
          userId,
          roll,
          transactionId,
          fatherOccupation,
          maritalStatus,
          session,
          image: imageUrl.secure_url,
          imageId: imageUrl.public_id,
          status: 'Pending',
          certificate: 'Pending',
          applicationFee: 'Pending',
          applicationFeeAmount: 0,
          metadata: {
            paymentPending: true,
            paymentMethod: 'BKASH',
          },
        },
      });

      const paymentDetails = {
        amount: 100,
        callbackURL: `${myUrl}/api/best-computer/application/callback?applicationId=${newApplication.id}&userId=${newApplication.userId}`,
        userId: newApplication.userId,
        applicationId: newApplication.id,
        reference: 'application-fee',
        name: newApplication.studentName,
        email: newApplication.email ?? '',
        phone: newApplication.mobileNumber ?? '',
      };

      const createPaymentResponse = await createPayment(
        bkashConfig,
        paymentDetails,
      );

      if (createPaymentResponse.statusCode !== '0000') {
        if (newApplication.imageId) {
          const result = await cloudinary.uploader.destroy(
            newApplication.imageId,
          );
          if (result.result !== 'ok') {
            // biome-ignore lint: error
            console.error('Error deleting image from Cloudinary:', result);
          }
        }

        await Prisma.application.delete({
          where: { id: newApplication.id },
        });

        return NextResponse.json({
          message: 'Payment Failed',
          error: createPaymentResponse.statusMessage,
          paymentMethod: 'BKASH',
        });
      }

      const currentMetadata =
        // biome-ignore lint: error
        (newApplication.metadata as Record<string, any>) || {};

      await Prisma.application.update({
        where: { id: newApplication.id },
        data: {
          applicationFeeAmount: 100,
          metadata: {
            ...currentMetadata,
            paymentInitiated: true,
            initiatedAt: new Date().toISOString(),
            bkashPaymentID: createPaymentResponse.paymentID,
          },
        },
      });

      // 👇 Fire-and-forget SMS after successful payment confirmation
      sendSMS(
        newApplication.mobileNumber ?? '',
        `Dear ${newApplication.studentName}, Your application to Oylkka IT for ${newApplication.course} has been received. Roll: ${newApplication.roll}`,
        // biome-ignore lint/suspicious/noConsole: this is fine
      ).catch((err) => console.error('[SMS Failed]', err));

      return NextResponse.json({
        message: 'Payment initiated successfully',
        url: createPaymentResponse.bkashURL,
        applicationId: newApplication.id,
        paymentMethod: 'BKASH',
      });
      // biome-ignore lint: error
    } catch (createError) {
      return NextResponse.json(
        { message: 'Application creation failed' },
        { status: 500 },
      );
    }
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      return new NextResponse('User not logged in or authorId missing');
    }

    const existingPendingApplication = await Prisma.application.findFirst({
      where: {
        userId: userId,
        applicationFee: 'Pending',
      },
    });

    if (existingPendingApplication) {
      // ADD AWAIT HERE!
      await cleanupUserPendingApplications(userId); // Use the correct function
    }

    const existingApplication = await Prisma.application.findFirst({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        studentName: true,
        duration: true,
        image: true,
        status: true,
        course: true,
        createdAt: true,
        certificate: true,
        roll: true,
        editable: true,
      },
    });

    if (existingApplication) {
      return new NextResponse(JSON.stringify(existingApplication), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new NextResponse('No Application Found', { status: 200 });
    }
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('An error occurred', { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;
    const userEmail = token?.email;

    if (!token || (!userId && !userEmail)) {
      return new NextResponse('User not logged in or userId/userEmail missing');
    }

    const search = req.nextUrl.searchParams;
    const applicationId = search.get('id');

    if (!applicationId) {
      return new NextResponse('Application ID not provided', { status: 400 });
    }

    const application = await Prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        userId: true,
        image: true,
        imageId: true,
      },
    });

    if (!application) {
      return new NextResponse('Application not found', { status: 404 });
    }

    // Check if the user has the right to delete the application
    if (userId === application.userId || token.role === 'ADMIN') {
      // Check if there’s an image to delete
      if (application.imageId) {
        const result = await cloudinary.uploader.destroy(application.imageId);
        if (result.result !== 'ok') {
          return new NextResponse('error', { status: 400 });
        }
      }

      await Prisma.application.delete({
        where: {
          id: applicationId,
        },
      });

      return new NextResponse('Application deleted successfully', {
        status: 200,
      });
    } else {
      // User does not have the right to delete the application
      return new NextResponse('Unauthorized to delete this application', {
        status: 403,
      });
    }
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Error deleting application', { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = getStringValue(formData, 'id');
    const token = await getToken({ req, secret });

    if (!id || !token) {
      return new NextResponse('Product ID and token are required', {
        status: 400,
      });
    }

    const role = token.role;

    // Check if the user is an admin or if they are the author and the application is editable
    const currentDesign = await Prisma.application.findUnique({
      where: { id: id },
    });

    if (!currentDesign) {
      return new NextResponse('Application not found', { status: 404 });
    }

    // If the role is not ADMIN, make sure the user is the author and the application is editable
    if (role !== 'ADMIN') {
      if (token.sub !== currentDesign.userId) {
        return new NextResponse(
          'Unauthorized: You are not the author of this application',
          {
            status: 403,
          },
        );
      }

      if (currentDesign.editable === false || currentDesign.editable === null) {
        return new NextResponse('Application is not editable', { status: 400 });
      }
    }

    const deletedImage = getStringValue(formData, 'deletedImage');
    const imageFile = formData.get('image') as Blob;

    let image = currentDesign.image;
    let imageId = currentDesign.imageId;

    // Handle image deletion if flagged
    if (deletedImage && currentDesign.imageId) {
      const deleteResult = await cloudinary.uploader.destroy(
        currentDesign.imageId,
      );
      if (deleteResult.result !== 'ok') {
        return new NextResponse('Error deleting image', { status: 400 });
      }
      image = '';
      imageId = '';
    }

    // Upload new image if provided
    if (imageFile) {
      const imageUrl = await UploadImage(imageFile, 'application-images/');
      image = imageUrl.secure_url;
      imageId = imageUrl.public_id;
    }

    // Whitelist of fields that can be updated by the student (PATCH)
    // These match exactly what the frontend form sends
    const ALLOWED_FIELDS = [
      'studentName',
      'fatherName',
      'motherName',
      'fatherOccupation',
      'birthDay',
      'mobileNumber',
      'guardianNumber',
      'gender',
      'maritalStatus',
      'bloodGroup',
      'religion',
      'nationality',
      'nid',
      'email',
      'fullAddress',
      'district',
      'education',
      'board',
      'rollNumber',
      'regNumber',
      'passingYear',
      'gpa',
      'course',
      'session',
      'duration',
      'pc',
      'transactionId',
    ];

    const ADMIN_ONLY_FIELDS = ['editable'];

    // Prepare updated data from whitelisted fields only
    const updatedData: Record<string, string | number | Date | boolean | null> =
      {};

    formData.forEach((value, key) => {
      const isAllowed = ALLOWED_FIELDS.includes(key);
      const isAdminOnly = ADMIN_ONLY_FIELDS.includes(key);

      if (!isAllowed && !isAdminOnly) return;
      if (isAdminOnly && role !== 'ADMIN') return;

      if (key === 'session') {
        const intValue = parseInt(value.toString(), 10);
        if (Number.isNaN(intValue)) {
          throw new Error(`Invalid session value: ${value}`);
        }
        updatedData.session = intValue;
      } else if (key === 'birthDay') {
        const date = new Date(value.toString());
        if (Number.isNaN(date.getTime())) {
          throw new Error(`Invalid birth date: ${value}`);
        }
        updatedData.birthDay = date;
      } else {
        updatedData[key] = value.toString();
      }
    });

    // Add image fields
    updatedData.image = image;
    updatedData.imageId = imageId;

    // Perform the update operation
    const updatedDesign = await Prisma.application.update({
      where: { id },
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
