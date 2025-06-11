'use client';
import { likePost, removeLikeFromPost } from "@/action";
import { Like, Post } from "@prisma/client";
import { HeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function LikesInfo({
  post,
  sessionLike,
  showText,
  mutate,
}: {
  post: Post;
  sessionLike: Like | null;
  showText: boolean;
  mutate: () => void;
}) {
  const [likedByMe, setLikedByMe] = useState(!!sessionLike);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLikeToggle = async (formData: FormData) => {
    try {
      if (likedByMe) {
        await removeLikeFromPost(formData);
      } else {
        await likePost(formData);
      }

      // Optimistically update UI without full refresh
      mutate(); // This refetches the posts
      router.refresh();
      setLikedByMe((prev) => !prev);
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  return (
    <form action={handleLikeToggle} className="flex items-center gap-2">
      <input type="hidden" name="postId" value={post.id} />
      <button
        type="submit"
        className=""
        disabled={isPending}
        title={likedByMe ? "Unlike" : "Like"}
      >
        <HeartIcon
          className={`w-6 h-6 transition-colors duration-200 ${likedByMe ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-white'}`}
        />
      </button>
      {showText && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {post.likesCount} {post.likesCount === 1 ? 'person likes' : 'people like'} this
        </p>
      )}
    </form>
  );
}
