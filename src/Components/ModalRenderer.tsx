// src/components/ModalRenderer.tsx
'use client';
import { usePathname } from 'next/navigation';

export default function ModalRenderer({ modal }: { modal: React.ReactNode }) {
  const pathname = usePathname();

  const showModal =
    pathname.startsWith('/posts/') ||
    pathname.includes('/follower') ||
    pathname.includes('/following');

  return showModal ? <>{modal}</> : null;
}
