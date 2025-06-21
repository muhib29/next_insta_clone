'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pusherClient } from '../../lib/pusher/client';


type NewMessageEvent = {
  receiverId: string;
  message: string;
};

export default function MessageBell({
  userId,
  showText,
}: {
  userId: string;
  showText: boolean;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const getUnreadCount = async () => {
      try {
        const res = await fetch(`/api/messages/unread?userId=${userId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Failed to fetch unread messages", error);
      }
    };

    getUnreadCount();
    const interval = setInterval(getUnreadCount, 10000); // poll every 10 sec

    const channel = pusherClient.subscribe(`chat-${userId}`);

    const handleNewMessage = (data: NewMessageEvent) => {
      if (data.receiverId === userId) {
        getUnreadCount();
      }
    };

    const handleMessagesRead = () => {  
      getUnreadCount();
    };

    channel.bind("new-message", handleNewMessage);
    channel.bind("messages-read", handleMessagesRead);

    return () => {
      clearInterval(interval);
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("messages-read", handleMessagesRead);
      channel.unsubscribe();
    };
  }, [userId]);


  return (
    <Link
      href="/direct/inbox"
      className={`group flex items-center gap-4 py-2 px-3 rounded-md transition-all duration-300 relative
        text-black hover:bg-gray-200 dark:text-white dark:hover:bg-[#363636]`}
    >
      <MessageCircle className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300" />
      {unreadCount > 0 && (
        <span className="absolute top-1 left-6 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {showText && <span className="text-md font-light">Messages</span>}
    </Link>
  );
}
