import { prisma } from "@/db";
import PostGrid from "./PostsGrid";
import { auth } from "@/auth";

export default async function ProfilePosts({
  email,
  isOurProfile
}: {
  email: string,
  isOurProfile: boolean
}) {
  const session = await auth();
  const currentUserId = session?.user?.email || '';

  const posts = await prisma.post.findMany({
    where: { author: email },
    include: {
      media: {
        orderBy: {
          id: 'asc',
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const typedPosts = posts.map((post) => ({
    ...post,
    media: post.media.map((m) => ({
      url: m.url,
      type: m.type as "image" | "video",
    })),
  }));

  
  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        {isOurProfile ? <span> You haven&apos;t posted anything yet.</span> : <span>This user hasn&apos;t posted anything yet.</span>}
      </div>
    );
  }

  return <PostGrid posts={typedPosts} currentUserId={currentUserId} />;
}
