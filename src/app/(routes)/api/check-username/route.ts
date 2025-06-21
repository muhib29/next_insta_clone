// /api/check-username/route.ts or /api/check-username.ts
import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const userId = searchParams.get("userId"); 

  if (!username) return NextResponse.json({ available: false });

  const existingUser = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (existingUser && existingUser.id === userId) {
    return NextResponse.json({ available: true });
  }

  return NextResponse.json({ available: !existingUser });
}
