import { Profile } from "@prisma/client";
import Link from "next/link";
import Avatar from "./Avatar";

export default function StoryBar({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[500px] flex space-x-4 overflow-x-auto scrollbar-hide border-b border-gray-300 dark:border-gray-700 pb-4 px-2">
        {profiles.map((profile) => (
          <Link
            href={`/users/${profile?.username}`}
            key={profile.id}
            className="flex flex-col items-center text-sm hover:opacity-80 transition flex-shrink-0"
          >
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full border-2 border-pink-500 overflow-hidden">

              {/* <div className="w-16 h-16 "> */}

              <Avatar src={profile.avatar} />
            </div>
            <span className="mt-1 truncate w-14 sm:w-16 text-center text-zinc-700 dark:text-gray-300 text-xs sm:text-sm">
              {profile.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
