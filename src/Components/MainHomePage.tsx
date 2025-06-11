import StoryBar from "@/Components/StoryBar";
import Suggestion from "@/Components/Suggestion";
import UserHome from "@/Components/UserHome";
import { auth } from "@/auth";
import { prisma } from "@/db";
import SuggestedProfilesCarousel from "./SuggestedProfilesCarousel";

type MediaType = "image" | "video";

type ExtendedMedia = {
  id: string;
  url: string;
  type: MediaType;
  postId: string;
};

export default async function MainHomePage() {
  
  const session = await auth();

  if (!session?.user?.email) return null;

  const currentUser = await prisma.profile.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) return null;

  const follows = await prisma.follower.findMany({
    where: {
      followingProfileEmail: session.user.email,
    },
  });

  const followedIds = follows.map((f) => f.followedProfileId);

  const profiles = await prisma.profile.findMany({
    where: {
      id: { in: followedIds },
    },
  });

  const hasFollowers = profiles.length > 0;

  // Fetch posts by these profiles, including media and counts
  const postsRaw = await prisma.post.findMany({
    where: {
      author: { in: profiles.map((p) => p.email) },
    },
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
    take: 100,
  });

  // Map posts to include image/video as before
  const posts = postsRaw.map((post) => {
    // Explicitly cast media type string to MediaType
    const media: ExtendedMedia[] = post.media.map((m) => ({
      ...m,
      type: m.type === "video" ? "video" : "image", // force type to MediaType
    }));

    const image = media.find((m) => m.type === "image")?.url ?? null;
    const video = media.find((m) => m.type === "video")?.url ?? null;

    return {
      ...post,
      media,
      image,
      video,
    };
  });

  // Fetch likes and bookmarks by current user on these posts
  const likes = await prisma.like.findMany({
    where: {
      author: session.user.email,
      postId: { in: posts.map((p) => p.id) },
    },
  });

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      author: session.user.email,
      postId: { in: posts.map((p) => p.id) },
    },
  });
  return (
    <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Left/Main Feed */}
      <div className="w-full lg:w-2/3 xl:w-3/5">
        {hasFollowers ? (
          <>
            <StoryBar profiles={profiles} />

            {/* Mobile-only suggestions carousel */}
            <div className="md:hidden mt-6 flex justify-center">
              <SuggestedProfilesCarousel currentUserId={currentUser.id} />
            </div>

            {posts?.length === 0 ? (
              <div className="mt-8 flex justify-center flex-col text-center text-gray-500">
                <p>It&rsquo;s a bit quiet here. Inspire your followers to share something!</p>

              </div>
            ) : (
              <UserHome
                profiles={profiles}
                posts={posts}
                likes={likes}
                bookmarks={bookmarks}
                sessionEmail={session.user.email}
              />
            )}
          </>
        ) : (
          <>
            <div className="md:hidden mt-6 flex justify-center">
              <SuggestedProfilesCarousel currentUserId={currentUser.id} />
            </div>
            <div className="mt-8 flex justify-center flex-col text-center text-gray-500">
              <p>You&rsquo;re not following anyone yet.</p>

              <p>Here are some people you might want to follow:</p>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block w-[455px] lg:w-1/3 xl:w-2/5">
        <Suggestion follows={follows} />
      </div>
    </div>
  );
}