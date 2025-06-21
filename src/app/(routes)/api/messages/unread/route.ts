import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const uniqueSenders = await prisma.message.findMany({
    where: {
      receiverId: userId,
      isRead: false,
    },
    select: {
      senderId: true,
    },
    distinct: ['senderId'],
  });

  return NextResponse.json({ count: uniqueSenders.length });
}
