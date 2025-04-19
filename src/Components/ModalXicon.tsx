// components/ModalHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function ModalXicon() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-700">
      <button
        onClick={() => router.back()}
        className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
