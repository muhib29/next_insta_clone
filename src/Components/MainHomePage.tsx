import StoryBar from "@/Components/StoryBar";
import Suggestion from "@/Components/Suggestion";
import UserHome from "@/Components/UserHome";
import { auth } from "@/auth";
import { prisma } from "@/db";

export default async function MainHomePage() {
  const session = await auth();

  const follows = await prisma.follower.findMany({
    where: {
      followingProfileEmail: session?.user?.email || "",
    },
  });

  const followedIds = follows.map((f) => f.followedProfileId);

  const profiles = await prisma.profile.findMany({
    where: {
      id: { in: followedIds },
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      author: { in: profiles.map((p) => p.email) },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const hasFollowers = profiles.length > 0;
  const hasPosts = posts.length > 0;

  return (
    <div className="max-w-5xl w-full mx-auto flex gap-8 text-black dark:text-white">
      <div className="flex-1 max-w-2xl">
        {hasFollowers ? (
          <>
            <StoryBar profiles={profiles} />
            {hasPosts ? (
              <UserHome profiles={profiles} />
            ) : (
              <div className="mt-8 text-center text-gray-500">
                <p>No posts yet from those you follow.</p>
                <p>Encourage them to post, or explore new users!</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 text-center text-gray-500">
            <p>You’re not following anyone yet.</p>
            <p>Discover and follow users to see their posts here.</p>
          </div>
        )}
      </div>

      <div className="hidden lg:block w-1/3">
        <Suggestion follows={follows} />
      </div>
    </div>
  );
}