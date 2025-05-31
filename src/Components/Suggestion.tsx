import { prisma } from "@/db";
import { Follower } from "@prisma/client";
import FollowButton from "./FollowButton";
import Avatar from "./Avatar";
import { auth } from "@/auth";
import Link from "next/link";

export default async function Suggestion({
  follows,
}: {
  follows: Follower[];
}) {
  const session = await auth();

  const currentUser = await prisma.profile.findUnique({
    where: { email: session?.user?.email || '' },
  });

  const followedIds = follows.map((f) => f.followedProfileId);

  // Exclude already followed + self
  const excludedIds: string[] = currentUser?.id
    ? [...followedIds, currentUser.id]
    : [...followedIds];

  // Fetch suggested profiles (excluding those without usernames)
  const suggestedProfiles = await prisma.profile.findMany({
    where: {
      id: {
        notIn: excludedIds,
      },
      username: {
        not: "", 
      },
    },
  });

  // Get mutual follows (users followed by people the user follows)
const mutualFollows = await prisma.follower.findMany({
  where: {
    followingProfileId: {
      in: followedIds,
    },
    followedProfileId: {
      in: suggestedProfiles.map((p) => p.id),
    },
  },
  include: {
    followerProfile: true, // ✅ Gives you access to .followerProfile.username
  },
});


  // Preprocess mutuals into a map for quick access
  const mutualFollowMap = new Map<string, Follower[]>();
  mutualFollows.forEach((mf) => {
    if (!mutualFollowMap.has(mf.followedProfileId)) {
      mutualFollowMap.set(mf.followedProfileId, []);
    }
    mutualFollowMap.get(mf.followedProfileId)!.push(mf);
  });

  return (
    <div className="hidden lg:block w-full p-4 rounded-lg h-fit bg-white dark:bg-zinc-900 shadow-md transition-colors">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-4">
        {suggestedProfiles.length > 0
          ? "Suggestions For You"
          : "No Suggestions right now"}
      </h3>

      {suggestedProfiles.length > 0 &&
            
      suggestedProfiles.map((profile) => {
        const mutuals = mutualFollows.filter(
          (mf) => mf.followedProfileId === profile.id
        );
        const firstMutual = mutuals[0]?.followerProfile?.username;

          return (
            <div
              key={profile.id}
              className="flex items-center justify-between mb-4"
            >
              <Link
                href={`/users/${profile.username}`}
                className="flex items-center space-x-3"
              >
                {profile.avatar ? (
                  <Avatar src={profile.avatar} />
                ) : (
                  <Avatar src={profile.avatar || ''} />
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                    {profile.username}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-gray-400">
                    {firstMutual
                      ? `Followed by ${firstMutual}${mutuals.length > 1
                        ? ` and ${mutuals.length - 1} others`
                        : ""
                      }`
                      : "Suggested for you"}
                  </p>
                </div>
              </Link>

              <FollowButton
                ourFollow={null}
                profileIdToFollow={profile.id}
              />
            </div>
          );
        })}

      {/* Footer */}
      <div className="mt-6 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-2">
        <div className="flex flex-wrap gap-2">
          {[
            "About",
            "Help",
            "Press",
            "API",
            "Jobs",
            "Privacy",
            "Terms",
            "Locations",
            "Language",
            "Meta Verified",
          ].map((item) => (
            <p key={item} className="hover:underline cursor-pointer">
              {item}
            </p>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400 mt-2">
          © 2025 Instagram from Meta
        </p>
      </div>
    </div>
  );
}
