"use client";

import { Cross } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();

  return (
    <form
      action={async (data) => {
        router.push("/?query=" + data.get("query"));
        router.refresh();
      }}
      className="w-full pt-4 px-4 pb-6  border-gray-300 dark:border-gray-800 shadow-md bg-white dark:bg-black"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">Search</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm rotate-45 text-gray-500 hover:text-red-500 transition"
        >
          <Cross />
        </button>
      </div>
      <input
        type="text"
        name="query"
        placeholder="Search..."
        className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2b2b2b] text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none mb-4"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Recent searches or suggestions go here.
      </p>
    </form>
  );
}
