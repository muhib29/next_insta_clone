import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db"; // or wherever your Prisma client is

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("API error in /api/user/basic:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
