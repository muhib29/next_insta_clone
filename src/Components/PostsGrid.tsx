'use client';
import { Post } from '@prisma/client';
import { HeartIcon, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
type ExtendedPost = Post & {
  _count: {
    likes: number;
    comments: number;
  };
};
export default function PostGrid({ posts }: { posts: ExtendedPost[] }) {
  return (
    <div className="max-w-4xl mx-auto px-4 mt-6">
      <Masonry
        breakpointCols={{
          default: 3,
          1024: 3,
          768: 2,
          500: 1,
        }}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block mb-4 group relative overflow-hidden rounded-lg shadow-lg"
          >
            <Image
              className="w-full object-cover transition duration-300 ease-in-out group-hover:opacity-70"
              src={post.image}
              alt="Post Image"
              width={600} 
              height={400} 
              
            />
            {/* Overlay */}
           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
            <div className="text-white text-center z-50 flex gap-5 sm:gap-2 text-md sm:text-sm">
              <p className="font-semibold flex items-center gap-2 sm:gap-1">
                <HeartIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>{post._count?.likes ?? 0}</span>
              </p>
              <p className="font-semibold flex items-center gap-2 sm:gap-1">
                <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>{post._count?.comments ?? 0}</span>
              </p>
            </div>
          </div>

          </Link>
        ))}
      </Masonry>
    </div>
  );
}
