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
}: {
  text: string;
  createdAt: Date;
  authorProfile?: Profile | null;
  commentsID: string;
  showDeleteIcon: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text); // state for editable text

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
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
        router.refresh();
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div>
        <Avatar fallback="image" src={authorProfile?.avatar || ''} />
      </div>
      <div className="w-full">
        <div className="flex justify-between gap-2">
          <div>
            <h3 className="flex gap-1 items-center dark:text-gray-300">
              {authorProfile?.name} <Verified className="w-4 h-4 text-blue-500" />
            </h3>
            <h4 className="text-gray-600 dark:text-gray-500 text-sm -mt-1">
              @{authorProfile?.username}
            </h4>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center bg-gray-200 dark:bg-[#363636] border dark:border-0 dark:text-gray-400 border-gray-300 rounded-md p-4 mt-2">
            {isEditing ? (
              <textarea
                className="w-full p-2 border dark:border-gray-600 rounded-md"
                value={editText}
                onChange={(e) => setEditText(e.target.value)} // Handle text change
              />
            ) : (
              <p>{text}</p>
            )}
            {showDeleteIcon && (
              <div className="flex gap-1">
                {isEditing ? (
                  <button
                    className="cursor-pointer"
                    onClick={handleEdit}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="cursor-pointer"
                    onClick={() => setIsEditing(true)} // Set editing mode on click
                  >
                    <Edit2Icon />
                  </button>
                )}
                <button
                  className="cursor-pointer"
                  onClick={() => handleDelete(commentsID)}
                >
                  <DeleteIcon />
                </button>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 text-right">
            {format(createdAt, 'yyyy-MM-dd HH:mm:ss')}
          </div>
        </div>
      </div>
    </div>
  );
}
