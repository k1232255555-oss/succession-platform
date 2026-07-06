import { ScoutStatus } from "@prisma/client";

export const scoutStatusLabels: Record<ScoutStatus, string> = {
  DRAFT: "下書き",
  SENT: "送信済み",
  IN_REVIEW: "確認中",
  MEETING: "面談調整",
  ACCEPTED: "承諾",
  DECLINED: "辞退",
  CANCELED: "取消",
};

export const scoutStatusOptions = [
  ScoutStatus.SENT,
  ScoutStatus.IN_REVIEW,
  ScoutStatus.MEETING,
  ScoutStatus.ACCEPTED,
  ScoutStatus.DECLINED,
  ScoutStatus.CANCELED,
] as const;

export function parseScoutStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "");

  if (Object.values(ScoutStatus).includes(status as ScoutStatus)) {
    return status as ScoutStatus;
  }

  return ScoutStatus.SENT;
}

export function parseMeetingDate(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
