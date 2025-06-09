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
import { ChevronLeft, ChevronRight } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { useSwipeable } from "react-swipeable";

// Post type includes media
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
}: {
  post: PostWithMedia;
  authorProfile: Profile | null;
  myLike: Like | null;
  comments: CommentModel[];
  commentsAuthors: Profile[];
  myBookmark: Bookmark | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const media = post.media || [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  if (media.length === 0) {
    return <div className="text-white text-center p-4">No media available</div>;
  }

  return (
    <div className="max-w-5xl h-auto md:h-[600px] mx-auto flex flex-col md:flex-row bg-white dark:bg-black border border-[#ebebeb] dark:border-neutral-700 rounded-lg overflow-hidden shadow-sm">
      {/* Media Section */}
      <div
        className="relative w-full md:w-1/2 bg-black flex justify-center items-center overflow-hidden"
        {...swipeHandlers}
      >
        <div className="w-full h-[300px] md:h-full flex justify-center items-center">
          {media[currentIndex].type === "video" ? (
            <video
              src={media[currentIndex].url}
              className="max-h-full max-w-full object-contain"
              controls
              muted
              playsInline
            />
          ) : (
            <Image
              src={media[currentIndex].url}
              alt={`Post media ${currentIndex}`}
              width={500}
              height={500}
              className="object-contain max-h-full max-w-full"
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40  p-2 rounded-full  text-white hover:bg-opacity-60"
            >
              <ChevronLeft className="text-white" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40  p-2 rounded-full  text-white hover:bg-opacity-60"
            >
              <ChevronRight className="text-white" />
            </button>


            {/* Indicator Dots */}
            <div className="absolute bottom-2 w-full flex justify-center space-x-2">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/30"}`}
                />
              ))}

            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="md:w-1/2 flex flex-col justify-between p-4">
        {/* Description */}
        <div className="mb-4 border-b border-[#ebebeb] dark:border-neutral-700 pb-2">
          <Comment
            authorProfile={authorProfile}
            createdAt={post.createdAt}
            text={post.description}
            commentsID=""
            showDeleteIcon={false}
          />
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-scroll space-y-4 max-h-[30vh] md:max-h-[40vh] pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              createdAt={comment.createdAt}
              text={comment.text}
              commentsID={comment.id}
              authorProfile={commentsAuthors.find(
                (a) => a.email === comment.author
              )}
              showDeleteIcon={true}
            />
          ))}
        </div>

        {/* Likes + Bookmark */}
        <div className="flex text-gray-700 dark:text-gray-400 items-center gap-2 justify-between py-4 mt-4 border-t border-gray-300 dark:border-gray-700">
          <LikesInfo post={post} sessionLike={myLike} showText={false} />
          <div className="flex items-center">
            <BookmarkButton post={post} sessionBookmark={myBookmark} />
          </div>
        </div>

        {/* Comment Form */}
        <div className="pt-4 border-t border-[#ebebeb] dark:border-neutral-700 mt-2">
          <Suspense fallback={<Preloader />}>
            <SessionCommentForm postId={post.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
