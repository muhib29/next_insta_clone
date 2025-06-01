"use client";

import { useState, useEffect, FormEvent } from "react";

export default function SearchFormMobile({
  query,
  onQueryChange,
  onCancel,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState(query);

  useEffect(() => {
    setInput(query);
  }, [query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onQueryChange(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search posts or people..."
        className="flex-grow px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {input && (
        <button
          type="button"
          onClick={() => {
            setInput("");
            onCancel();
          }}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 text-sm rounded-xl transition"
      >
        Search
      </button>
    </form>
  );
}
