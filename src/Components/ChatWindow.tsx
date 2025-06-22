"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { pusherClient } from "../../lib/pusher/client";
import Image from "next/image";


type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string | Date;
};

export default function ChatWindow({
  receiverId,
  currentUserId,
  receiverUsername,
  receiverAvatar,
  receiverName,
}: {
  receiverId: string;
  currentUserId: string;
  receiverUsername: string;
  receiverAvatar?: string;
  receiverName?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ maxWidth: 600 });

  useEffect(() => {
    const loadMessages = async () => {
      const res = await fetch(`/api/messages?receiverId=${receiverId}`);
      const data = await res.json();
      setMessages(data);
    };

    loadMessages();
  }, [receiverId]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-${currentUserId}`);
    const handleNewMessage = (data: Message) => {
      const isRelevant =
        (data.senderId === receiverId && data.receiverId === currentUserId) ||
        (data.senderId === currentUserId && data.receiverId === receiverId);

      if (isRelevant) {
        setMessages((prev) => [...prev, data]);
      }
    };

    channel.bind("new-message", handleNewMessage);
    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unsubscribe();
    };
  }, [receiverId, currentUserId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await fetch("/api/messages/mark-read", {
          method: "POST",
          body: JSON.stringify({
            senderId: receiverId,
            receiverId: currentUserId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };
    markAsRead();
  }, [receiverId, currentUserId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const res = await fetch("/api/chat/send", {
      method: "POST",
      body: JSON.stringify({ receiverId, text }),
      headers: { "Content-Type": "application/json" },
    });
    const msg = await res.json();
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  function useTailwindDarkMode(): boolean {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
      const html = document.documentElement;
      const observer = new MutationObserver(() => {
        setIsDark(html.classList.contains("dark"));
      });
      setIsDark(html.classList.contains("dark"));
      observer.observe(html, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }, []);
    return isDark;
  }

  const isDark = useTailwindDarkMode();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-2 pt-[28px] sm:p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {isSmallScreen && (
            <button
              onClick={() => router.push("/direct/inbox")}
              className="text-zinc-500 dark:text-zinc-300 text-xl mr-2 hover:text-blue-500 transition"
            >
              <i className="fas fa-arrow-left" />
            </button>
          )}
          <Link href={`/users/${receiverUsername}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-zinc-300 dark:border-zinc-700">
              <Image
                src={receiverAvatar || "/userImage.png"}
                alt="avatar"
                fill
                className="object-cover rounded-full"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-sm">{receiverUsername}</span>
              {receiverName && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {receiverName}
                </span>
              )}
            </div>
          </Link>
        </div>
        <div className="flex gap-4 text-xl text-zinc-400 xs:hidden">
          <i className="fas fa-phone hover:text-blue-500 cursor-pointer" />
          <i className="fas fa-video hover:text-blue-500 cursor-pointer" />
          <i className="fas fa-info-circle hover:text-blue-500 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-3 overflow-y-auto scroll-smooth">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-4 py-2 text-sm rounded-2xl break-words shadow-sm ${isMine
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-300 dark:bg-zinc-800 text-black dark:text-white rounded-bl-none"
                  }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${isMine ? "text-white/70" : "text-zinc-800 dark:text-zinc-400"
                    }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 w-full bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center gap-2">
        <button className="text-zinc-400 hover:text-blue-500 text-xl">
          <i className="fas fa-microphone" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 text-sm px-3 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none"
        />
        {!isSmallScreen && (
          <div className="relative" ref={emojiPickerRef}>
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-zinc-400 hover:text-blue-500 text-xl"
            >
              <i className="far fa-smile" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
                <EmojiPicker
                  theme={(isDark ? "dark" : "light") as Theme}
                  onEmojiClick={(emojiData: EmojiClickData) =>
                    setText((prev) => prev + emojiData.emoji)
                  }
                />
              </div>
            )}
          </div>
        )}
        <button
          onClick={sendMessage}
          className="text-blue-500 hover:text-blue-400 text-sm font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
