import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    const id = queryParams.get('id');
    if (!id) {
      return new NextResponse('Invalid query parameter');
    }

    const response = await Prisma.application.findUnique({
      where: {
        id: id,
      },

      select: {
        studentName: true,
        image: true,
        fullAddress: true,
        email: true,
        mobileNumber: true,
        roll: true,
        course: true,
        duration: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return new NextResponse(JSON.stringify(response), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Server error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.applicationId) {
      return new NextResponse('Invalid query parameter');
    }

    const response = await Prisma.transaction.create({
      data: {
        comment: body.comment,
        paymentMonth: body.PaymentMonth,
        amount: body.amount,
        paymentReceiveDate: body.PaymentReceiveDate,
        applicationId: body.applicationId,
      },
    });
    return new NextResponse(JSON.stringify(response), { status: 201 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Server error', { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    const id = queryParams.get('id');
    if (!id) {
      return new NextResponse('Invalid query parameter');
    }

    const response = await Prisma.transaction.delete({
      where: {
        id: id,
      },
    });
    return new NextResponse(JSON.stringify(response), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Server error', { status: 500 });
  }
}
