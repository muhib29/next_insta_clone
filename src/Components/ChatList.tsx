"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pusherClient } from "../../lib/pusher/client";
import Image from "next/image";

type ChatUser = {
  id: string;
  username: string;
  avatar: string | null;
  lastMessageText: string | null;
  lastMessageAt: Date | string | null;
  hasUnread: boolean;
};

type CurrentUser = {
  id: string;
  username: string;
  avatar: string | null;
  name: string | null;
};

type Props = {
  users: ChatUser[];
  currentUser: CurrentUser;
  compactView?: boolean;
  onClose?: () => void;
};

type NewMessageEvent = {
  text: string;
  createdAt: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string | null;
  receiverId: string;
  receiverUsername: string;
  receiverAvatar: string | null;
};

type MessagesReadEvent = {
  senderId: string;
};

export default function ChatList({
  users,
  currentUser,
  compactView = false,
  onClose,
}: Props) {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>(users);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-${currentUser.id}`);

    channel.bind("new-message", (data: NewMessageEvent) => {
      const partnerId = data.senderId === currentUser.id ? data.receiverId : data.senderId;
      const partnerUsername = data.senderId === currentUser.id ? data.receiverUsername : data.senderUsername;
      const partnerAvatar = data.senderId === currentUser.id ? data.receiverAvatar : data.senderAvatar;

      setChatUsers((prevUsers) => {
        const existingUser = prevUsers.find((u) => u.id === partnerId);
        let updated = [...prevUsers];

        if (existingUser) {
          updated = updated.map((user) =>
            user.id === partnerId
              ? {
                  ...user,
                  lastMessageText: data.text,
                  lastMessageAt: new Date(data.createdAt),
                  hasUnread: data.senderId !== currentUser.id,
                }
              : user
          );
        } else {
          updated.push({
            id: partnerId,
            username: partnerUsername ?? "Unknown",
            avatar: partnerAvatar ?? null,
            lastMessageText: data.text,
            lastMessageAt: new Date(data.createdAt),
            hasUnread: data.senderId !== currentUser.id,
          });
        }

        return updated.sort(
          (a, b) =>
            new Date(b.lastMessageAt ?? 0).getTime() -
            new Date(a.lastMessageAt ?? 0).getTime()
        );
      });
    });

    channel.bind("messages-read", (data: MessagesReadEvent) => {
      const { senderId } = data;
      setChatUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === senderId ? { ...user, hasUnread: false } : user
        )
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [currentUser.id]); // ✅ Fix missing dependency

  function formatTimeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  const filteredUsers = chatUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastMessageText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`
        flex-col h-full bg-white dark:bg-black text-black dark:text-white border-r border-zinc-300 dark:border-zinc-800 overflow-hidden
        flex ${compactView ? "w-16" : "w-full lg:w-[350px]"}
      `}
    >
      {onClose && (
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500 text-xl">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {!compactView && (
        <Link
          href="/profile"
          className="p-4 md:pt-[15px] pt-[28px] items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg mb-3 transition flex"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 relative">
            <Image
              src={currentUser.avatar || "/userImage.png"}
              alt="your-avatar"
              fill
              sizes="48px"
              className="object-cover rounded-full"
              priority
            />
          </div>

          <div className="space-y-0.5">
            <p className="font-semibold">{currentUser.username}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {currentUser.name || "No name"}
            </p>
          </div>
        </Link>
      )}

      {!compactView && (
        <div className="px-2 pb-3">
          <div className="relative flex items-center w-full">
            <span className="absolute left-3 text-zinc-400">
              <i className="fas fa-search" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users or messages..."
              className="w-full pl-10 pr-8 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                className="absolute right-3 text-zinc-400 hover:text-red-500"
                onClick={() => setSearchTerm("")}
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>
      )}

      {!compactView && (
        <div className="px-4 pb-2 flex justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          <span>Messages</span>
          <span className="text-blue-500 cursor-pointer hover:underline transition">
            Requests
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 mt-[8px] md:mt-0">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Link
              key={user.id}
              onClick={() => router.push(`/direct/${user.id}`)}
              href={`/direct/${user.id}`}
              className={`flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition group ${
                compactView ? "justify-center" : ""
              }`}
            >
              <div className="w-10 h-10 relative rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <Image
                  src={user.avatar || "/userImage.png"}
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              </div>
              {!compactView && (
                <div className="flex-col text-sm flex-1 flex">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {user.username}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.lastMessageText
                      ? user.lastMessageText.slice(0, 25) + "..."
                      : "No messages yet."}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {user.lastMessageAt
                      ? formatTimeAgo(new Date(user.lastMessageAt))
                      : ""}
                  </span>
                </div>
              )}
              {!compactView && user.hasUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </Link>
          ))
        ) : (
          <p className="text-center text-sm text-zinc-500 mt-4">No results found.</p>
        )}
      </div>
    </div>
  );
}
