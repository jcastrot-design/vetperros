import { auth } from "@/lib/auth";
import { getMessages } from "@/lib/actions/conversations";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await auth();

  // Verify participation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session!.user.id,
      },
    },
  });

  if (!participant) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!conversation) notFound();

  const otherUser = conversation.participants.find(
    (p) => p.userId !== session!.user.id,
  )?.user;

  const messages = await getMessages(conversationId);

  return (
    <ChatRoom
      conversationId={conversationId}
      currentUserId={session!.user.id}
      currentUserName={session!.user.name || "Usuario"}
      currentUserAvatar={session!.user.image}
      otherUser={otherUser!}
      initialMessages={messages}
    />
  );
}
