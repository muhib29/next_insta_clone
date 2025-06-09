import ProfileNav from "@/Components/ProfileNav";
import ProfilePageInfo from "@/Components/ProfilePageInfo";
import { auth } from "@/auth";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import PostGrid from "@/Components/PostsGrid";
import type { ExtendedPost } from '@/Components/PostsGrid';


export default async function BookMarkPage() {
  const session = await auth();

  const currentUserId = session?.user?.email || '';
  if (!currentUserId) return redirect("/login");

  const profile = await prisma.profile.findFirst({
    where: { email: currentUserId },
  });

  if (!profile) {
    return redirect('/settings');
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { author: currentUserId },
  });

const posts = (
  await prisma.post.findMany({
    where: { id: { in: bookmarks.map((b) => b.postId) } },
    include: {
      media: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })
).map((post) => ({
  ...post,
  media: post.media.map((m) => ({
    url: m.url,
    type: m.type === 'video' || m.type === 'image' ? m.type : 'image', // fallback or you can throw error here
  })) as { url: string; type: 'video' | 'image' }[], // explicit cast here
})) as ExtendedPost[]; // final cast for posts array



  const [postCount, followersCount, followingCount] = await Promise.all([
    prisma.post.count({ where: { author: profile.email } }),
    prisma.follower.count({ where: { followedProfileId: profile.id } }),
    prisma.follower.count({ where: { followingProfileId: profile.id } }),
  ]);

  return (
    <div>
      <ProfilePageInfo
        profile={profile}
        isOurProfile={true}
        ourFollow={null}
        stats={{ postCount, followersCount, followingCount }}
      />
      <ProfileNav
        username={profile.username || profile.email.split('@')[0]}
        isOurProfile={true}
      />

      <div className="mt-4">
        {posts.length > 0 ? (
          <PostGrid posts={posts} currentUserId={currentUserId} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            You haven&apos;t bookmarked any posts yet.
          </div>
        )}
      </div>
    </div>
  );
}
