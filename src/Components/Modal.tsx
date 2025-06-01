'use client';

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.back()}
      className="bg-black/80 dark:bg-black/70 fixed inset-0 z-20 ">
      <div className="justify-center left-8 right-8 top-9 bottom-9 absolute flex items-center ">
        <div
          className="bg-white py-4 dark:bg-[#363636] rounded-lg overflow-y-auto w-full max-w-5xl h-full max-h-[calc(100vh-4.5rem)] mx-auto px-4">
          <div
            className="z-30 rounded-lg  ">
            <div
              onClick={ev => ev.stopPropagation()}
              className="px-4 ">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}