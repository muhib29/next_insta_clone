'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  SearchIcon,
  CompassIcon,
  HeartIcon,
  UserIcon,
  CameraIcon,
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const navLinks = [
  { label: 'Home', icon: HomeIcon, href: '/' },
  { label: 'Search', icon: SearchIcon, isSpecial: 'search' },
  { label: 'Explore', icon: CompassIcon, href: '/explore' },
  { label: 'Notifications', icon: HeartIcon, href: '/notifications' },
  { label: 'Profile', icon: UserIcon, href: '/profile' },
  { label: 'Create', icon: CameraIcon, href: '/create' },
];

export default function DesktopNav({
  onSearchToggle,
  sessionUserId,
}: {
  onSearchToggle: (open: boolean) => void;
  sessionUserId: string;
}) {
  const pathname = usePathname();
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const isSearchOpen = clickedIndex === 1;
  const sidebarWidth = isSearchOpen ? '5rem' : '14rem';
  const router = useRouter();
  return (
    <div
      style={{ '--sidebar-width': sidebarWidth } as React.CSSProperties}
      className={`hidden md:flex fixed flex-col h-screen px-4 py-6 shadow-md transition-all duration-300 
      ${isSearchOpen ? 'w-20' : 'w-56'} 
      border-r border-gray-300 bg-white text-black 
      dark:border-gray-700 dark:bg-black dark:text-white`}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`mb-8 flex items-center transition-all duration-300 ${isSearchOpen ? 'justify-center' : 'justify-start px-2'
          }`}
      >
        {isSearchOpen ? (
          <Image
            className="dark:invert w-8"
            src="https://img.icons8.com/?size=512&id=44907&format=png"
            alt="Logo"
            width={32}
            height={32}
          />
        ) : (
          <Image
            className="w-32 dark:invert"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/800px-Instagram_logo.svg.png"
            alt="Logo"
            width={128}
            height={128}
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
              ? 'bg-purple-700 text-white dark:bg-purple-600'
              : 'text-black hover:bg-gray-200 dark:text-white dark:hover:bg-[#363636]'}
          `;

          const iconClass = `transition-transform duration-300 ${clickedIndex === index ? 'scale-110' : ''
            }`;

          if (isSpecial === 'search') {
            return (
              <button
                key={label}
                onClick={() => {
                  setClickedIndex(index);
                  onSearchToggle(true);
                }}
                className={commonClass}
              >
                <Icon className={iconClass} size={25} />
                {showText && <span className="text-md font-light">{label}</span>}
              </button>
            );
          }

          if (label === "Notifications") {
            return (
              <button
                key={label}
                onClick={() => {
                  setClickedIndex(index);
                  onSearchToggle(false);
                  router.push("/notifications");
                }}
                className={commonClass}
              >
                <NotificationBell userId={sessionUserId} showText={showText} />
              </button>

            );
          }


          return (
            <Link
              key={label}
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
