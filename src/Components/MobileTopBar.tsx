// components/MobileTopBar.tsx
"use client";

import NotificationBell from "@/Components/NotificationBell";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MessageBell from "./MessageBell";

export default function MobileTopBar({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 mb-4  bg-white dark:bg-black">
      {/* Instagram Logo */}
      <Image
        src="/Instagram_logo.svg.png"
        alt="Instagram Logo"
        width={78}
        height={78}
        className="dark:invert"
        priority
        onClick={() => router.push("/")}
      />

      {/* Notification Bell */}
      <div className="flex items-center justify-center">
        <button onClick={() => router.push("/notifications")}>
          <NotificationBell userId={userId} />
        </button>
        <button onClick={() => router.push("/direct/inbox")}>
          <MessageBell userId={userId} showText={false} />
        </button>
      </div>
    </div>
  );
}
