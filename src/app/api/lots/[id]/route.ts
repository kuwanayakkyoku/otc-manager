// src/app/api/lots/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { LotStatus } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { quantity } = body;

    if (quantity === undefined) return apiError("quantity は必須です");
    if (quantity < 0) return apiError("在庫数は0以上でなければなりません");

    const lot = await prisma.inventoryLot.findUnique({ where: { id: params.id } });
    if (!lot) return apiError("ロットが見つかりません", 404);
    if (lot.status === LotStatus.DELETED) return apiError("削除済みのロットは更新できません");

    const updated = await prisma.inventoryLot.update({
      where: { id: params.id },
      data: { quantity },
    });

    return apiSuccess(updated);
  } catch (e) {
    return apiError("ロットの更新に失敗しました", 500, e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lot = await prisma.inventoryLot.findUnique({ where: { id: params.id } });
    if (!lot) return apiError("ロットが見つかりません", 404);

    // 論理削除
    const updated = await prisma.inventoryLot.update({
      where: { id: params.id },
      data: { status: LotStatus.DELETED },
    });

    return apiSuccess(updated);
  } catch (e) {
    return apiError("ロットの削除に失敗しました", 500, e);
  }
}
