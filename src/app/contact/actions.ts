"use server";

import { redirect } from "next/navigation";
import { requireSameOriginRequest } from "@/lib/auth";

const resendEndpoint = "https://api.resend.com/emails";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function truncate(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

async function sendContactEmail(input: {
  name: string;
  email: string;
  category: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !from || !to) {
    return "not_configured";
  }

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `Succession Club inquiry: ${input.category}`,
      text: [
        "Succession Clubのお問い合わせを受け付けました。",
        "",
        `お名前: ${input.name}`,
        `メール: ${input.email}`,
        `種別: ${input.category}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("[contact:email_failed]", {
      status: response.status,
      acceptedAt: new Date().toISOString(),
    });
    return "failed";
  }

  return "emailed";
}

export async function submitContactAction(formData: FormData) {
  await requireSameOriginRequest();

  const name = truncate(getFormValue(formData, "name"), 80);
  const email = truncate(getFormValue(formData, "email"), 160);
  const category = truncate(getFormValue(formData, "category"), 80);
  const message = truncate(getFormValue(formData, "message"), 3000);

  if (!name || !email || !message || !email.includes("@")) {
    redirect(
      `/contact?error=${encodeURIComponent(
        "お名前、メールアドレス、お問い合わせ内容を確認してください。",
      )}`,
    );
  }

  const result = await sendContactEmail({
    name,
    email,
    category: category || "お問い合わせ",
    message,
  });

  if (result === "not_configured") {
    redirect(
      `/contact?error=${encodeURIComponent(
        "現在、お問い合わせ送信の準備中です。設定完了後にあらためてお試しください。",
      )}`,
    );
  }

  if (result === "failed") {
    redirect(
      `/contact?error=${encodeURIComponent(
        "お問い合わせを送信できませんでした。時間をおいて、もう一度お試しください。",
      )}`,
    );
  }

  redirect(
    `/contact?notice=${encodeURIComponent(
      "お問い合わせを送信しました。運営側で内容を確認します。",
    )}`,
  );
}
