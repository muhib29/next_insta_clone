// api/chat/send/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { getSessionEmailOrThrow } from "@/action";
import { pusherServer } from "../../../../../../lib/pusher/server";
export async function POST(req: Request) {
  const { receiverId, text } = await req.json();
  const email = await getSessionEmailOrThrow();

  const sender = await prisma.profile.findFirstOrThrow({ where: { email } });

  const message = await prisma.message.create({
    data: {
      senderId: sender.id,
      receiverId,
      text,
    },
  });
  const receiver = await prisma.profile.findUniqueOrThrow({
    where: { id: receiverId },
    select: { username: true, avatar: true },
  });
  const payload = {
    id: message.id,
    text: message.text,
    senderId: sender.id,
    senderUsername: sender.username,
    senderAvatar: sender.avatar,
    receiverId,
    receiverUsername: receiver.username,
    receiverAvatar: receiver.avatar,
    createdAt: message.createdAt,
  };
  await Promise.all([
    pusherServer.trigger(`chat-${receiverId}`, "new-message", payload),
    pusherServer.trigger(`chat-${sender.id}`, "new-message", payload),
  ]);

  return NextResponse.json({
    id: message.id,
    text: message.text,
    senderId: sender.id,
    createdAt: message.createdAt,
  });
}
