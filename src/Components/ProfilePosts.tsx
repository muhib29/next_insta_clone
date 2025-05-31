import { prisma } from "@/db";
import PostGrid from "./PostsGrid";

export default async function ProfilePosts({ email }: { email: string }) {
  const posts = await prisma.post.findMany({
    where: { author: email },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (posts.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
      You haven&apos;t posted anything yet.
    </div>
  }

  return <PostGrid posts={posts} />;
}
