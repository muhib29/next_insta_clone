// app/(routes)/direct/[id]/page.tsx
import { auth } from "@/auth";
import ChatWindow from "@/Components/ChatWindow";
import { prisma } from "@/db";
// ({ params }: { params: Promise<{ id: string }> }) {
export default async function DirectChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
   const { id } = await params;
  if (!session?.user?.email) return null;

  const currentUser = await prisma.profile.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const receiver = await prisma.profile.findUnique({
    where: { id},
    select: {
      id: true,
      username: true,
      avatar: true,
      name: true,
    },
  });

  if (!currentUser?.id || !receiver) return null;

  return (
    <ChatWindow
      currentUserId={currentUser.id}
      receiverId={receiver.id}
      receiverUsername={receiver.username}
      receiverAvatar={receiver.avatar ?? undefined}
      receiverName={receiver.name ?? undefined}
    />
  );
}
