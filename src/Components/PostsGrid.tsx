'use client';

import toast, { Toaster } from 'react-hot-toast';
import { deletePost } from '@/action';
import { Post } from '@prisma/client';
import { HeartIcon, MessageCircle, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';

export type ExtendedPost = Post & {
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function PostGrid({
  posts,
  currentUserId,
}: {
  posts: ExtendedPost[];
  currentUserId: string;
}) {
  function handleDelete(postId: string) {
    toast.custom(
      (t) => (
        <div
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${t.visible ? 'animate-enter' : 'animate-leave'
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
    <div className="max-w-4xl mx-auto px-4 mt-6">
      <Masonry
        breakpointCols={{
          default: 3,
          1024: 3,
          768: 2,
          500: 1,
        }}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {posts.map((post) => {
          const firstMedia = post.media?.[0];

          return (
            <div key={post.id} className="relative group">
              <Link
                href={`/posts/${post.id}`}
                className="block mb-4 overflow-hidden rounded-lg shadow-lg"
              >
                {/* Only render first media (image or video) */}
                {firstMedia?.type === 'video' ? (
                  <video
                    className="w-full object-cover transition duration-300 ease-in-out group-hover:opacity-70"
                    src={firstMedia.url}
                    preload="auto"
                    muted
                    playsInline
                    autoPlay
                    loop
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

                {/* Overlay for likes/comments */}
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
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
      </Masonry>
      <Toaster />
    </div>
  );
}
