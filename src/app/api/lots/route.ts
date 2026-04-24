// src/app/api/lots/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { LotStatus } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const lots = await prisma.inventoryLot.findMany({
      where: {
        ...(productId ? { productId } : {}),
        status: { not: LotStatus.DELETED },
      },
      include: { product: true },
      orderBy: { expiryDate: "asc" },
    });

    return apiSuccess(lots);
  } catch (e) {
    return apiError("ロット一覧の取得に失敗しました", 500, e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, expiryDate, quantity } = body;

    if (!productId || !expiryDate || quantity === undefined) {
      return apiError("productId, expiryDate, quantity は必須です");
    }
    if (quantity <= 0) return apiError("数量は1以上で入力してください");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return apiError("商品が見つかりません", 404);

    // JSTの日付文字列をUTCに変換
    const expiryDateUTC = fromZonedTime(new Date(expiryDate), "Asia/Tokyo");

    const lot = await prisma.inventoryLot.create({
      data: {
        productId,
        expiryDate: expiryDateUTC,
        quantity,
        initialQuantity: quantity,
        status: LotStatus.ACTIVE,
      },
      include: { product: true },
    });

    return apiSuccess(lot, 201);
  } catch (e) {
    return apiError("ロットの登録に失敗しました", 500, e);
  }
}