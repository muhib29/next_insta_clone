import { Follower, Profile } from "@prisma/client";
import Link from "next/link";
import FollowButton from "./FollowButton";
import Image from "next/image";

export default function ProfilePageInfo({
  profile,
  isOurProfile,
  ourFollow,
  stats,
}: {
  profile: Profile;
  isOurProfile: boolean;
  ourFollow: Follower | null;
  stats: {
    postCount: number;
    followersCount: number;
    followingCount: number;
  };
}) {

  const { postCount = 0, followersCount = 0, followingCount = 0 } = stats || {};

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white px-4 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-4xl mt-10 flex flex-col sm:flex-row gap-14">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-600">
            {profile?.avatar ? (
              <Image
                src={profile.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
                width={128} 
                height={128} 
              />
            ) : (
              <Image
                src="/userImage.png"
                alt="Default Profile"
                className="w-full h-full object-cover"
                width={128} 
                height={128} 
              />
            )}

          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-xl font-normal">{profile?.username || ""}</h1>

            {!isOurProfile && (
              <section>
                <FollowButton ourFollow={ourFollow} profileIdToFollow={profile.id} />
              </section>
            )}

            <Link
              href="/settings"
              className="bg-gray-200 dark:bg-[#363636] hover:bg-gray-300 dark:hover:bg-[#4f4e4e] px-4 py-1 rounded-md text-sm transition"
            >
              Settings
            </Link>
          </div>
          <div className="flex gap-6 mt-4 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-semibold text-black dark:text-white">{postCount}</span> posts
            </p>
            <Link href={`/users/${profile.username}/follower`}>
              <span className="font-semibold text-black dark:text-white cursor-pointer ">{followersCount}</span> followers
            </Link>
            <Link href={`/users/${profile.username}/following`}>
              <span className="font-semibold text-black dark:text-white cursor-pointer">{followingCount}</span> following
            </Link>
          </div>
          {/* Bio */}
          <div className="mt-4 text-sm">
            <p className="font-semibold  text-black dark:text-purple-400">{profile?.name}</p>
            <p className="italic  text-gray-700 dark:text-gray-400">{profile?.subtitle}</p>
            <p className="mt-1 text-gray-700 dark:text-gray-400">{profile?.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
