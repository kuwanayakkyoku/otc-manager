// src/lib/api.ts
import { NextResponse } from "next/server";
import type { ApiError } from "@/types";

export function apiError(message: string, status = 400, details?: unknown): NextResponse {
  const body: ApiError = { error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** LINE Messaging API */
export async function sendLineMessage(message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;
  if (!token || !userId) throw new Error("LINE credentials not configured");

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: message }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`LINE API error: ${JSON.stringify(err)}`);
  }
}

/** CSV用パーサーインターフェース（POS差し替え対応） */
export interface CsvRow {
  janCode: string;
  productName: string;
  quantity: number;
  transactionDate: string;
  transactionId: string;
}

/** 汎用CSVパーサー。POSレジ変更時はここだけ差し替え */
export function parseCsvRow(raw: Record<string, string>): CsvRow {
  return {
    janCode: (raw["JANコード"] ?? raw["jan_code"] ?? raw["janCode"] ?? "").trim(),
    productName: (raw["商品名"] ?? raw["product_name"] ?? "").trim(),
    quantity: parseInt(raw["数量"] ?? raw["quantity"] ?? "0", 10),
    transactionDate: (raw["取引日"] ?? raw["transaction_date"] ?? "").trim(),
    transactionId: (raw["取引ID"] ?? raw["transaction_id"] ?? "").trim(),
  };
}
