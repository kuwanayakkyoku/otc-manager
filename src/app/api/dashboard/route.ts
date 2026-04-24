// src/app/api/dashboard/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { daysLeft, getAlertStatusSimple, formatDate } from "@/lib/date";
import { LotStatus } from "@prisma/client";

export async function GET(_req: NextRequest) {
  try {
    const lots = await prisma.inventoryLot.findMany({
      where: { status: LotStatus.ACTIVE },
      include: { product: true },
      orderBy: { expiryDate: "asc" },
    });

    const enriched = lots.map((lot) => ({
      ...lot,
      daysLeft: daysLeft(lot.expiryDate),
      alertStatus: getAlertStatusSimple(daysLeft(lot.expiryDate)),
    }));

    const expiredCount = enriched.filter((l) => l.alertStatus === "expired").length;
    const days7Count = enriched.filter((l) => l.alertStatus === "days7").length;
    const days30Count = enriched.filter((l) => l.alertStatus === "days30").length;

    const alertLots = enriched
      .filter((l) => l.alertStatus !== "normal")
      .slice(0, 10)
      .map((l) => ({
        lotId: l.id,
        productId: l.productId,
        productName: l.product.name,
        spec: l.product.spec,
        expiryDate: l.expiryDate,
        expiryDateFormatted: formatDate(l.expiryDate),
        quantity: l.quantity,
        daysLeft: l.daysLeft,
        alertStatus: l.alertStatus,
      }));

    return apiSuccess({ expiredCount, days7Count, days30Count, alertLots });
  } catch (e) {
    return apiError("ダッシュボードデータの取得に失敗しました", 500, e);
  }
}
