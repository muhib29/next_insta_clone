import { NextRequest } from "next/server";
import { prisma } from "@/db"; // adjust path if needed

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return new Response("Missing userId", { status: 400 });

  const unreadCount = await prisma.notification.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });

  return Response.json({ count: unreadCount });
}
