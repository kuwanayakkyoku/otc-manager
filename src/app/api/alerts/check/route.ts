// src/app/api/alerts/check/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { sendLineMessage } from "@/lib/api";
import { daysLeft, formatDate } from "@/lib/date";
import { LotStatus, AlertType } from "@prisma/client";

// Vercel Cron からのリクエストを検証
function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("authorization");
  return secret === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return apiError("Unauthorized", 401);

  try {
    const lots = await prisma.inventoryLot.findMany({
      where: { status: LotStatus.ACTIVE },
      include: { product: true },
    });

    const expired: typeof lots = [];
    const days7: typeof lots = [];
    const days30: typeof lots = [];

    for (const lot of lots) {
      const days = daysLeft(lot.expiryDate);
      const alertDays = lot.product.alertDays;

      // 閾値チェック（SKUごとのalertDays利用）
      const thresholds = [...alertDays].sort((a, b) => a - b);
      const t0 = thresholds[0] ?? 0;
      const t1 = thresholds[1] ?? 7;
      const t2 = thresholds[2] ?? 30;

      let alertType: AlertType | null = null;
      if (days <= t0) alertType = AlertType.EXPIRED;
      else if (days <= t1) alertType = AlertType.DAYS_7;
      else if (days <= t2) alertType = AlertType.DAYS_30;

      if (!alertType) continue;

      // 同一alertTypeの送信済みチェック
      const alreadySent = await prisma.alertLog.findFirst({
        where: { lotId: lot.id, alertType },
      });
      if (alreadySent) continue;

      if (alertType === AlertType.EXPIRED) expired.push(lot);
      else if (alertType === AlertType.DAYS_7) days7.push(lot);
      else days30.push(lot);

      await prisma.alertLog.create({ data: { lotId: lot.id, alertType } });
    }

    const total = expired.length + days7.length + days30.length;
    if (total === 0) return apiSuccess({ message: "アラート対象なし", sent: 0 });

    // LINEメッセージ組み立て
    let message = "【賞味期限アラート】\n";

    if (expired.length > 0) {
      message += "\n🔴 期限切れ\n";
      expired.forEach((l) => {
        message += `・${l.product.name} ${l.product.spec}｜期限: ${formatDate(l.expiryDate)}｜残: ${l.quantity}個\n`;
      });
    }
    if (days7.length > 0) {
      message += "\n🟡 7日以内\n";
      days7.forEach((l) => {
        message += `・${l.product.name} ${l.product.spec}｜期限: ${formatDate(l.expiryDate)}｜残: ${l.quantity}個\n`;
      });
    }
    if (days30.length > 0) {
      message += "\n🟢 30日以内\n";
      days30.forEach((l) => {
        message += `・${l.product.name} ${l.product.spec}｜期限: ${formatDate(l.expiryDate)}｜残: ${l.quantity}個\n`;
      });
    }

    await sendLineMessage(message.trim());

    return apiSuccess({ message: "通知送信完了", sent: total });
  } catch (e) {
    return apiError("アラートチェックに失敗しました", 500, e);
  }
}
