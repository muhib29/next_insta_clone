import { auth } from "@/auth";
import { prisma } from "@/db";
import Avatar from "@/Components/Avatar";
import FollowButton from "@/Components/FollowButton";
import Link from "next/link";

export default async function SuggestionsPage() {
  const session = await auth();
  const currentUser = await prisma.profile.findUnique({
    where: { email: session?.user?.email || "" },
  });

  const follows = await prisma.follower.findMany({
    where: {
      followingProfileId: currentUser?.id,
    },
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
    take: 50, 
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6 text-center">People You May Know</h1>

      <div className="space-y-4">
        {suggestedProfiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between gap-3 p-2 rounded-xl "
          >
            <Link
              href={`/users/${profile?.username}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar src={profile.avatar} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {profile.username}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {profile.name || "Suggested for you"}
                </p>
              </div>
            </Link>
            <FollowButton ourFollow={null} profileIdToFollow={profile.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
