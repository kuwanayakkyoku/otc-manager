export const dynamic = "force-dynamic";
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
    return apiError("繝ｭ繝・ヨ荳隕ｧ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆", 500, e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, expiryDate, quantity } = body;

    if (!productId || !expiryDate || quantity === undefined) {
      return apiError("productId, expiryDate, quantity 縺ｯ蠢・医〒縺・);
    }
    if (quantity <= 0) return apiError("謨ｰ驥上・1莉･荳翫〒蜈･蜉帙＠縺ｦ縺上□縺輔＞");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return apiError("蝠・刀縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ", 404);

    // JST縺ｮ譌･莉俶枚蟄怜・繧旦TC縺ｫ螟画鋤
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
    return apiError("繝ｭ繝・ヨ縺ｮ逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆", 500, e);
  }
}

