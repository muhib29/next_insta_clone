  "use client";

  import { followProfile, unfollowProfile } from "@/action";
  import { Follower } from "@prisma/client";
  import { UserMinusIcon, UserPlusIcon } from "lucide-react";
  import { useRouter } from "next/navigation";
  import { useState } from "react";

  export default function FollowButton({
    profileIdToFollow,
    ourFollow = null,
  }: {
    profileIdToFollow: string;
    ourFollow: Follower | null;
  }) {
    const router = useRouter();
    const [isFollowed, setIsFollowed] = useState<boolean>(!!ourFollow);

    return (
      <form
        action={async () => {
          setIsFollowed((prev) => !prev);
          if (isFollowed) {
            await unfollowProfile(profileIdToFollow);
          } else {
            await followProfile(profileIdToFollow);
          }
          router.refresh();
        }}
        className="flex items-center"
      >
        <button
          type="submit"
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
            ${
              isFollowed
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-purple-700 text-white hover:bg-purple-800"
            }`}
        >
          {isFollowed ? <UserMinusIcon size={16} /> : <UserPlusIcon size={16} />}
          {isFollowed ? "Unfollow" : "Follow"}
        </button>
      </form>
    );
  }
