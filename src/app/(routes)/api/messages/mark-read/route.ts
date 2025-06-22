import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db';
import { pusherServer } from '../../../../../../lib/pusher/server';

export async function POST(req: NextRequest) {
  const { senderId, receiverId } = await req.json();

  if (!senderId || !receiverId) {
    return NextResponse.json({ error: 'Missing senderId or receiverId' }, { status: 400 });
  }

  try {
    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    await pusherServer.trigger(`chat-${receiverId}`, 'messages-read', { senderId });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update messages' + err }, { status: 500 });
  }
}
