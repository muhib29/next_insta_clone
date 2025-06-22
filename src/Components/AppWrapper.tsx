// src/Components/AppWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function AppWrapper({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const pathname = usePathname();

  const isModalRoute = pathname?.startsWith('/posts/');

  return (
    <>
      {children}
      {isModalRoute && modal}
    </>
  );
}
