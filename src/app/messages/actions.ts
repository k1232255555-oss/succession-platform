"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AuditAction,
  MessageThreadStatus,
  NotificationType,
  UserRole,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { getRequestContext, requireUser } from "@/lib/auth";
import { getThreadSubject, parseMessageBody } from "@/lib/messages";
import { notifyCompanyUsers } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

async function getAccessibleThread(threadId: string, companyId: string) {
  return prisma.messageThread.findFirst({
    where: {
      id: threadId,
      companyId,
    },
    include: {
      scoutRequest: {
        include: {
          candidate: true,
        },
      },
    },
  });
}

async function markThreadMessagesRead(input: {
  threadId: string;
  companyId: string;
  userId: string;
}) {
  const unreadMessages = await prisma.message.findMany({
    where: {
      threadId: input.threadId,
      companyId: input.companyId,
      senderUserId: {
        not: input.userId,
      },
      readReceipts: {
        none: {
          userId: input.userId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (unreadMessages.length === 0) {
    return 0;
  }

  await prisma.messageReadReceipt.createMany({
    data: unreadMessages.map((message) => ({
      messageId: message.id,
      userId: input.userId,
    })),
    skipDuplicates: true,
  });

  return unreadMessages.length;
}

export async function createMessageThreadAction(scoutRequestId: string) {
  const user = await requireUser();

  const scout = await prisma.scoutRequest.findFirst({
    where: {
      id: scoutRequestId,
      companyId: user.companyId,
    },
    include: {
      candidate: true,
      messageThread: true,
    },
  });

  if (!scout) {
    redirect("/scouts?error=スカウト依頼が見つかりません。");
  }

  if (scout.messageThread) {
    redirect(`/messages/${scout.messageThread.id}`);
  }

  const subject = getThreadSubject({
    scout,
    candidate: scout.candidate,
  });

  const thread = await prisma.messageThread.create({
    data: {
      companyId: user.companyId,
      scoutRequestId: scout.id,
      createdById: user.id,
      subject,
      messages: {
        create: {
          companyId: user.companyId,
          senderUserId: user.id,
          senderName: user.name,
          body: `スカウト「${scout.candidate.name}」の相談スレッドを開始しました。`,
          readReceipts: {
            create: {
              userId: user.id,
            },
          },
        },
      },
    },
  });

  await writeAuditLog({
    action: AuditAction.MESSAGE_THREAD_CREATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      threadId: thread.id,
      scoutRequestId: scout.id,
      candidateId: scout.candidateId,
      subject,
    },
  });

  revalidatePath("/messages");
  revalidatePath("/scouts");
  revalidatePath(`/candidates/${scout.candidateId}`);
  redirect(`/messages/${thread.id}`);
}

export async function sendMessageAction(threadId: string, formData: FormData) {
  const user = await requireUser();
  const body = parseMessageBody(formData.get("body"));

  if (!body) {
    redirect(
      `/messages/${threadId}?error=${encodeURIComponent(
        "メッセージは1文字以上4000文字以内で入力してください。",
      )}`,
    );
  }

  const thread = await getAccessibleThread(threadId, user.companyId);

  if (!thread) {
    redirect("/messages?error=スレッドが見つかりません。");
  }

  if (thread.status === MessageThreadStatus.CLOSED) {
    redirect(`/messages/${thread.id}?error=クローズ済みのスレッドです。`);
  }

  const message = await prisma.message.create({
    data: {
      threadId: thread.id,
      companyId: user.companyId,
      senderUserId: user.id,
      senderName: user.name,
      body,
      readReceipts: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  await writeAuditLog({
    action: AuditAction.MESSAGE_SENT,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      threadId: thread.id,
      messageId: message.id,
      scoutRequestId: thread.scoutRequestId,
      candidateId: thread.scoutRequest.candidateId,
    },
  });

  await notifyCompanyUsers({
    companyId: user.companyId,
    excludeUserId: user.id,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER],
    type: NotificationType.MESSAGE_SENT,
    subject: `新着メッセージ: ${thread.subject}`,
    body: [
      `${user.name}さんがメッセージを送信しました。`,
      "",
      `件名: ${thread.subject}`,
      `候補者: ${thread.scoutRequest.candidate.name}`,
      "",
      body,
    ].join("\n"),
    metadata: {
      threadId: thread.id,
      messageId: message.id,
      scoutRequestId: thread.scoutRequestId,
      candidateId: thread.scoutRequest.candidateId,
      actorId: user.id,
    },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${thread.id}`);
  redirect(`/messages/${thread.id}`);
}

export async function markMessageThreadReadAction(threadId: string) {
  const user = await requireUser();
  const thread = await getAccessibleThread(threadId, user.companyId);

  if (!thread) {
    redirect("/messages?error=スレッドが見つかりません。");
  }

  const count = await markThreadMessagesRead({
    threadId: thread.id,
    companyId: user.companyId,
    userId: user.id,
  });

  if (count > 0) {
    await writeAuditLog({
      action: AuditAction.MESSAGE_READ,
      companyId: user.companyId,
      actorId: user.id,
      ...(await getRequestContext()),
      metadata: {
        threadId: thread.id,
        count,
      },
    });
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${thread.id}`);
  redirect(`/messages/${thread.id}`);
}

export async function closeMessageThreadAction(threadId: string) {
  const user = await requireUser();
  const thread = await getAccessibleThread(threadId, user.companyId);

  if (!thread) {
    redirect("/messages?error=スレッドが見つかりません。");
  }

  await prisma.messageThread.update({
    where: {
      id: thread.id,
    },
    data: {
      status: MessageThreadStatus.CLOSED,
      closedAt: new Date(),
    },
  });

  await writeAuditLog({
    action: AuditAction.MESSAGE_THREAD_CLOSED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      threadId: thread.id,
      scoutRequestId: thread.scoutRequestId,
    },
  });

  await notifyCompanyUsers({
    companyId: user.companyId,
    excludeUserId: user.id,
    roles: [UserRole.OWNER, UserRole.ADMIN],
    type: NotificationType.MESSAGE_THREAD_CLOSED,
    subject: `メッセージスレッドがクローズされました: ${thread.subject}`,
    body: [
      `${user.name}さんがメッセージスレッドをクローズしました。`,
      "",
      `件名: ${thread.subject}`,
      `候補者: ${thread.scoutRequest.candidate.name}`,
    ].join("\n"),
    metadata: {
      threadId: thread.id,
      scoutRequestId: thread.scoutRequestId,
      actorId: user.id,
    },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${thread.id}`);
  redirect(`/messages/${thread.id}?notice=スレッドをクローズしました。`);
}
