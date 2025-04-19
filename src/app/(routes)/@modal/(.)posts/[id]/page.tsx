'use client';

import { useParams } from 'next/navigation';
import Modal from '@/Components/Modal';
import ModalPostContent from '@/Components/ModalPostContent';
import Preloader from '@/Components/Preloader';
import { useEffect, useState } from 'react';

export default function PostInModal() {
  const { id } = useParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !id) return <Preloader />;

  return (
    <Modal>
      <ModalPostContent postId={id as string} />
    </Modal>
  );
}
