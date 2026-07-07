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
    console.info("[contact:accepted_without_email]", {
      name: input.name,
      email: input.email,
      category: input.category,
      messageLength: input.message.length,
      acceptedAt: new Date().toISOString(),
    });
    return "logged";
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
    const result = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };

    console.error("[contact:email_failed]", {
      status: response.status,
      error: result.message ?? result.error ?? "Unknown Resend error",
      acceptedAt: new Date().toISOString(),
    });
    return "logged";
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

  const notice =
    result === "emailed"
      ? "お問い合わせを受け付けました。運営側で内容を確認します。"
      : "お問い合わせを受け付けました。メール送信が未設定の場合も、受付ログとして記録します。";

  redirect(`/contact?notice=${encodeURIComponent(notice)}`);
}
