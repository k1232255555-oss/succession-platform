import type { Message, MessageReadReceipt, ScoutRequest, SuccessorCandidate } from "@prisma/client";

export const messageBodyMaxLength = 4000;

export function parseMessageBody(value: FormDataEntryValue | null) {
  const body = String(value ?? "").trim();

  if (!body || body.length > messageBodyMaxLength) {
    return null;
  }

  return body;
}

export function getThreadSubject(input: {
  scout: Pick<ScoutRequest, "id">;
  candidate: Pick<SuccessorCandidate, "name" | "region">;
}) {
  return `${input.candidate.name}さんとのスカウト相談`;
}

export function getUnreadCount(
  messages: Array<
    Pick<Message, "senderUserId"> & {
      readReceipts: Array<Pick<MessageReadReceipt, "userId">>;
    }
  >,
  userId: string,
) {
  return messages.filter((message) => {
    if (message.senderUserId === userId) {
      return false;
    }

    return !message.readReceipts.some((receipt) => receipt.userId === userId);
  }).length;
}

export function getMessagePreview(body: string) {
  return body.length > 96 ? `${body.slice(0, 96)}...` : body;
}
