// src/app/api/lots/[id]/dispose/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { LotStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { quantity, reason } = body;

    if (!quantity || !reason) return apiError("quantity と reason は必須です");
    if (quantity <= 0) return apiError("廃棄数量は1以上で入力してください");

    const lot = await prisma.inventoryLot.findUnique({ where: { id: params.id } });
    if (!lot) return apiError("ロットが見つかりません", 404);
    if (lot.status === LotStatus.DELETED) return apiError("削除済みロットは廃棄できません");
    if (lot.quantity < quantity) {
      return apiError(`在庫数(${lot.quantity})を超える廃棄はできません`);
    }

    const [disposal, updatedLot] = await prisma.$transaction([
      prisma.disposalRecord.create({
        data: { lotId: params.id, quantity, reason },
      }),
      prisma.inventoryLot.update({
        where: { id: params.id },
        data: {
          quantity: lot.quantity - quantity,
          status: lot.quantity - quantity === 0 ? LotStatus.ARCHIVED : lot.status,
        },
      }),
    ]);

    return apiSuccess({ disposal, lot: updatedLot }, 201);
  } catch (e) {
    return apiError("廃棄登録に失敗しました", 500, e);
  }
}
