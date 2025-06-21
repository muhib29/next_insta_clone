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
    where: { email: session?.user?.email || "" },
  });

  const followedIds = follows.map((f) => f.followedProfileId);
  const excludedIds: string[] = currentUser?.id
    ? [...followedIds, currentUser.id]
    : [...followedIds];

  const suggestedProfiles = await prisma.profile.findMany({
    where: {
      id: {
        notIn: excludedIds,
      },
    },
    take: 5,
  });
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
      followerProfile: true,
    },
  });

  return (
    <div className="w-full max-w-md mx-auto p-4 rounded-2xl bg-white border border-zinc-300 dark:border-zinc-800 dark:bg-black shadow-md transition-colors px-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-300 mb-4">
          {suggestedProfiles.length > 0
            ? "Suggestions For You"
            : "No Suggestions Right Now"}
        </h3>
        {suggestedProfiles.length >= 5 && (
          <div className="mb-4">
            <Link
              href="/suggestions"
              className="text-sm font-semibold text-gray-800 dark:text-gray-300 hover:text-gray-500"
            >
              See All
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {suggestedProfiles.map((profile) => {
          const mutuals = mutualFollows.filter(
            (mf) => mf.followedProfileId === profile.id
          );
          const firstMutual = mutuals[0]?.followerProfile?.username;

          return (
            <div
              key={profile.id}
              className="flex items-center justify-between gap-3 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-xl"
            >
              <Link
                href={`/users/${profile?.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Avatar src={profile.avatar || ""} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {profile.username}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {firstMutual
                      ? `Followed by ${firstMutual}${mutuals.length > 1
                        ? ` and ${mutuals.length - 1} others`
                        : ""
                      }`
                      : "Suggested for you"}
                  </p>
                </div>
              </Link>
              <FollowButton ourFollow={null} profileIdToFollow={profile.id} />
            </div>
          );
        })}


      </div>

      {/* Footer */}
      <div className="mt-6 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-2">
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-center">
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
            <p
              key={item}
              className="hover:underline cursor-pointer transition text-xs"
            >
              {item}
            </p>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400 mt-2 text-center">
          © 2025 Instagram from Meta
        </p>
      </div>
    </div>
  );
}
