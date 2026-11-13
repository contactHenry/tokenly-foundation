type ErrorRecord = Record<string, unknown>;

const fallbackFor = (status: number) => {
  if (status === 401) return "The AI assistant is not configured correctly. Please contact the workspace owner.";
  if (status === 402) return "AI usage is paused because workspace AI credits need attention.";
  if (status === 403) return "The AI service denied this request. Please contact the workspace owner.";
  if (status === 404) return "The AI assistant is temporarily unavailable.";
  if (status === 429) return "The assistant is receiving too many requests. Please wait a moment and try again.";
  if (status >= 500) return "The AI service is temporarily unavailable. Please try again shortly.";
  return "The assistant couldn't process that request. Please try again.";
};

function errorRecord(error: unknown): ErrorRecord {
  return typeof error === "object" && error !== null ? (error as ErrorRecord) : {};
}

function gatewayMessage(record: ErrorRecord) {
  const body = record["responseBody"];
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as ErrorRecord;
      const nested = typeof parsed["error"] === "object" && parsed["error"] !== null
        ? (parsed["error"] as ErrorRecord)
        : {};
      const message = nested["message"] ?? parsed["message"];
      if (typeof message === "string" && message.trim()) return message.trim().slice(0, 600);
    } catch {
      // Use the status-specific safe message below.
    }
  }
  return undefined;
}

export function assistantErrorDetails(error: unknown) {
  const record = errorRecord(error);
  const rawStatus = record["statusCode"] ?? record["status"];
  const status = typeof rawStatus === "number" && rawStatus >= 400 && rawStatus <= 599
    ? rawStatus
    : 500;
  const directMessage = error instanceof Error ? error.message : undefined;
  const message = gatewayMessage(record) ?? (status !== 500 ? directMessage : undefined);
  return { status, message: message?.slice(0, 600) || fallbackFor(status) };
}

export function safeAssistantStreamError(error: unknown) {
  return assistantErrorDetails(error).message;
}
