"use client";

import { useState } from "react";
import DesktopNav from "@/Components/DesktopNav";
import MobileNav from "@/Components/MobileNav";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SearchPageClient = dynamic(() => import("@/Components/SearchPageClient"), {
  ssr: false,
});

export default function AppShell({
  children,
  sessionUserId,
}: {
  children: React.ReactNode;
  sessionUserId: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isDirectInboxPage = pathname.includes("/direct");
  const shouldCollapseSidebar = searchOpen || isDirectInboxPage;

  return (
    <div className="relative flex h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      {/* Sidebar */}
      <DesktopNav
        onSearchToggle={setSearchOpen}
        sessionUserId={sessionUserId}
        forceCollapsed={shouldCollapseSidebar}
      />

      {/* Search Panel */}
      {searchOpen && (
        <div className="fixed top-0 left-[80px] z-5 h-screen w-[400px] border-r border-gray-200 bg-white overflow-y-auto dark:border-gray-800 dark:bg-black">
          <SearchPageClient onCancel={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 w-full overflow-scroll ${isDirectInboxPage ? "md:[--sidebar-width:6rem]" : "md:[--sidebar-width:14rem]"
          }`}
        style={{
          marginLeft: "var(--sidebar-width, 0)",
        }}
      >
        {/* <div className={`pb-24 lg:pb-4 ${isDirectInboxPage ? 'pt-2' : ' pt-4 '}  px-4 lg:px-8 flex justify-around w-full`}> */}
          <div className={`${isDirectInboxPage ? "flex-1 flex w-full h-screen  overflow-hidden" : "w-full"}`}>
            {children}
          </div>
        {/* </div> */}

        <MobileNav />
      </div>
    </div>
  );
}
