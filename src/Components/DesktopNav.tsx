"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CameraIcon,
  CompassIcon,
  HomeIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navLinks = [
  { label: "Home", icon: HomeIcon, href: "/" },
  { label: "Search", icon: SearchIcon, isSpecial: "search" },
  { label: "Explore", icon: CompassIcon, href: "/explore" },
  { label: "Profile", icon: UserIcon, href: "/profile" },
  { label: "Create", icon: CameraIcon, href: "/create" },
];

export default function DesktopNav({
  onSearchToggle,
}: {
  onSearchToggle: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const isSearchOpen = clickedIndex === 1;
  const sidebarWidth = isSearchOpen ? "5rem" : "14rem";

  return (
    <div
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      className={`hidden md:flex fixed flex-col h-screen px-4 py-6 shadow-md transition-all duration-300 
      ${isSearchOpen ? "w-20" : "w-56"} 
      border-r border-gray-300 bg-white text-black 
      dark:border-gray-700 dark:bg-black dark:text-white`}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`mb-8 flex items-center transition-all duration-300 ${
          isSearchOpen ? "justify-center" : "justify-start px-2"
        }`}
      >
       {isSearchOpen ? (
            <Image
              className="dark:invert w-8 transition-all duration-300"
              src="https://img.icons8.com/?size=512&id=44907&format=png"
              alt="Logo"
              width={32}  // Define width to avoid layout shifts
              height={32} // Define height to avoid layout shifts
            />
          ) : (
            <Image
              className="w-32 dark:invert transition-all duration-300"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/800px-Instagram_logo.svg.png"
              alt="Logo"
              width={128}  // Define width to avoid layout shifts
              height={128} // Define height to avoid layout shifts
            />
          )}
      </Link>

      {/* Nav Items */}
      <div className="flex flex-col gap-4">
        {navLinks.map(({ label, icon: Icon, href, isSpecial }, index) => {
          const isActive = pathname === href;
          const showText = !isSearchOpen;

          const commonClass = `
            group flex items-center gap-4 py-2 px-3 rounded-md transition-all duration-300 
            ${isActive 
              ? "bg-purple-700 text-white dark:bg-purple-600" 
              : "text-black hover:bg-gray-200 dark:text-white dark:hover:bg-[#363636]"}
          `;

          const iconClass = `transition-transform duration-300 ${
            clickedIndex === index ? "scale-110" : ""
          }`;

          if (isSpecial) {
            return (
              <button
                key={label}
                onClick={() => {
                  setClickedIndex(index);
                  onSearchToggle(isSpecial === "search");
                }}
                className={commonClass}
              >
                <Icon className={iconClass} size={25} />
                {showText && <span className="text-md font-light">{label}</span>}
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href!}
              onClick={() => {
                setClickedIndex(index);
                onSearchToggle(false);
              }}
              className={commonClass}
            >
              <Icon className={iconClass} size={25} />
              {showText && <span className="text-md font-light">{label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
