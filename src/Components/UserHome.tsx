"use client";
import { Profile, Post } from "@prisma/client";
import PostCard from "./PostCard";

type MediaType = "image" | "video";

type ExtendedPost = Post & {
  media: {
    id: string;
    url: string;
    type: MediaType;
    postId: string;
  }[];
  image: string | null;
  video: string | null;
  _count: {
    likes: number;
    comments: number;
  };
};

interface UserHomeProps {
  profiles: Profile[];
  posts: ExtendedPost[];
  likes: {
    id: string;
    author: string;
    createdAt: Date;
    postId: string;
  }[];
  bookmarks: {
    id: string;
    author: string;
    createdAt: Date;
    postId: string;
  }[];
  sessionEmail: string;
}

export default function UserHome({
  profiles,
  posts,
  likes,
  bookmarks,
  sessionEmail,
}: UserHomeProps) {

  return (
    <div className="max-w-md mx-auto flex flex-col gap-12 mt-6">
      {posts.map((post) => {
        const profile = profiles.find((p) => p.email === post.author);
        const like = likes.find((l) => l.postId === post.id);
        const bookmark = bookmarks.find((b) => b.postId === post.id);

        return (
          <PostCard
            key={post.id}
            post={post}
            profile={profile}
            like={like ?? null}
            bookmark={bookmark ?? null}
            sessionEmail={sessionEmail}
          />

        );
      })}
    </div>
  );
}
