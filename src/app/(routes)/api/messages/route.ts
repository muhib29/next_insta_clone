// api/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";
import { getSessionEmailOrThrow } from "@/action";
export async function GET(req: NextRequest) {

  const email = await getSessionEmailOrThrow();
  const receiverId = req.nextUrl.searchParams.get("receiverId");

  const sender = await prisma.profile.findFirstOrThrow({ where: { email } });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: sender.id, receiverId: receiverId! },
        { senderId: receiverId!, receiverId: sender.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });



  return NextResponse.json(messages);
}
