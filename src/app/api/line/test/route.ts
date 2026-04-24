// src/app/api/line/test/route.ts
import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { sendLineMessage } from "@/lib/api";

export async function POST(_req: NextRequest) {
  try {
    await sendLineMessage(
      "【テスト通知】\nOTC期限管理システムからのテスト通知です。\nLINE連携が正常に設定されています ✅"
    );
    return apiSuccess({ message: "テスト通知を送信しました" });
  } catch (e) {
    return apiError("LINE通知の送信に失敗しました", 500, e instanceof Error ? e.message : e);
  }
}
