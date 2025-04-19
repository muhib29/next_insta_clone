"use client";

import {
  CameraIcon,
  HomeIcon,
  LayoutGridIcon,
  Settings2Icon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", icon: HomeIcon },
  { href: "/explore", icon: LayoutGridIcon },
  { href: "/create", icon: CameraIcon },
  { href: "/profile", icon: UserIcon },
  { href: "/settings", icon: Settings2Icon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700 py-2 px-6 flex justify-between items-center shadow-[0_0_6px_rgba(0,0,0,0.1)] dark:shadow-[0_0_6px_rgba(255,255,255,0.1)]">
      {navLinks.map(({ href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex flex-col items-center justify-center text-xs transition-all duration-300 ${
              isActive
                ? "text-purple-700 dark:text-purple-300 scale-110"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-500"
            }`}
          >
            <Icon
              size={24}
              className={`transition-transform duration-300 group-hover:scale-110 ${
                isActive ? "animate-pulse" : ""
              }`}
            />
            <span
              className={`mt-1 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {href.replace("/", "") || "Home"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
