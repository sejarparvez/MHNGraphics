import bcrypt from 'bcrypt';
import { type NextRequest, NextResponse } from 'next/server';
import generateCode from '@/components/helper/mail/GenerateCode';
import sendVerificationEmail, {
  sendRegistrationEmail,
} from '@/components/helper/mail/SendMail';
import { Prisma } from '@/components/helper/prisma/Prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!name || !email || !password) {
      return new NextResponse('Missing name, email, or password', {
        status: 400,
      });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhone = /^(\+?[1-9]\d{1,14}|0\d{9,15})$/.test(email);

    if (!isEmail && !isPhone) {
      return new NextResponse('Invalid email or phone number format', {
        status: 400,
      });
    }

    const queryCondition = isEmail ? { email: email } : { phoneNumber: email };

    const existingUser = await Prisma.user.findFirst({
      where: queryCondition,
    });

    if (existingUser?.emailVerified) {
      return new NextResponse('User is already registered', { status: 409 });
    } else if (existingUser) {
      const updatedUser = await Prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
          emailVerified: isEmail ? null : new Date(),
          verificationCode: null,
        },
      });

      if (isEmail) {
        const verificationCode = generateCode();
        await sendVerificationEmail(email, verificationCode);
        await Prisma.user.update({
          where: { id: updatedUser.id },
          data: { verificationCode: verificationCode },
        });
      }

      return new NextResponse(
        JSON.stringify({
          message: isEmail
            ? 'Verification code sent successfully'
            : 'User registered successfully',
          userId: updatedUser.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } else {
      const user = await Prisma.user.create({
        data: {
          name,
          email: isEmail ? email : null,
          phoneNumber: isPhone ? email : null,
          status: 'USER',
          password: hashedPassword,
          emailVerified: isEmail ? null : new Date(),
          verificationCode: null,
        },
      });

      if (isEmail) {
        const verificationCode = generateCode();
        await sendVerificationEmail(email, verificationCode);
        await Prisma.user.update({
          where: { id: user.id },
          data: { verificationCode: verificationCode },
        });
      }

      return new NextResponse(
        JSON.stringify({
          message: isEmail
            ? 'Verification code sent successfully'
            : 'User registered successfully',
          userId: user.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  } finally {
    await Prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, code } = data;

    const user = await Prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const verificationCode = code.toString();

    // Check if the verification code matches
    if (user.verificationCode === verificationCode) {
      const updatedUser = await Prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date().toISOString(),
          verificationCode: null,
        },
      });

      if (updatedUser.email) {
        // Check if the email is already subscribed
        const existingSubscriber = await Prisma.subscriber.findUnique({
          where: { email: updatedUser.email },
        });

        if (!existingSubscriber) {
          // Save email to subscriber list
          await Prisma.subscriber.create({
            data: { email: updatedUser.email },
          });
        }

        // Send welcome email
        try {
          await sendRegistrationEmail(updatedUser.email);
          // biome-ignore lint: error
        } catch (emailError) {
          return NextResponse.json(
            {
              message:
                'Registration successful, but welcome email could not be sent.',
            },
            { status: 202 },
          );
        }
      }

      return new NextResponse('User verified successfully', { status: 200 });
    } else {
      return new NextResponse('Invalid verification code', { status: 400 });
    }
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  } finally {
    await Prisma.$disconnect();
  }
}
