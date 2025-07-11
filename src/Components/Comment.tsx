'use client';

import { Avatar } from "@radix-ui/themes";
import { format } from 'date-fns';
import {  Edit2Icon, Trash2Icon, Verified } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComment, updateComment } from "@/action";
import { Profile } from "@prisma/client";
import Link from "next/link";

export default function Comment({
  text,
  createdAt,
  authorProfile,
  commentsID,
  showDeleteIcon,
  mutate,
  currectUser,
}: {
  text: string;
  createdAt: Date;
  authorProfile?: Profile | null;
  commentsID: string;
  showDeleteIcon: boolean;
  mutate: () => void;
  currectUser?: { email: string } | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

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
    if (editText !== text) {
      try {
        await updateComment(commentsID, editText);
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
    <div className="flex gap-3">
      <Link href={currectUser?.email === authorProfile?.email ? "/profile" : `/users/${authorProfile?.username}`}>
        <Avatar className="w-9 h-9 rounded-full" fallback="IMG" src={authorProfile?.avatar || ''} />
      </Link>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Link href={currectUser?.email === authorProfile?.email ? "/profile" : `/users/${authorProfile?.username}`}>
              <span className="text-sm font-medium text-black dark:text-white hover:underline transition">{authorProfile?.username}</span>
            </Link>
            <Verified className="w-4 h-4 text-blue-500" />
          </div>

          {showDeleteIcon && (
            <div className="flex gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              {isEditing ? (
                <button onClick={handleEdit} className="text-blue-500 hover:underline transition">Save</button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="hover:text-blue-500 transition">
                  <Edit2Icon className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => handleDelete(commentsID)} className="hover:text-red-500 transition">
                <Trash2Icon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-1">
          {isEditing ? (
            <textarea
              className="w-full text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
          ) : (
            <p className="text-sm text-black dark:text-neutral-200">{text}</p>
          )}
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block">
          {format(createdAt, "MMM dd, yyyy")}
        </span>
      </div>
    </div>
  );
}