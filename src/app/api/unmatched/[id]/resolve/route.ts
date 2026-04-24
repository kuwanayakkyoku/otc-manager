// src/app/api/unmatched/[id]/resolve/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function PUT(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.unmatchedSale.findUnique({ where: { id: params.id } });
    if (!item) return apiError("未割当データが見つかりません", 404);

    const updated = await prisma.unmatchedSale.update({
      where: { id: params.id },
      data: { resolved: true },
    });
    return apiSuccess(updated);
  } catch (e) {
    return apiError("解決処理に失敗しました", 500, e);
  }
}
