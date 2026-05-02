import { type NextRequest, NextResponse } from 'next/server';
import Prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams;
    const id = search.get('id');

    if (!id) {
      return new NextResponse('no id available', { status: 400 });
    }
    const response = await Prisma.bloodDonation.findUnique({
      where: {
        id,
      },
    });

    if (!response) {
      return new NextResponse('No data found', { status: 400 });
    }

    return new NextResponse(JSON.stringify(response), { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    Prisma.$disconnect();
  }
}
