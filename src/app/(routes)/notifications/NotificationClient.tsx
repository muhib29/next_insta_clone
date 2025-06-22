"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import FollowButton from "@/Components/FollowButton";
import { Follower } from "@prisma/client";
import { pusherClient } from "../../../../lib/pusher/client";

import { usePathname } from 'next/navigation';

type Notification = {
    id: string;
    message: string;
    createdAt: string;
    postId?: string;
    type: string;
    senderId: string;
    senderUsername: string;
    senderAvatar?: string;
    ourFollow: Follower | null; // ✅ added
};

export default function NotificationClient({
    initial,
    userId,
}: {
    initial: Notification[];
    userId: string;
}) {

    const [notifications, setNotifications] = useState<Notification[]>(initial);
    const pathname = usePathname();




    //     useEffect(() => {
    //     const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    //         cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    //     });

    //     const channel = pusher.subscribe(`user-${userId}`);

    //     channel.bind("new-notification", (data: Notification) => {
    //         setNotifications((prev) => [data, ...prev]);
    //     });

    //     return () => {
    //         channel.unbind_all();
    //         channel.unsubscribe();
    //         pusher.disconnect();
    //     };
    // }, [userId]);

    useEffect(() => {
        const channel = pusherClient.subscribe(`user-${userId}`);

        channel.bind("new-notification", (data: Notification) => {
            setNotifications((prev) => [data, ...prev]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [userId]);

    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
        console.warn("Pusher env variables missing");
        return;
    }
    return (
        <div className="max-w-md mx-auto py-6 px-4 space-y-4 md:mt-0 mt-5">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>

            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 border p-3 rounded-md">
                        <Link href={`/users/${n.senderUsername}`}>
                            <Image
                                src={n.senderAvatar ?? "/userIcon.png"}
                                alt="Avatar"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </Link>
                        <div className="flex-1">
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(n.createdAt))} ago
                            </p>
                        </div>
                        {n.type === "follow" ? (
                            <FollowButton
                                ourFollow={n.ourFollow}
                                profileIdToFollow={n.senderId}
                            />
                        ) : n.postId ? (
                            <Link
                                // href={`/posts/${n.postId}`}
                                href={{
                                    pathname: `/posts/${n.postId}`,
                                    query: {from: pathname}
                                }}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                View
                            </Link>
                        ) : null}


                    </div>
                ))
            )}
        </div>
    );
}
