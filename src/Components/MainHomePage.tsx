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

  // const posts = await prisma.post.findMany({
  //   where: {
  //     author: { in: profiles.map((p) => p.email) },
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   take: 100,
  // });

  return (
    <div className="max-w-5xl w-full mx-auto flex gap-8 text-black dark:text-white">
  <div className="flex-1 max-w-2xl">
    <StoryBar profiles={profiles} />
    <UserHome profiles={profiles} />
  </div>
  <div className="hidden lg:block w-1/3">
    <Suggestion follows={follows} />
  </div>
</div>

  );
}
