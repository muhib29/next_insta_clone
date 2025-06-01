// src/app/(routes)/explore/page.tsx
export const dynamic = "force-dynamic";

import PostGrid from "@/Components/PostsGrid";
import { prisma } from "@/db";
import ExploreSearchWrapper from "@/Components/ExploreSearchWrapper"; // ✅ use wrapper

export default async function ExplorePage() {
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
    <div className="min-h-screen">
      <ExploreSearchWrapper /> 
      <div className="p-4">
        {posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No posts available yet. Be the first to post something!
          </div>
        )}
      </div>
    </div>
  );
}
