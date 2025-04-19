"use client";

import { useState, useTransition } from "react";
import { removeFollowerById } from "@/action";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function RemoveFollowerButton({ followerId }: { followerId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isRemoved, setIsRemoved] = useState(false);

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeFollowerById(followerId);
        toast.success("Follower removed");
        setIsRemoved(true);
      } catch (error: unknown) {
        // Type guard to check if error is an instance of Error
        if (error instanceof Error) {
          toast.error(error.message || "Something went wrong");
        } else {
          toast.error("Something went wrong");
        }
      }
    });
  };
  
  return (
    <button
      onClick={handleRemove}
      disabled={isPending || isRemoved}
      className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200  
        ${
          isRemoved
            ? " text-gray-400 cursor-not-allowed  bg-slate-800"
            : "text-white bg-gray-700"
        } 
        flex items-center gap-2`} 
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Removing...
        </>
      ) : isRemoved ? (
        "Removed"
      ) : (
        "Remove"
      )}
    </button>
  );
}
