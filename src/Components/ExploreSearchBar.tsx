"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Profile } from "@prisma/client";
import SearchFormMobile from "./SearchFormMobile";
import SearchResultsMobile from "./SearchResultsMobile";

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

export default function ExploreSearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProfiles([]);
        setPosts([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setProfiles(data.profiles || []);
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleCancel = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("query");
    router.push(url.pathname);
  };

  const handleQueryChange = (newQuery: string) => {
    const url = new URL(window.location.href);
    if (newQuery) {
      url.searchParams.set("query", newQuery);
    } else {
      url.searchParams.delete("query");
    }
    router.push(url.pathname + url.search);
  };

  return (
    <div
      className={`md:hidden z-40 transition-all ${query ? "fixed inset-0 bg-black/30 z-30 backdrop-blur-sm dark:bg-black px-4 py-4" : "sticky top-0 bg-white dark:bg-black px-4 py-3 border-b border-zinc-300 dark:border-zinc-800"
        }`}
    >
      <SearchFormMobile
        query={query}
        onQueryChange={handleQueryChange}
        onCancel={handleCancel}
      />
      {query && (
        <SearchResultsMobile
          loading={loading}
          query={query}
          profiles={profiles}
          posts={posts}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
