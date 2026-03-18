import { auth } from "@/lib/auth";
import { getConversations } from "@/lib/actions/conversations";
import { ChatList } from "@/components/chat/chat-list";

export default async function ChatPage() {
  const session = await auth();
  const conversations = await getConversations();

  return (
    <ChatList
      conversations={conversations}
      currentUserId={session!.user.id}
    />
  );
}
