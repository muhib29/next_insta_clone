"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchForm from "@/Components/SearchForm";
import SearchResults from "./SearchResults";
import { Profile } from "@prisma/client";

type ExtendedPost = {
  id: string;
  author: string;
  image: string;
  description: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    likes: number;
    comments: number;
  };
};

export default function SearchPageClient({ onCancel }: { onCancel: () => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<ExtendedPost[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!query) return;
      const res = await fetch(`/api/search?query=${query}`);
      const data = await res.json();
      setProfiles(data.profiles);
      setPosts(data.posts);
    };

    fetchProfiles();
  }, [query]);

  return (
    <div className="min-h-full w-full flex flex-col mt-2">
      <SearchForm onCancel={onCancel} />
      {query && (
        <SearchResults
          query={query}
          profiles={profiles}
          posts={posts}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
