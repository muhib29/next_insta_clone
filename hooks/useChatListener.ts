// hooks/useChatListner.ts
import { useEffect } from "react";
import { pusherClient } from "../lib/pusher/client";

export function useChatListener(userId: string, onMessage: (msg: any) => void) {
  useEffect(() => {
    if (!userId) return;

    const channel = pusherClient.subscribe(`chat-${userId}`);
    channel.bind("new-message", onMessage);

    return () => {
      pusherClient.unsubscribe(`chat-${userId}`);
    };
  }, [userId, onMessage]);
}
