  // app/api/search/route.ts

  import { prisma } from "@/db";
  import { NextResponse } from "next/server";

  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const profiles = await prisma.profile.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });
    
  const posts = await prisma.post.findMany({
    where: {
      description: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

    return NextResponse.json({ profiles, posts });
  }

