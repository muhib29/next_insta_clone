import { prisma } from "@/db";
import { getSessionEmailOrThrow } from "@/action";
import NotificationClient from "./NotificationClient";

export default async function NotificationsPage() {
  const email = await getSessionEmailOrThrow();

  const profile = await prisma.profile.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!profile) return <div>User not found</div>;

  const notifications = await prisma.notification.findMany({
    where: { receiverId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });


  const senderIds = notifications.map((n) => n.sender.id);


  const following = await prisma.follower.findMany({
    where: {
      followingProfileEmail: email,
      followedProfileId: { in: senderIds },
    },
  });

  const followMap = new Map(
    following.map((f) => [f.followedProfileId, f])
  );

  const mapped = notifications.map((n) => ({
    id: n.id,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    postId: n.postId || undefined,
    type: n.type,
    senderId: n.sender.id,
    senderUsername: n.sender.username,
    senderAvatar: n.sender.avatar || undefined,
    ourFollow: followMap.get(n.sender.id) || null,
  }));

  return <NotificationClient initial={mapped} userId={profile.id} />;
}
