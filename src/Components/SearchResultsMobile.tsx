"use client";

import { Profile, Post } from "@prisma/client";
import SearchResults from "./SearchResults";

type ExtendedPost = Post & {
  _count: {
    likes: number;
    comments: number;
  };
};

export default function SearchResultsMobile({
  loading,
  query,
  profiles,
  posts,
  onCancel,
}: {
  loading: boolean;
  query: string;
  profiles: Profile[];
  posts: ExtendedPost[];
  onCancel: () => void;
}) {
  return (
    <SearchResults
      loading={loading}
      query={query}
      profiles={profiles}
      posts={posts}
      onCancel={onCancel}
    />
  );
}
