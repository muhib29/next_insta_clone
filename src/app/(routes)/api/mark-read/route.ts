import { prisma } from "@/db";

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) return new Response("Missing userId", { status: 400 });

  await prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  return new Response("OK");
}
