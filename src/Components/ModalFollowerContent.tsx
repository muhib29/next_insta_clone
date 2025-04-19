import { auth } from "@/auth";
import { prisma } from "@/db";
import Avatar from "./Avatar";
import RemoveFollowerButton from "./RemoveFollowerButton"; // Assuming you already have this component
import ModalXicon from "./ModalXicon";

export default async function ModelFollowerContent({ params }: { params: { username: string } }) {
  // 1. Get the session data of the logged-in user
  const session = await auth();
  if (!session?.user?.email) return <div>Unauthorized</div>;

  // 2. Fetch the profile of the user whose followers we are viewing
  const profile = await prisma.profile.findUnique({
    where: { username: params.username },
  });

  if (!profile) return <div>Profile not found</div>;

  // 3. Get the followers of the specified user (not the logged-in user)
  const followersList = await prisma.follower.findMany({
    where: { followedProfileId: profile.id },
    include: {
      followerProfile: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  // const followerIds = followersList.map((f) => f.followerProfile.id);

  // 4. Get the followers that the specified user follows back (mutual followers)
  // const ourFollows = await prisma.follower.findMany({
  //   where: {
  //     followingProfileId: profile.id,
  //     followedProfileId: { in: followerIds },
  //   },
  // });

  // const followMap = new Map(
  //   ourFollows.map((follow) => [follow.followedProfileId, follow])
  // );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-700">
      <h2 className="text-lg font-semibold">{profile.username}&apos;s Followers</h2>
        <ModalXicon />
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto">
        {followersList.map((follower) => {
          const followedUserId = follower.followerProfile.id;
          return (
            <div
              key={followedUserId}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                {follower.followerProfile.avatar && (
                  <Avatar src={follower.followerProfile.avatar} />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {follower.followerProfile.username}
                  </span>
                  {follower.followerProfile.name && (
                    <span className="text-xs text-white">
                      {follower.followerProfile.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RemoveFollowerButton followerId={follower.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
