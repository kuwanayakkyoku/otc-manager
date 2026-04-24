import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";

export const dynamic = "force-dynamic";

interface ExecuteRow {
  janCode: string;
  productName: string;
  quantity: number;
  transactionId: string;
  productId?: string;
  matched: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { LotStatus, SaleSource } = await import("@prisma/client");

    const body = await req.json();
    const rows: ExecuteRow[] = body.rows;
    if (!rows?.length) return apiError("処理対象データがありません");

    const results = {
      processed: 0,
      unmatched: 0,
      errors: [] as string[],
    };

    for (const row of rows) {
      if (!row.matched || !row.productId) {
        await prisma.unmatchedSale.create({
          data: {
            rawProductName: row.productName,
            janCode: row.janCode || null,
            quantity: row.quantity,
            resolved: false,
          },
        });
        results.unmatched++;
        continue;
      }

      let remaining = row.quantity;
      const lots = await prisma.inventoryLot.findMany({
        where: { productId: row.productId, status: LotStatus.ACTIVE, quantity: { gt: 0 } },
        orderBy: { expiryDate: "asc" },
      });

      for (const lot of lots) {
        if (remaining <= 0) break;
        const deduct = Math.min(lot.quantity, remaining);

        await prisma.$transaction([
          prisma.salesRecord.create({
            data: {
              lotId: lot.id,
              quantity: deduct,
              source: SaleSource.CSV_IMPORT,
              posTransactionId: row.transactionId || null,
            },
          }),
          prisma.inventoryLot.update({
            where: { id: lot.id },
            data: {
              quantity: lot.quantity - deduct,
              status: lot.quantity - deduct === 0 ? LotStatus.ARCHIVED : LotStatus.ACTIVE,
            },
          }),
        ]);
        remaining -= deduct;
      }

      if (remaining > 0) {
        results.errors.push(`${row.productName}: 在庫不足（${remaining}個消し込み不能）`);
      }
      results.processed++;
    }

    return apiSuccess(results);
  } catch (e) {
    return apiError("消し込み実行に失敗しました", 500, e);
  }
}