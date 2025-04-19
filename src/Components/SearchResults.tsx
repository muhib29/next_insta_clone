"use client";

import { Post, Profile } from "@prisma/client";
import PostGrid from "./PostsGrid";
import Image from "next/image";
import Link from "next/link";

export default function SearchResults({
  query,
  profiles,
  posts,
  onCancel,
}: {
  query: string;
  profiles: Profile[];
  posts: Post[];
  onCancel: () => void;
}) {
  return (
    <div className="p-6 w-full  shadow-md bg-white text-black dark:bg-black dark:text-white">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
        Search Results for <span className="italic">&quot;{query}&quot;</span>
      </h3>

      {/* Profiles Section */}
      <section className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Profiles
        </h4>
        {profiles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No profiles found.</p>
        ) : (
          <ul className="space-y-4">
            {profiles.map((profile) => (
              <Link
                onClick={onCancel}
                href={`/users/${profile.username ?? ""}`}
                key={profile.id}
                className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-[#121212] rounded-lg transition hover:scale-[1.01] hover:shadow-md hover:bg-gray-200 dark:hover:bg-[#1f1f1f] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                  <Image
                    src={profile.avatar || "/default-avatar.png"}
                    alt={profile.name || ""}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {profile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{profile.username}
                  </p>
                </div>
              </Link>
            ))}
          </ul>
        )}
      </section>

      {/* Posts Section */}
      {posts.length > 0 && (
        <section className="mt-10">
          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Posts
          </h4>
          <div className="scale-[1.1] sm:scale-100">
            <PostGrid posts={posts} />
          </div>
        </section>
      )}
    </div>
  );
}
