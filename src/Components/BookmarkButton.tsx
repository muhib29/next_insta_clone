'use client';
import {bookmarkPost, unbookmarkPost} from "@/action";
import {Like, Post} from "@prisma/client";
import {BookmarkIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function BookmarkButton({
  post,
  sessionBookmark,
}:{
  post:Post;
  sessionBookmark:Like|null;
}) {
  const router = useRouter();
  const [bookmarkedByMe, setBookmarkedByMe] = useState(!!sessionBookmark);
  return (
    <form
      action={async () => {
        setBookmarkedByMe(prev => !prev);
        if (bookmarkedByMe) {
          await unbookmarkPost(post.id);
        } else {
          await bookmarkPost(post.id);
        }
        router.refresh();
      }}
      className="flex items-center gap-2">
      <input type="hidden" name="postId" value={post.id}/>
      <button
        type="submit"
        className="cursor-pointer">
       <BookmarkIcon 
  className={`cursor-pointer 
    ${bookmarkedByMe 
      ? 'fill-black text-black dark:fill-white dark:text-white' 
      : 'fill-none text-black dark:text-white'}`}
/>

      </button>
    </form>
  );
}