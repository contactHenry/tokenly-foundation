import { createFileRoute } from "@tanstack/react-router";

import { handleAssistantChat } from "@/server/assistant/chat";

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: ({ request }) => handleAssistantChat(request),
    },
  },
});
