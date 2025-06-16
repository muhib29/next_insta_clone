// components/MobileTopBar.tsx
"use client";

import NotificationBell from "@/Components/NotificationBell";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MobileTopBar({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 mb-4  bg-white dark:bg-black">
      {/* Instagram Logo */}
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/800px-Instagram_logo.svg.png"
        alt="Instagram Logo"
        width={78}
        height={78}
        className="dark:invert"
        onClick={() => router.push("/")}
      />

      {/* Notification Bell */}
      <button onClick={() => router.push("/notifications")}>
        <NotificationBell userId={userId} />
      </button>
    </div>
  );
}
