'use client';

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function FollowingModal({
    children
}: {
    children: ReactNode
}) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.back()}
            className="bg-black/60 fixed inset-0 z-40 flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-[#262626]  text-black dark:text-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {children}
            </div>
        </div>
    );
}
