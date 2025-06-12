'use client';
import { Avatar, Button } from "@radix-ui/themes";
import { postComment } from "../action";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function CommentForm({
  postId,
  avatar,
  mutate,
}: {
  postId: string;
  avatar: string;
  mutate: () => void;
}) {
  const router = useRouter();
  const areaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      action={async (data) => {
        if (areaRef.current) {
          areaRef.current.value = '';
        }
        await postComment(data);
        mutate();
        router.refresh();
      }}
      className="w-full"
    >
      <input type="hidden" name="postId" value={postId} />
      <div className="flex flex-col sm:flex-row gap-2 ">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar fallback="..." src={avatar} />
        </div>

        {/* Textarea and Button */}
        <div className="w-full flex flex-col gap-2 ]">
          <textarea
            ref={areaRef}
            name="text"
            placeholder="Tell the world what you think..."
            rows={3}
            className="resize-none text-sm bg-white text-black dark:bg-black dark:text-white 
              placeholder:text-neutral-500 dark:placeholder:text-neutral-400 
              p-3 rounded-md border border-zinc-300 dark:border-zinc-700 
              focus:outline-none focus:ring-2 focus:ring-zinc-300  dark:focus:ring-zinc-500 focus:ring-offset-0 
              transition"
                      />
          <div className="self-end">
            <Button size="2">Post comment</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
