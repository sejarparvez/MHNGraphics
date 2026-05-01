import { NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';
import { cleanupAllPendingApplications } from '@/utils/applicationCleanup';

export async function GET() {
  try {
    // Fetch the latest 5 applications from the database
    cleanupAllPendingApplications(5);
    const applications = await Prisma.application.findMany({
      where: {
        OR: [
          { applicationFee: { not: 'Pending' } },
          { applicationFee: { isSet: false } }, // Field doesn't exist
          { applicationFee: null }, // Field is null
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        studentName: true,
        image: true,
        course: true,
        createdAt: true,
      },
      take: 6,
    });

    // Return the applications as a JSON response
    return new NextResponse(JSON.stringify(applications), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Failed to fetch applications', { status: 500 });
  }
}
