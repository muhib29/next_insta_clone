"use client";

import { usePathname } from "next/navigation";
import ChatList from "@/Components/ChatList";
import { useEffect, useRef, useState } from "react";


type ChatUser = {
  id: string;
  username: string;
  avatar: string | null;
  lastMessageAt: Date | null;
  lastMessageText: string | null;
  hasUnread: boolean;
};

type CurrentUser = {
  id: string;
  username: string;
  avatar: string | null;
  name: string | null;
};


type Props = {
  children: React.ReactNode;
  currentUser: CurrentUser;
  users: ChatUser[];
};


export default function DirectLayoutClient({ children, currentUser, users }: Props) {
  const [showFullSidebar, setShowFullSidebar] = useState(false);
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  const isInbox = pathname === "/direct/inbox";
  const isChat = pathname.startsWith("/direct/") && pathname !== "/direct/inbox";

  const isMobile = windowWidth !== null && windowWidth <= 550;
  const isTablet = windowWidth !== null && windowWidth > 550 && windowWidth <= 767;
  const isDesktop = windowWidth !== null && windowWidth > 767;

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden pt-2 bg-white dark:bg-black text-black dark:text-white">
      {/* Mobile: show only one view */}
      {isMobile && (
        <div className="w-full min-h-screen pb-[40px]">
          {isInbox && (
            <div className="w-full h-full overflow-hidden">
              <ChatList currentUser={currentUser}  />
            </div>
          )}
          {isChat && (
            <main className="w-full h-full overflow-hidden">{children}</main>
          )}
        </div>
      )}

      {/* Tablet: compact sidebar + children + optional drawer */}
      {isTablet && (
        <>
          <aside
            className={`relative transition-all duration-300 h-full border-r border-zinc-300 dark:border-zinc-800 ${showFullSidebar ? "w-[350px]" : "w-16"
              }`}
          >
            <ChatList
              currentUser={currentUser}
              compactView={!showFullSidebar}
            />

            {/* Single Middle Toggle Icon */}
            <button
              className="absolute top-1/2 right-[-12px] transform -translate-y-1/2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full p-1 shadow hover:scale-105 transition"
              onClick={() => setShowFullSidebar((prev) => !prev)}
            >
              <i
                className={`fas ${showFullSidebar ? "fa-angle-left" : "fa-angle-right"
                  } text-sm text-zinc-600 dark:text-white`}
              />
            </button>
          </aside>

          <main className="flex-1 h-full overflow-hidden pb-[45px]">
            {children}
          </main>
        </>
      )}


      {/* Desktop: full sidebar + children */}
      {isDesktop && (
        <>
          <aside className="w-[350px] h-full border-r border-zinc-300 dark:border-zinc-800">
            <ChatList currentUser={currentUser}  />
          </aside>
          <main className="flex-1 h-full overflow-hidden">{children}</main>
        </>
      )}
    </div>
  );
}
