"use client";

import { useState } from "react";
import DesktopNav from "@/Components/DesktopNav";
import MobileNav from "@/Components/MobileNav";
import dynamic from "next/dynamic";

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

  return (
    <div className="relative flex min-h-screen bg-white text-black dark:bg-black dark:text-white">
      {/* Fixed Sidebar */}
      <DesktopNav
        onSearchToggle={setSearchOpen}
        sessionUserId={sessionUserId}
      />

      {/* Search Sidebar */}
      {searchOpen && (
        <div className="fixed top-0 left-[80px] z-5 h-screen w-[400px] border-r border-gray-200 bg-white overflow-y-auto dark:border-gray-800 dark:bg-black">
          <SearchPageClient onCancel={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div
        className="flex flex-col w-full md:[--sidebar-width:14rem]"
        style={{ marginLeft: "var(--sidebar-width, 0)" }}
      >
        <div className="pb-24 lg:pb-4 pt-4 px-4 lg:px-8 flex justify-around w-full">
          <div className="w-full">{children}</div>
        </div>

        {/* Mobile Nav */}
        <MobileNav />
      </div>
    </div>
  );
}
