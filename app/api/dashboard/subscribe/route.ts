import { type NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/components/helper/mail/SendMail';
import Prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate email format
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      );
    }

    // Check if the email is already subscribed
    const existingSubscriber = await Prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'This email is already subscribed!' },
        { status: 409 },
      );
    }

    // Save the email in the database
    const subscriber = await Prisma.subscriber.create({
      data: { email },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email);
      // biome-ignore lint: error
    } catch (emailError) {
      return NextResponse.json(
        { message: 'Subscription successful, but email could not be sent.' },
        { status: 202 }, // Accepted with issue
      );
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!', subscriber },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Extract email from the query parameters
    const url = new URL(req.url);
    const email = url.searchParams.get('mail');

    // Validate email format
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      );
    }

    // Check if the email exists in the subscribers list
    const existingSubscriber = await Prisma.subscriber.findUnique({
      where: { email },
    });

    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'Email not found in the subscribers list' },
        { status: 404 }, // Not found status code
      );
    }

    // Delete the email from the database
    await Prisma.subscriber.delete({
      where: { email },
    });

    return NextResponse.json(
      { message: 'Successfully unsubscribed!' },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const subscriber = await Prisma.subscriber.findMany({
      select: {
        email: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return new NextResponse(JSON.stringify(subscriber), { status: 200 });

    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
