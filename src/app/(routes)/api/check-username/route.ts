import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) return NextResponse.json({ available: false });

  const exists = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
  });

  return NextResponse.json({ available: !exists });
}
