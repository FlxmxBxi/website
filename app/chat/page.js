import { Suspense } from "react";
import { ChatDesk } from "@/components/chat-desk";

export const metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-muted-foreground">Opening your saved evening…</p>}>
      <ChatDesk />
    </Suspense>
  );
}
