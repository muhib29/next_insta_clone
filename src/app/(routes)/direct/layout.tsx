
import { getSessionEmailOrThrow } from "@/action";
import { prisma } from "@/db";
import DirectLayoutClient from "./layoutClient";

export default async function DirectLayout({ children }: { children: React.ReactNode }) {
  const email = await getSessionEmailOrThrow();

  const currentUser = await prisma.profile.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
    },
  });

  if (!currentUser) return <div>User not found</div>;

  const followers = await prisma.follower.findMany({
    where: { followedProfileId: currentUser.id },
    select: { followingProfileId: true },
  });

  const followings = await prisma.follower.findMany({
    where: { followingProfileId: currentUser.id },
    select: { followedProfileId: true },
  });

  const userIds = Array.from(
    new Set([
      ...followers.map((f) => f.followingProfileId),
      ...followings.map((f) => f.followedProfileId),
    ])
  );

  const usersWithLatestMessage = await Promise.all(
    userIds.map(async (userId) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: userId },
            { senderId: userId, receiverId: currentUser.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          text: true,
        },
      });

      const user = await prisma.profile.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      if (!user) return null;

      const unread = await prisma.message.findFirst({
        where: {
          senderId: userId,
          receiverId: currentUser.id,
          isRead: false,
        },
      });

      return {
        ...user,
        lastMessageAt: lastMessage?.createdAt ?? new Date(0),
        lastMessageText: lastMessage?.text ?? "",
        hasUnread: !!unread,
      };
    })
  );

  const chatUsers = usersWithLatestMessage
    .filter((u): u is NonNullable<typeof u> => u !== null)
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  return (
    <DirectLayoutClient currentUser={currentUser} users={chatUsers}>
      {children}
    </DirectLayoutClient>
  );
}
