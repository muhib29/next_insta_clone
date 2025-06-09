// src/app/(routes)/explore/page.tsx
export const dynamic = "force-dynamic";

import PostGrid from "@/Components/PostsGrid";
import { prisma } from "@/db";
import ExploreSearchWrapper from "@/Components/ExploreSearchWrapper";
import { auth } from "@/auth";
import { Post } from "@prisma/client";

// Narrow type for media.type
type MediaType = "image" | "video";

type ExtendedPost = Post & {
  image: string | null;
  video: string | null;
  media: {
    id: string;
    url: string;
    type: MediaType;
    postId: string;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default async function ExplorePage() {
  const session = await auth();
  const currentUserId = session?.user?.email || "";

  const posts = await prisma.post.findMany({
    include: {
      media: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Map posts to ExtendedPost with correct media types and image/video props
  const formattedPosts: ExtendedPost[] = posts.map((post) => {
    // Cast media.type safely to "image" | "video"
    const media = post.media.map((m) => ({
      ...m,
      type: m.type === "video" ? "video" : "image",
    })) as {
      id: string;
      url: string;
      type: MediaType;  // "image" | "video"
      postId: string;
    }[];


    const image = media.find((m) => m.type === "image")?.url ?? null;
    const video = media.find((m) => m.type === "video")?.url ?? null;

    return {
      ...post,
      media,
      image,
      video,
    };
  });

  return (
    <div className="min-h-screen">
      <ExploreSearchWrapper />
      <div className="p-4">
        {formattedPosts.length > 0 ? (
          <PostGrid posts={formattedPosts} currentUserId={currentUserId} />
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No posts available yet. Be the first to post something!
          </div>
        )}
      </div>
    </div>
  );
}
