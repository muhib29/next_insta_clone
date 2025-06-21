import { useSwipeable } from 'react-swipeable';
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Verified } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar } from "@radix-ui/themes";
import LikesInfo from "@/Components/LikesInfo";
import BookMarkButton from "./BookmarkButton";
import { Profile, Post, Like, Bookmark } from "@prisma/client";

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

interface PostCardProps {
    post: ExtendedPost;
    profile?: Profile;
    sessionEmail: string;
    like: Like | null;
    bookmark: Bookmark | null;
}

export default function PostCard({
    post,
    profile,
    like,
    bookmark
}:
    PostCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setShowControls(window.innerWidth >= 1024);
        }
    }, []);

    const media = post.media;
    const mediaCount = media.length;
    const currentMedia = media[currentIndex];

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + mediaCount) % mediaCount);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaCount);
    };

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
                        src={profile?.avatar || "/userImage.png"}
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

            {/* Media */}
            <div className="relative">
                <Link href={`/posts/${post.id}`}>
                    <div
                        {...(mediaCount > 1 ? swipeHandlers : {})}
                        className="w-full h-[500px] bg-black flex items-center justify-center overflow-hidden rounded-md relative"
                    >
                        {mediaCount > 0 ? (
                            <>
                                {currentMedia.type === "video" ? (
                                    <video
                                        src={currentMedia.url}
                                        className="w-full h-full object-contain rounded-md"
                                        preload="auto"
                                        muted
                                        autoPlay
                                        playsInline
                                        controls={showControls}
                                    />
                                ) : (
   <Image
  src={currentMedia.url}
  alt={`Media ${currentIndex + 1} of ${mediaCount}`}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
  placeholder="blur"
  blurDataURL="/placeholder.jpg" // or a tiny blurred version of your image
  className="object-contain rounded-md"
/>


                                )}

                                {mediaCount > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePrev();
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 rounded-full p-1 text-white hover:bg-opacity-60"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNext();
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 rounded-full p-1 text-white hover:bg-opacity-60"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                        <div className="absolute bottom-2 w-full flex justify-center space-x-2">
                                            {media.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentIndex(i);
                                                    }}
                                                    className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/30"}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-white text-center w-full h-full flex items-center justify-center">
                                No media available
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {/* Icons */}
            <div className="flex justify-between items-center px-4 pt-3">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-white">
                    <LikesInfo post={post} showText={false} sessionLike={like} mutate={async () => { }} />
                    <Link href={`/posts/${post.id}`} className="hover:opacity-70">
                        <MessageCircle className="w-6 h-6" />
                    </Link>
                </div>
                <BookMarkButton post={post} sessionBookmark={bookmark} />
            </div>

            {/* Likes and Description */}
            <p className="text-sm px-4 pt-2 font-semibold text-zinc-800 dark:text-white">
                {post._count.likes} likes
            </p>
            <div className="px-4 pt-1 pb-2">
                <p className="text-sm leading-snug text-zinc-800 dark:text-white">
                    <span className="font-semibold">{profile?.username}</span> {post.description}
                </p>
                <Link href={`/posts/${post.id}`} className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 block">
                    {post._count.comments > 0 ? (
                        <span>View all {post._count.comments} comments</span>
                    ) : (
                        <span>Add a comment...</span>
                    )}
                </Link>
            </div>
        </div>
    );
}
