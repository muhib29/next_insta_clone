'use client';
import { Avatar } from "@radix-ui/themes";
import { format } from 'date-fns';
import { DeleteIcon, Edit2Icon, Verified } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComment, updateComment } from "@/action";
import { Profile } from "@prisma/client";

export default function Comment({
  text,
  createdAt,
  authorProfile,
  commentsID,
  showDeleteIcon,
  mutate, // <- add this
}: {
  text: string;
  createdAt: Date;
  authorProfile?: Profile | null;
  commentsID: string;
  showDeleteIcon: boolean;
  mutate: () => void;
}) {

  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text); // state for editable text

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      mutate();
      router.refresh();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleEdit = async () => {
    if (editText !== text) { // Check if the text is changed
      try {
        await updateComment(commentsID, editText); // Make sure you have an updateComment function in your actions
        setIsEditing(false);
        mutate();
        router.refresh();
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    } else {
      setIsEditing(false);
    }
  };

  return (
<div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
  <Avatar fallback="image" src={authorProfile?.avatar || ''} />
  <div className="w-full">
    <div className="flex justify-between gap-2">
      <div>
        <h3 className="flex gap-1 items-center dark:text-gray-300 text-sm sm:text-base">
          {authorProfile?.name}
          <Verified className="w-4 h-4 text-blue-500" />
        </h3>
        <h4 className="text-gray-600 dark:text-gray-500 text-xs sm:text-sm -mt-1">
          @{authorProfile?.username}
        </h4>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 bg-gray-200 dark:bg-[#363636] border dark:border-0 dark:text-gray-400 border-gray-300 rounded-md p-3 mt-2">
      <div className="w-full">
        {isEditing ? (
          <textarea
            className="w-full p-2 border dark:border-gray-600 rounded-md resize-none text-sm"
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        ) : (
          <p className="text-sm">{text}</p>
        )}
      </div>
      {showDeleteIcon && (
        <div className="flex gap-2 mt-2 sm:mt-0">
          {isEditing ? (
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={handleEdit}
            >
              Save
            </button>
          ) : (
            <button
              className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
              onClick={() => setIsEditing(true)}
            >
              <Edit2Icon className="w-4 h-4" />
            </button>
          )}
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(commentsID)}
          >
            <DeleteIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
    <div className="text-xs text-gray-400 text-right mt-1">
      {format(createdAt, 'yyyy-MM-dd HH:mm:ss')}
    </div>
  </div>
</div>

  );
}
