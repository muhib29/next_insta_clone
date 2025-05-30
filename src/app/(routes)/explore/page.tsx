export const dynamic = "force-dynamic"; // 👈 prevents static pre-rendering

import PostGrid from "@/Components/PostsGrid";
import { prisma } from "@/db";

export default async function ExplorePage() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return (
      <div>
        <PostGrid posts={posts} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch posts in /explore:", error);

    return (
      <div className="text-center text-red-500 mt-10">
        Something went wrong while loading posts.
      </div>
    );
  }
}
