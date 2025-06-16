
import { auth } from "@/auth";
import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json([], { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(notifications);
  
}
