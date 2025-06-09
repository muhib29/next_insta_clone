'use client';

import { Profile, Post } from '@prisma/client';
import toast, { Toaster } from 'react-hot-toast';
import { deletePost } from '@/action';
import { HeartIcon, MessageCircle, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type ExtendedPost = Post & {
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function SearchResults({
  loading,
  query,
  profiles,
  posts,
  onCancel,
  currentUserId,
}: {
  loading: boolean;
  query: string;
  profiles: Profile[];
  posts: ExtendedPost[];
  onCancel: () => void;
  currentUserId: string;
}) {
  function handleDelete(postId: string) {
    toast.custom(
      (t) => (
        <div
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
            t.visible ? 'animate-enter' : 'animate-leave'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex-1 px-4 py-3 flex items-center justify-between space-x-4">
            <p className="text-gray-900 font-medium">Are you sure you want to delete this post?</p>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await deletePost(postId);
                    toast.success('Post deleted successfully');
                    window.location.reload();
                  } catch {
                    toast.error('Failed to delete post');
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
              >
                Yes
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center',
      }
    );
  }

  return (
    <div className="mt-4 w-full space-y-8">
      <div className="space-y-1">
        <h3 className="text-lg font-bold dark:text-zinc-300 text-white">
          Results for <span className="italic text-purple-600">{`"${query}"`}</span>
        </h3>
        {loading && (
          <div
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
            role="status"
            aria-live="polite"
          >
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
              <p className="text-sm italic text-zinc-200 dark:text-zinc-400">No profiles found.</p>
            ) : (
              <ul className="space-y-3">
                {profiles.map((profile) => (
                  <Link
                    href={`/users/${profile.username ?? ''}`}
                    onClick={onCancel}
                    key={profile.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-md border border-white/10 dark:border-white/10 transition group"
                    aria-label={`View profile of ${profile.name ?? profile.username}`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-purple-500 group-hover:ring-purple-400 transition">
                      <Image
                        src={profile.avatar || '/userImage.png'}
                        alt={profile.name || ''}
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
              <p className="text-sm italic text-zinc-200 dark:text-zinc-400">No posts found.</p>
            ) : (
              <div className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const firstMedia = post.media?.[0];

                  return (
                    <div key={post.id} className="relative group rounded-lg overflow-hidden shadow-lg">
                      <Link
                        href={`/posts/${post.id}`}
                        className="block"
                        onClick={onCancel}
                        aria-label={`View post by user ${post.author}`}
                      >
                        {firstMedia?.type === 'video' ? (
                          <video
                            className="w-full object-cover transition duration-300 ease-in-out group-hover:opacity-70"
                            src={firstMedia.url}
                            muted
                            playsInline
                          />
                        ) : firstMedia?.type === 'image' ? (
                          <Image
                            className="w-full object-cover transition duration-300 ease-in-out group-hover:opacity-70"
                            src={firstMedia.url}
                            alt="Post Media"
                            width={600}
                            height={400}
                          />
                        ) : null}

                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                          <div className="text-white text-center z-50 flex gap-5 sm:gap-2 text-md sm:text-sm">
                            <p className="font-semibold flex items-center gap-2 sm:gap-1">
                              <HeartIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                              <span>{post._count?.likes ?? 0}</span>
                            </p>
                            <p className="font-semibold flex items-center gap-2 sm:gap-1">
                              <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                              <span>{post._count?.comments ?? 0}</span>
                            </p>
                          </div>
                        </div>
                      </Link>

                      {/* Delete button */}
                      {post.author === currentUserId && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          title="Delete Post"
                          className="absolute top-2 right-2 z-50 p-1.5 rounded-full
                          backdrop-blur-md bg-black/30 text-white shadow-lg
                          border border-white/20 hover:bg-red-600 hover:shadow-red-500/50
                          hover:scale-110 transition-all duration-300 ease-in-out
                          opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                        >
                          <TrashIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
      <Toaster />
    </div>
  );
}
