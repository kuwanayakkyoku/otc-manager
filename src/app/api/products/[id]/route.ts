// src/app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { LotStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        lots: {
          where: { status: { not: LotStatus.DELETED } },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (!product) return apiError("商品が見つかりません", 404);
    return apiSuccess(product);
  } catch (e) {
    return apiError("商品の取得に失敗しました", 500, e);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, spec, janCode, alertDays } = body;

    if (!name || !spec || !janCode) {
      return apiError("name, spec, janCode は必須です");
    }

    // JANコード重複チェック（自分以外）
    const dup = await prisma.product.findFirst({
      where: { janCode, id: { not: params.id } },
    });
    if (dup) return apiError("このJANコードはすでに使用されています", 409);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { name, spec, janCode, alertDays },
    });

    return apiSuccess(product);
  } catch (e) {
    return apiError("商品の更新に失敗しました", 500, e);
  }
}
