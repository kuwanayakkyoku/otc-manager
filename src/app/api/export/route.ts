export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { apiError } from "@/lib/api";

export async function GET(_req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { daysLeft, getAlertStatusSimple, formatDate } = await import("@/lib/date");
    const { LotStatus } = await import("@prisma/client");

    const lots = await prisma.inventoryLot.findMany({
      where: { status: LotStatus.ACTIVE },
      include: { product: true },
      orderBy: { expiryDate: "asc" },
    });

    const statusLabel: Record<string, string> = {
      expired: "期限切れ",
      days7: "30日以内",
      days30: "3ヶ月以内",
      normal: "正常",
    };

    const rows = [
      ["商品名", "規格", "JANコード", "使用期限", "在庫数", "ステータス"],
      ...lots.map((lot) => {
        const days = daysLeft(lot.expiryDate);
        const status = getAlertStatusSimple(days);
        return [
          lot.product.name,
          lot.product.spec,
          lot.product.janCode,
          formatDate(lot.expiryDate),
          String(lot.quantity),
          statusLabel[status],
        ];
      }),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const bom = "\uFEFF";
    return new Response(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inventory_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    return apiError("CSV出力に失敗しました", 500, e);
  }
}