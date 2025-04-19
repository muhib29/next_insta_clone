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
  // If no posts found, you can return a fallback message
  if (posts.length === 0) {
    return <p>No posts found.</p>;
  }

  // Pass the posts to the PostGrid component
  return <PostGrid posts={posts} />;
}
