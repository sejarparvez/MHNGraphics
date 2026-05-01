import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const page = parseInt(queryParams.get('page') || '1', 10);

    const searchName = queryParams.get('search') || '';
    let bloodGroup = (queryParams.get('filterBy') || '').trim();

    const skipCount = (page - 1) * 20;
    // biome-ignore lint: error
    const whereClause: any = {};

    if (bloodGroup && bloodGroup !== 'All') {
      if (!bloodGroup.includes('-')) {
        bloodGroup = `${bloodGroup}+`;
      }

      whereClause.bloodGroup = {
        equals: bloodGroup,
      };
    }

    if (searchName) {
      whereClause.AND = [
        {
          fullAddress: {
            contains: searchName,
            mode: 'insensitive',
          },
        },
        ...(whereClause.AND || []),
      ];
    }

    const [allUsers, totalUsersCount] = await Promise.all([
      Prisma.application.findMany({
        select: {
          id: true,
          email: true,
          image: true,
          mobileNumber: true,
          createdAt: true,
          bloodGroup: true,
          fullAddress: true,
          studentName: true,
        },
        where: whereClause,
        skip: skipCount,
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      Prisma.application.count({ where: whereClause }),
    ]);

    if (allUsers.length > 0) {
      return new NextResponse(
        JSON.stringify({ users: allUsers, totalUsersCount }),
        { headers: { 'Content-Type': 'application/json' } },
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
    await Prisma.$disconnect();
  }
}
