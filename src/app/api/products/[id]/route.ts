export const dynamic = "force-dynamic";
// src/app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        lots: {
          where: { status: { not: "DELETED" } },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (!product) return apiError("商品が見つかりません", 404);
    return apiSuccess(product);
  } catch (e) {
    return apiError("商品情報の取得に失敗しました", 500, e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: params.id },
      data: body,
    });
    return apiSuccess(product);
  } catch (e) {
    return apiError("商品情報の更新に失敗しました", 500, e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return apiSuccess({ message: "商品を削除しました" });
  } catch (e) {
    return apiError("商品の削除に失敗しました", 500, e);
  }
}