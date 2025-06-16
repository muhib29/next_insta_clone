"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { pusherClient } from "../../lib/pusher/client";

type NotificationData = {
  message: string;
};

export default function NotificationBell({
  userId,
  showText = false,
}: {
  userId: string;
  showText?: boolean;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch unread count on first load
  useEffect(() => {
    const fetchUnread = async () => {
      const res = await fetch(`/api/unread-count?userId=${userId}`);
      const data = await res.json();
      setUnreadCount(data.count);
    };

    fetchUnread();

    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notifications.mp3");
      audioRef.current.volume = 0.5;
    }
  }, [userId]);

  // Listen for new notifications
  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${userId}`);

    const handleNewNotification = (data: NotificationData) => {
      if (pathname !== "/notifications") {
        setUnreadCount((prev) => prev + 1);

        audioRef.current?.play().catch(() => {});

        toast.custom(
          (t) => (
            <div className="bg-white dark:bg-neutral-900 shadow-lg border dark:border-neutral-700 px-4 py-2 rounded-md animate-fade-in-down">
              <p className="text-sm font-medium mb-1">🔔 New Notification</p>
              <p className="text-xs">{data.message}</p>
              <button
                onClick={() => {
                  router.push("/notifications");
                  toast.dismiss(t.id);
                }}
                className="text-xs text-blue-500 hover:underline mt-2"
              >
                View Now
              </button>
            </div>
          ),
          { duration: 5000 }
        );
      }
    };

    channel.bind("new-notification", handleNewNotification);

    return () => {
      channel.unbind("new-notification", handleNewNotification);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [pathname, userId, router]);

  // Reset count when visiting /notifications
  useEffect(() => {
    if (pathname === "/notifications") {
      setUnreadCount(0);
      document.title = "Instagram Clone";

      // Optional: mark all notifications as read in DB
      fetch("/api/mark-read", {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });
    }
  }, [pathname, userId]);

  return (
    <div
      className="relative flex items-center gap-4 cursor-pointer"
      onClick={() => router.push("/notifications")}
    >
      <div className="relative">
        <Bell className="w-5 h-5 md:w-6 md:h-6 text-inherit" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-[-4px] right-[-4px] w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-[-4px] right-[-4px] w-2.5 h-2.5 bg-red-500 rounded-full" />
            <span className="absolute -top-3 -right-4 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          </>
        )}
      </div>
      {showText && <span className="text-md font-light">Notifications</span>}
    </div>
  );
}
