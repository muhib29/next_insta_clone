// app/components/SearchPageClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchForm from "@/Components/SearchForm";
import SearchResults from "./SearchResults";

export default function SearchPageClient({ onCancel }: { onCancel: () => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);

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
    <div className="min-h-full w-full flex flex-col mt-2  ">
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

