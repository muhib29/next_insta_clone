import StoryBar from "@/Components/StoryBar";
import Suggestion from "@/Components/Suggestion";
import UserHome from "@/Components/UserHome";
import { auth } from "@/auth";
import { prisma } from "@/db";
import SuggestedProfilesCarousel from "./SuggestedProfilesCarousel";
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

  // const posts = await prisma.post.findMany({
  //   where: {
  //     author: { in: profiles.map((p) => p.email) },
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   take: 100,
  // });

  const hasFollowers = profiles.length > 0;

  return (
    <div className="max-w-5xl w-full mx-auto flex gap-8 px-0 lg:px-8">
      <div className="flex-1 max-w-2xl">
        {hasFollowers ? (
          <>
            <StoryBar profiles={profiles} />
           <div className="md:hidden mt-6 flex justify-center">
            <SuggestedProfilesCarousel currentUserId={currentUser.id} />
          </div>
            <UserHome profiles={profiles} />
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

        {/* Always show on small devices */}
       
      </div>

      <div className="
          hidden 
          lg:block 
          w-2/5
          max-[1250px]:w-1/2
          max-[1050px]:w-1/2 
          min-[1000px]:block
        ">
        <Suggestion follows={follows} />
      </div>
    </div>
  );
}
