import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const exclude = searchParams.get("exclude");

    if (!exclude) {
      return NextResponse.json({ profiles: [] }, { status: 400 });
    }

    const user = await prisma.profile.findUnique({
      where: { id: exclude },
      include: { followings: true },
    });

    if (!user) {
      return NextResponse.json({ profiles: [] }, { status: 404 });
    }

    const followedIds = user.followings.map((f) => f.followedProfileId);

    const profiles = await prisma.profile.findMany({
      where: {
        id: {
          notIn: [exclude, ...followedIds],
        },
      },
      take: 10,
    });

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions", profiles: [] }, { status: 500 });
  }
}
