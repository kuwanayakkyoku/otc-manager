// src/app/api/products/jan/[code]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { janCode: params.code },
    });

    if (!product) return apiError("商品が見つかりません", 404);
    return apiSuccess(product);
  } catch (e) {
    return apiError("JANコード検索に失敗しました", 500, e);
  }
}
