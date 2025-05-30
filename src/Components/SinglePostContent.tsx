import { Post, Profile, Like, Comment as CommentModel, Bookmark } from "@prisma/client";
import LikesInfo from "./LikesInfo";
import Comment from "./Comment";
import { Suspense } from "react";
import SessionCommentForm from "./SessionCommentForm";
import Preloader from "./Preloader";
import Image from "next/image";
import BookmarkButton from "./BookmarkButton";

export default function SinglePostContent({
  post,
  authorProfile,
  myLike,
  comments,
  commentsAuthors,
  myBookmark,
}: {
  post: Post;
  authorProfile: Profile | null;
  myLike: Like | null;
  comments: CommentModel[];
  commentsAuthors: Profile[];
  myBookmark: Bookmark | null;
}) {
  return (
    <div className="max-w-5xl h-[600px] mx-auto bg-white dark:bg-black border border-neutral-700 rounded-lg overflow-hidden shadow-sm md:flex">
      <div className="md:w-1/2 h-full bg-black flex justify-center items-center overflow-hidden relative">
        <Image
          src={post.image}
          alt="Post"
          className="object-contain"
          layout="fill" // Makes the image take up the full space of its parent container
          objectFit="contain" // Ensures the image will be contained without cropping
          quality={100} // Optional: You can set the quality of the image (default is 75)
          //  width={600} 
              // height={400} 
          
        />
      </div>

      {/* Right: Content */}
      <div className="md:w-1/2 flex flex-col justify-between p-4">

        {/* Description as first comment (author) */}
        <div className="mb-4 border-b border-neutral-700 pb-2">
          <Comment
            authorProfile={authorProfile}
            createdAt={post.createdAt}
            text={post.description}
            commentsID=""
            showDeleteIcon={false}
          />
        </div>

        {/* Scrollable Comments Section */}
        <div className="flex-1 overflow-y-scroll space-y-4 max-h-[40vh] pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
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

        {/* Likes Info */}
        <div className="flex text-gray-700 dark:text-gray-400 items-center gap-2 justify-between py-4 mt-4 border-t border-gray-300 dark:border-gray-700">
          <LikesInfo post={post} sessionLike={myLike} showText={false}/>
          <div className="flex items-center">
            <BookmarkButton
              post={post}
              sessionBookmark={myBookmark}
            />
          </div>
        </div>
        {/* Add Comment */}
        <div className="pt-4 border-t border-neutral-700 mt-2">
          <Suspense fallback={<Preloader />}>
            <SessionCommentForm postId={post.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
