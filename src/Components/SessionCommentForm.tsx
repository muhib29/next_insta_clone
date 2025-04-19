'use client';

import { useEffect, useState } from 'react';
import CommentForm from '@/Components/CommentForm';

export default function SessionCommentForm({ postId }: { postId: string }) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/post');
        const data = await res.json();
        setAvatar(data.avatar);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading || avatar === null) return <p>Loading...</p>;

  return <CommentForm postId={postId} avatar={avatar} />;
}
