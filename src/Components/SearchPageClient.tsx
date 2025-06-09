"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SearchForm from "@/Components/SearchForm";
import SearchResults from "./SearchResults";
import { Profile, Post } from "@prisma/client";


type ExtendedPost = Post & {
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function SearchPageClient({ onCancel }: { onCancel: () => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const { data: session } = useSession();
  const currentUserId = session?.user?.email || ""; // or session?.user?.id depending on your auth setup

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfiles = async () => {
      if (!query) {
        setProfiles([]);
        setPosts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data: {
          profiles: Profile[];
          posts: ExtendedPost[];
        } = await res.json();

        setProfiles(data.profiles || []);
        setPosts(data.posts || []);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();

    return () => controller.abort();
  }, [query]);

  return (
    <div className="min-h-screen w-full flex flex-col mt-4 px-4">
      <SearchForm onCancel={onCancel} />

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-4">
          Loading search results...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-4 ">{error}</p>
      )}

      {query && !loading && !error && (
        <SearchResults
          loading={loading}
          query={query}
          profiles={profiles}
          posts={posts}
          onCancel={onCancel}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
