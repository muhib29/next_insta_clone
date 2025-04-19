'use client';
import { Post } from '@prisma/client';
import { HeartIcon, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';

export default function PostGrid({ posts }: { posts: Post[] }) {
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
              layout="responsive"
              width={600} 
              height={400} 
            />
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
              <div className="text-white text-center space-y-1 z-50 flex gap-5">
              <p className="text-md font-semibold flex gap-2">
              <HeartIcon /> <span>{post._count?.likes ?? 0}</span> 
            </p>
            <p className="text-md font-semibold flex gap-2">
            <MessageCircle />  <span>{post._count?.comments ?? 0}</span>
            </p>
              </div>
            </div>
          </Link>
        ))}
      </Masonry>
    </div>
  );
}
