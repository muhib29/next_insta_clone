'use client';
import { Avatar, Button, TextArea } from "@radix-ui/themes";
import { postComment } from "../action";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function CommentForm({
  postId,
  avatar,
}: {
  postId: string;
  avatar: string;
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
        router.refresh();
      }}
      className="w-full"
    >
      <input type="hidden" name="postId" value={postId} />
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar fallback="..." src={avatar} />
        </div>

        {/* Textarea and Button */}
        <div className="w-full flex flex-col gap-2">
          <TextArea
            ref={areaRef}
            name="text"
            placeholder="Tell the world what you think..."
            className="resize-none text-sm"
            rows={3}
          />
          <div className="self-end">
            <Button size="2">Post comment</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
