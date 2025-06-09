"use client"; 

import { useState } from "react";
import LikesInfo from "@/Components/LikesInfo";
import { Profile, Post } from "@prisma/client";
import { Avatar } from "@radix-ui/themes";
import { MessageCircle, Verified, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import BookMarkButton from "./BookmarkButton";
import Image from "next/image";

type MediaType = "image" | "video";

type ExtendedPost = Post & {
  media: {
    id: string;
    url: string;
    type: MediaType;
    postId: string;
  }[];
  image: string | null;
  video: string | null;
  _count: {
    likes: number;
    comments: number;
  };
};


interface UserHomeProps {
  profiles: Profile[];
  posts: ExtendedPost[];
  likes: {
    id: string;
    author: string;
    createdAt: Date;
    postId: string;
  }[];
  bookmarks: {
    id: string;
    author: string;
    createdAt: Date;
    postId: string;
  }[];
  sessionEmail: string;
}


export default function UserHome({
  profiles,
  posts,
  likes,
  bookmarks,
}: UserHomeProps) {
  // Track current media index per post by postId
  const [currentMediaIndex, setCurrentMediaIndex] = useState<Record<string, number>>({});

  const handlePrev = (postId: string, mediaLength: number) => {
    setCurrentMediaIndex((prev) => {
      const current = prev[postId] ?? 0;
      return {
        ...prev,
        [postId]: (current - 1 + mediaLength) % mediaLength,
      };
    });
  };

  const handleNext = (postId: string, mediaLength: number) => {
    setCurrentMediaIndex((prev) => {
      const current = prev[postId] ?? 0;
      return {
        ...prev,
        [postId]: (current + 1) % mediaLength,
      };
    });
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-12 mt-6">
      {posts.map((post) => {
        const profile = profiles.find((p) => p.email === post.author);

        const mediaItems = post.media;
        const mediaCount = mediaItems.length;
        const currentIndex = currentMediaIndex[post.id] ?? 0;
        const currentMedia = mediaItems[currentIndex];

        return (
          <div
            key={post.id}
            className="rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-md bg-white dark:bg-black transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar
                  radius="full"
                  src={profile?.avatar || "/userImage.png"}
                  size="2"
                  fallback="A"
                />
                <Link
                  href={`/users/${profile?.username}`}
                  className="font-medium text-sm flex items-center gap-1 text-zinc-800 dark:text-white"
                >
                  {profile?.username}
                  <Verified className="w-4 h-4 text-blue-500" />
                </Link>
              </div>
              <div className="text-xs text-zinc-500">1w</div>
            </div>

            {/* Media carousel with navigation */}
            <div className="relative">
              <Link href={`/posts/${post.id}`}>
                <div className="w-full h-[500px] bg-black flex items-center justify-center overflow-hidden rounded-md relative">
                  {mediaCount > 0 ? (
                    <>
                      {currentMedia.type === "video" ? (
                        <video
                          src={currentMedia.url}
                          className="w-full h-full object-contain rounded-md"
                          controls
                          preload="auto"
                          muted
                          playsInline
                        />
                      ) : (
                        <Image
                          src={currentMedia.url}
                          alt={`Media ${currentIndex + 1} of ${mediaCount}`}
                          fill
                          className="object-contain rounded-md"
                        />
                      )}

                      {/* Navigation buttons */}
                      {mediaCount > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handlePrev(post.id, mediaCount);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 rounded-full p-1  text-white   hover:bg-opacity-60"
                            aria-label="Previous media"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleNext(post.id, mediaCount);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 rounded-full p-1  text-white hover:bg-opacity-60"
                            aria-label="Next media"
                          >
                            <ChevronRight size={24} />
                          </button>
                          <div className="absolute bottom-2 w-full flex justify-center space-x-2">
                            {mediaItems.map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentMediaIndex((prev) => ({ ...prev, [post.id]: i }));
                                }}
                                aria-label={`Show media ${i + 1} of ${mediaItems.length}`}
                                aria-current={i === currentIndex ? "true" : undefined}
                                className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/30"}`}
                              />
                            ))}

                          </div>
                        </>

                      )}
                    </>
                  ) : (
                    <div className="text-white text-center w-full h-full flex items-center justify-center">
                      No media available
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Icons */}
            <div className="flex justify-between items-center px-4 pt-3">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-white">
                <LikesInfo
                  post={post}
                  showText={false}
                  sessionLike={likes.find((like) => like.postId === post.id) || null}
                />
                <Link href={`/posts/${post.id}`} className="hover:opacity-70">
                  <MessageCircle className="w-6 h-6" />
                </Link>
              </div>
              <div>
                <BookMarkButton
                  post={post}
                  sessionBookmark={bookmarks.find((b) => b.postId === post.id) || null}
                />
              </div>
            </div>

            {/* Likes count */}
            <p className="text-sm px-4 pt-2 font-semibold text-zinc-800 dark:text-white">
              {post._count.likes} likes
            </p>

            {/* Description */}
            <div className="px-4 pt-1 pb-2">
              <p className="text-sm leading-snug text-zinc-800 dark:text-white">
                <span className="font-semibold">{profile?.username}</span>{" "}
                {post.description}
              </p>
              <Link
                href={`/posts/${post.id}`}
                className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 block"
              >
                {post._count.comments > 0 ? (
                  <span>View all {post._count.comments} comments</span>
                ) : (
                  <span>Add a comment...</span>
                )}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
