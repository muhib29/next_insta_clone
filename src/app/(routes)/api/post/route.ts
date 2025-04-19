import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db';

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.profile.findFirst({
    where: { email: session.user.email },
  });

  return NextResponse.json({
    avatar: profile?.avatar || '',
  });
}
