'use client';
import { Bookmark, Grid, TagIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileNav({ 
  isOurProfile = false,
  username,
}: {
  isOurProfile: boolean;
  username: string;
}) {
  const path = usePathname();
  const bookmarkedActive = path.includes("/bookmark");
  const highlightsActive = path.includes("/saved");
  const postsActive = !bookmarkedActive && !highlightsActive;

  const baseLinkClasses =
    "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 transition-colors duration-200";
  const activeClasses =
    "text-black dark:text-white border-b-2 border-purple-500";
  const inactiveClasses =
    "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white";

  return (
    <div className="w-full max-w-4xl border-t bg-white dark:bg-black border-gray-300 dark:border-gray-700 mt-8 mx-auto transition-colors duration-300">
      <div className="flex justify-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm font-medium">
        <Link
          href={isOurProfile ? `/profile/` : `/users/${username}/`}
          className={`${baseLinkClasses} ${postsActive ? activeClasses : inactiveClasses}`}
        >
          <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Posts</span>
        </Link>

        <Link
          href="/profile/bookmark"
          className={`${baseLinkClasses} ${bookmarkedActive ? activeClasses : inactiveClasses}`}
        >
          <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Saved</span>
        </Link>

        <Link
          href="/saved"
          className={`${baseLinkClasses} ${highlightsActive ? activeClasses : inactiveClasses}`}
        >
          <TagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Tagged</span>
        </Link>
      </div>
    </div>
  );
}
