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
    <div className="max-w-5xl w-full mx-auto flex gap-8 px-0 lg:px-8">
      <div className="flex-1 max-w-2xl">
        {hasFollowers ? (
          <>
            <StoryBar profiles={profiles} />
            <div className="md:hidden mt-6 flex justify-center">
              <SuggestedProfilesCarousel currentUserId={currentUser.id} />
            </div>
            <UserHome
              profiles={profiles}
              posts={posts}
              likes={likes}
              bookmarks={bookmarks}
              sessionEmail={session.user.email}
            />
          </>
        ) : (
          <>
            <div className="md:hidden block mt-6">
              <SuggestedProfilesCarousel currentUserId={currentUser.id} />
            </div>
            <div className="mt-8 md:text-center text-left text-gray-500">
              <p>You’re not following anyone yet.</p>
              <p>Here are some people you might want to follow:</p>
            </div>
          </>
        )}
      </div>

      <div
        className="
          hidden 
          lg:block 
          w-2/5
          max-[1250px]:w-1/2
          max-[1050px]:w-1/2 
          min-[1000px]:block
        "
      >
        <Suggestion follows={follows} />
      </div>
    </div>
  );
}
