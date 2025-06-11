"use client";

import {
  Prisma,
  Profile,
  Like,
  Comment as CommentModel,
  Bookmark,
} from "@prisma/client";
import LikesInfo from "./LikesInfo";
import Comment from "./Comment";
import { Suspense, useState } from "react";
import SessionCommentForm from "./SessionCommentForm";
import Preloader from "./Preloader";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";
import { Avatar } from "@radix-ui/themes";

type PostWithMedia = Prisma.PostGetPayload<{
  include: { media: true };
}>;

export default function SinglePostContent({
  post,
  authorProfile,
  myLike,
  comments,
  commentsAuthors,
  myBookmark,
  currectUser,
  mutate,
}: {
  post: PostWithMedia;
  authorProfile: Profile | null;
  myLike: Like | null;
  comments: CommentModel[];
  commentsAuthors: Profile[];
  myBookmark: Bookmark | null;
  currectUser: Profile | null;
  mutate: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const media = post.media || [];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? media.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === media.length - 1 ? 0 : prev + 1
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  return (
    <div className="grid max-w-5xl grid-cols-1 md:grid-cols-2 h-full max-h-[calc(100vh-4rem)] mx-auto bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-sm">
      {/* Left: Media */}
      <div
        className="relative w-full  bg-white dark:bg-black   md:rounded-l-lg flex items-center justify-center"
        style={{ aspectRatio: "4 / 5", maxHeight: "calc(100vh - 4.5rem)" }}
        {...swipeHandlers}
      >
        <div className="absolute inset-0 flex items-center justify-center  bg-white dark:bg-black ">
          {media[currentIndex]?.type === "video" ? (
            <video
              src={media[currentIndex].url}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              playsInline
              key={media[currentIndex].url}
            />
          ) : (
            <Image
              src={media[currentIndex]?.url || "/placeholder.png"}
              alt={`Post media ${currentIndex + 1}`}
              width={1000}
              height={1000}
              className="max-w-full max-h-full object-contain"
              priority
            />
          )}
        </div>

        {media.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-zinc-800/70 p-2 rounded-full text-black dark:text-white hover:bg-white/90 dark:hover:bg-zinc-700/70 backdrop-blur-sm transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-zinc-800/70 p-2 rounded-full text-black dark:text-white hover:bg-white/90 dark:hover:bg-zinc-700/70 backdrop-blur-sm transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 w-full flex justify-center gap-1">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition ${i === currentIndex ? "bg-zinc-900 dark:bg-white" : "bg-zinc-400 dark:bg-zinc-600"}`}
                />
              ))}
            </div>

          </>
        )}
      </div>

      {/* Right: Comments and Actions */}
      <div className="flex flex-col  bg-white dark:bg-black ">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black">
          <Link
            href={`/users/${authorProfile?.username}`}
            className="flex items-center gap-3"
          >
            <Avatar className="w-10 h-10" fallback="IMG" src={authorProfile?.avatar || ""} />
            <span className="font-semibold text-sm text-black dark:text-white">{authorProfile?.username}</span>
          </Link>
          <MoreHorizontal className="text-white cursor-pointer" />
        </div>

        {/* Scrollable Comments Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-500 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {post.description && (
            <Comment
              authorProfile={authorProfile}
              createdAt={post.createdAt}
              text={post.description}
              commentsID=""
              showDeleteIcon={false}
              mutate={mutate}
              currectUser={currectUser}
            />
          )}
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                createdAt={comment.createdAt}
                text={comment.text}
                commentsID={comment.id}
                authorProfile={commentsAuthors.find((a) => a.email === comment.author)}
                showDeleteIcon={currectUser?.email === comment.author}
                mutate={mutate}
                currectUser={currectUser}
              />
            ))
          ) : (
            <div className="text-center flex items-center justify-between  flex-col mt-12">
              <h1 className="text-xl text-zinc-700 dark:text-white font-bold">No comments yet.</h1>
              <p className="text-lg text-zinc-700 dark:text-zinc-300">Start the conversation.</p>
            </div>
          )}
        </div>

        {/* Like & Bookmark */}
        <div className="px-4 py-3 border-t border-zinc-300 dark:border-zinc-700 flex justify-between items-center bg-white  dark:bg-black">
          <LikesInfo post={post} sessionLike={myLike} showText  mutate={mutate}/>
          <BookmarkButton post={post} sessionBookmark={myBookmark} />
        </div>

        {/* Add Comment */}
        <div className="px-4 py-3 border-t border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black">
          <Suspense fallback={<Preloader />}>
            <SessionCommentForm postId={post.id} mutate={mutate} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
