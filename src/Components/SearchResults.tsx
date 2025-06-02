"use client";

import { Post, Profile } from "@prisma/client";
import PostGrid from "./PostsGrid";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";

type ExtendedPost = Post & {
  _count: {
    likes: number;
    comments: number;
  };
};

export default async function SearchResults({
  loading,
  query,
  profiles,
  posts,
  onCancel,
}: {
  loading: boolean;
  query: string;
  profiles: Profile[];
  posts: ExtendedPost[];
  onCancel: () => void;
}) {
  const session = await auth();
  const currentUserId = session?.user?.email || ''; // or session?.user?.id
  return (
    <div className="mt-4 w-full space-y-8">
      <div className="space-y-1">
        <h3 className="text-lg font-bold dark:text-zinc-300 text-white">
          Results for <span className="italic text-purple-600">{`"${query}"`}</span>
        </h3>
        {loading && (
         <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          Searching...
        </div>
        )}
      </div>

      {!loading && (
        <>
          {/* Profiles */}
          <section>
            <h4 className="text-sm font-semibold text-white dark:text-zinc-300 mb-3">
              Profiles
            </h4>
            {profiles.length === 0 ? (
              <p className="text-sm italic text-zinc-200 dark:text-zinc-400">
                No profiles found.
              </p>
            ) : (
           <ul className="space-y-3">
              {profiles.map((profile) => (
                <Link
                  href={`/users/${profile.username ?? ""}`}
                  onClick={onCancel}
                  key={profile.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-md border border-white/10 dark:border-white/10 transition group"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-purple-500 group-hover:ring-purple-400 transition">
                    <Image
                      src={profile.avatar || "/default-avatar.png"}
                      alt={profile.name || ""}
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{profile.name}</p>
                    <p className="text-xs text-purple-300">@{profile.username}</p>
                  </div>
                </Link>
              ))}
            </ul>
            )}
          </section>

          {/* Posts */}
          <section>
            <h4 className="text-sm font-semibold text-white dark:text-zinc-300 mb-3 mt-4">
              Posts
            </h4>
            {posts.length === 0 ? (
              <p className="text-sm italic text-zinc-200 dark:text-zinc-400">
                No posts found.
              </p>
            ) : (
              <div className="scale-[1.02] sm:scale-100 transition-transform duration-300">
                <PostGrid posts={posts}  currentUserId={currentUserId}/>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
