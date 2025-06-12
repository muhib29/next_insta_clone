'use client';

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.back()}
      className="bg-black/80 dark:bg-[#121212]/70 fixed inset-0 z-20">
      <div className="justify-center left-8 right-8 top-9 bottom-9 absolute flex items-center ">
        <div
          className="bg-white dark:bg-black rounded-lg overflow-y-auto w-full max-w-5xl max-h-[calc(100vh-10.5rem)] md:max-h-[calc(100vh-4.5rem)] mx-auto ">
          <div
            className="z-30 rounded-lg  ">
            <div
              onClick={ev => ev.stopPropagation()}
              className="">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}