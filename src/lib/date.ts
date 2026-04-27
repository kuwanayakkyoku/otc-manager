// src/lib/date.ts
import { format, differenceInDays, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { AlertStatus } from "@/types";

const TZ = "Asia/Tokyo";

/** 現在のJST日付（時刻なし） */
export function nowJST(): Date {
  return toZonedTime(new Date(), TZ);
}

/** JST基準で今日の0時 */
export function todayJST(): Date {
  return startOfDay(toZonedTime(new Date(), TZ));
}

/** 残日数（JST基準）。過去は負 */
export function daysLeft(expiryDate: Date): number {
  const today = todayJST();
  const expiry = startOfDay(toZonedTime(expiryDate, TZ));
  return differenceInDays(expiry, today);
}

/** 表示用日付フォーマット */
export function formatDate(date: Date): string {
  return format(toZonedTime(date, TZ), "yyyy/MM/dd");
}

/** ISO文字列からDate */
export function parseDate(str: string): Date {
  return fromZonedTime(new Date(str), TZ);
}

/** 残日数からアラートステータスを判定 */
export function getAlertStatus(days: number, alertDays: number[]): AlertStatus {
  const sorted = [...alertDays].sort((a, b) => a - b);
  if (days <= (sorted[0] ?? 0)) return days < 0 ? "expired" : "expired";
  if (days < 0) return "expired";
  if (days <= (sorted[1] ?? 7)) return "days7";
  if (days <= (sorted[2] ?? 30)) return "days30";
  return "normal";
}

/** シンプルなアラートステータス判定（固定閾値） */
export function getAlertStatusSimple(days: number): AlertStatus {
  if (days < 0) return "expired";
  if (days <= 30) return "days7";
  if (days <= 90) return "days30";
  return "normal";
}

export const ALERT_STATUS_CONFIG = {
  expired: {
    label: "期限切れ",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  days7: {
    label: "30日以内",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-400",
  },
  days30: {
    label: "3カ月以内",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
  normal: {
    label: "正常",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
} as const;
