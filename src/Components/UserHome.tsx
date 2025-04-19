import { getSessionEmailOrThrow } from "@/action";
import LikesInfo from "@/Components/LikesInfo";
import { prisma } from "@/db";
import {  Profile } from "@prisma/client";
import { Avatar } from "@radix-ui/themes";
import {  MessageCircle, Verified } from "lucide-react";
import Link from "next/link";
import BookMarkButton from "./BookmarkButton";
import Image from "next/image";

export default async function UserHome({
  profiles,
}: {
  profiles: Profile[];
}) {
  const posts = await prisma.post.findMany({
    where: {
      author: { in: profiles.map((p) => p.email) },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const likes = await prisma.like.findMany({
    where: {
      author: await getSessionEmailOrThrow(),
      postId: { in: posts.map((p) => p.id) },
    },
  });
  const bookmark = await prisma.bookmark.findMany({
    where: {
      author: await getSessionEmailOrThrow(),
      postId: { in: posts.map((p) => p.id) },
    }
  }) 

  return (
<div className="max-w-md mx-auto flex flex-col gap-12 mt-6">
  {posts.map((post) => {
    const profile = profiles.find((p) => p.email === post.author);
    return (
      <div
        key={post.id}
        className="rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-md bg-white dark:bg-black transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar
              radius="full"
              src={profile?.avatar || ""}
              size="2"
              fallback="A"
            />
            <Link
              href={`/users/${profile?.username}`}
              className="font-medium text-sm flex items-center gap-1 text-zinc-800 dark:text-white"
            >
              {profile?.username}
              <Verified className="w-4 h-4 text-blue-500" />
            </Link>
          </div>
          <div className="text-xs text-zinc-500">1w</div>
        </div>

        {/* Image */}
        <div className="relative">
        <Link href={`/posts/${post.id}`}>
          <div className="w-full h-[500px] relative">
          <Image
            src={post.image}
            alt="post"
            className="object-cover transition-all hover:brightness-90"
            layout="fill" 
            objectFit="cover"
          />
        </div>
</Link>

        </div>

        {/* Icons */}
        <div className="flex justify-between items-center px-4 pt-3">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-white">
            <LikesInfo
              post={post}
              showText={false}
              sessionLike={likes.find((like) => like.postId === post.id) || null}
            />
            <Link href={`/posts/${post.id}`} className="hover:opacity-70">
              <MessageCircle className="w-6 h-6" />
            </Link>
          </div>
          <div>
            <BookMarkButton post={post} sessionBookmark={bookmark.find((b) => b.postId === post.id) || null} />
          </div>
        </div>

        {/* Likes */}
        <p className="text-sm px-4 pt-2 font-semibold text-zinc-800 dark:text-white">
          {post.likesCount} likes
        </p>

        {/* Description */}
        <div className="px-4 pt-1 pb-2">
          <p className="text-sm leading-snug text-zinc-800 dark:text-white">
            <span className="font-semibold">{profile?.username}</span>{" "}
            {post.description}
          </p>
          <Link
            href={`/posts/${post.id}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 block"
          >
            {post._count?.comments > 0 ? (
              <span>View all {post._count?.comments ?? 0} comments</span>
            ) : (
              <span>Add a comment...</span>
            )}
          </Link>
        </div>
      </div>
    );
  })}
</div>


  );
}
