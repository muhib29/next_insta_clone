export const dynamic = "force-dynamic"; 

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
    {posts.length > 0 ? (
      <PostGrid posts={posts} />
    ) : (
      <div className="text-center text-gray-500 mt-10">
        No posts available yet. Be the first to post something!
      </div>
    )}
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
