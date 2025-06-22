'use client';

import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Modal from '@/Components/Modal';
import ModalPostContent from '@/Components/ModalPostContent';
import Preloader from '@/Components/Preloader';
import { useEffect, useState } from 'react';

export default function PostInModal() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const from = searchParams.get("from");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !id) return <Preloader />;

  return (
    <Modal
      onClose={() => {
        router.push(from || '/'); 
      }}
    >
      <ModalPostContent postId={id as string} />
    </Modal>
  );
}
