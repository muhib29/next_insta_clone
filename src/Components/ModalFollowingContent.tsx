import { prisma } from "@/db";
import FollowButton from "./FollowButton";
import Link from "next/link";
import ModalXicon from "./ModalXicon";
import Image from "next/image";

export default async function ModelFollowingContent({ username }: { username: string }) {
  const profile = await prisma.profile.findUnique({
    where: { username }
  });

  if (!profile) return <div>Profile not found</div>;

  const followingList = await prisma.follower.findMany({
    where: {
      followingProfileId: profile.id,
    },
    select: {
      followedProfile: {
        select: {
          id: true,
          username: true,
          avatar: true,
          name: true,
        },
      },
    },
  });
  const followingWithMutualStatus = await Promise.all(
    followingList
      .filter((entry) => entry.followedProfile !== null) // guard against null
      .map(async (entry) => {
        const user = entry.followedProfile!; // now safe to assert non-null

        const ourFollow = await prisma.follower.findFirst({
          where: {
            followingProfileId: profile.id,
            followedProfileId: user.id,
          },
        });

        const mutualFollowBack = await prisma.follower.findFirst({
          where: {
            followingProfileId: user.id,
            followedProfileId: profile.id,
          },
        });

        return {
          user,
          ourFollow,
          mutualFollowBack,
        };
      })
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-700">
        <h2 className="text-lg font-semibold">Following</h2>
        <ModalXicon />
      </div>

      <div className="overflow-y-auto">
        {followingWithMutualStatus.map(({ user, ourFollow }, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            <Link href={`/users/${user.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-700 overflow-hidden">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <Image
                    src="/userImage.png"
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover' }}
                    width={40}
                    height={40}
                  />
                )}

              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.username}</span>
                {user.name && (
                  <span className="text-xs text-gray-500">{user.name}</span>
                )}
              </div>
            </Link>

            <FollowButton
              ourFollow={ourFollow}
              profileIdToFollow={user.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
