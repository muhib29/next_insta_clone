"use client";

import { Profile } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import FollowButton from "./FollowButton";

export default function SuggestedProfileCard({
  profile,
  showSwipeHint = false,
}: {
  profile: Profile;
  showSwipeHint?: boolean;
}) {
  const [isFollowing] = useState(false);

  return (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-[#1a1a1a] rounded-lg shadow-sm p-4 w-full max-w-sm mx-auto relative">
      <Link href={`/users/${profile.username}`} className="flex items-center gap-3">
        <Image
          src={profile.avatar || "/default-avatar.png"}
          alt={profile.name || "User Avatar"}
          width={40}
          height={40}
          className="rounded-full object-cover w-10 h-10"
        />
        <div className="truncate">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {profile.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{profile.username}</p>
        </div>
      </Link>

      {!isFollowing ? (
       <FollowButton ourFollow={null} profileIdToFollow={profile.id }/>
      ) : (
        <span className="text-green-500 text-sm font-semibold ml-2">Following</span>
      )}

      {showSwipeHint && (
        <div className="absolute bottom-2 right-4 text-xs text-gray-500 dark:text-gray-400 select-none animate-pulse pointer-events-none">
          Swipe &rarr;
        </div>
      )}
    </div>
  );
}
