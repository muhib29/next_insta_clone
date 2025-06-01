import { auth } from "@/auth";
import { prisma } from "@/db";
import Avatar from "./Avatar";
import RemoveFollowerButton from "./RemoveFollowerButton"; // Assuming you already have this component
import ModalXicon from "./ModalXicon";
import FollowButton from "./FollowButton";
export default async function ModelFollowerContent({ username }: { username: string }) {
 const session = await auth();
 const currentUserEmail = session?.user?.email;

  if (!session?.user?.email) return <div>Unauthorized</div>;

  // Fetch the profile being viewed
  const profile = await prisma.profile.findUnique({
    where: { username }
  });
  if (!profile) return <div>Profile not found</div>;

  // Fetch the logged-in user's own profile
  const loggedInUserProfile = await prisma.profile.findUnique({
    where: { email: session.user.email }
  });
  if (!loggedInUserProfile) return <div>Logged-in profile not found</div>;

  const isOwnProfile = profile.email === currentUserEmail;


  // Get the followers of the viewed profile
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-700">
        <h2 className="text-lg font-semibold">{profile.username}&apos;s Followers</h2>
        <ModalXicon />
      </div>

      <div className="overflow-y-auto">
        {followersList.length === 0 ? (
          <div className="p-4 text-sm text-center text-gray-500 dark:text-neutral-400">
            No followers yet.
          </div>
        ) : (
          followersList.map((follower) => {
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
                 {isOwnProfile ? (
                    <RemoveFollowerButton followerId={follower.id} />
                  ) : (
                    <FollowButton
                      profileIdToFollow={follower.followerProfile.id}
                      ourFollow={null} // optional – can remain null for now
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
