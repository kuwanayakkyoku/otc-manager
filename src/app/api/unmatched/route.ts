// src/app/api/unmatched/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(_req: NextRequest) {
  try {
    const items = await prisma.unmatchedSale.findMany({
      where: { resolved: false },
      orderBy: { importedAt: "desc" },
    });
    return apiSuccess(items);
  } catch (e) {
    return apiError("未割当一覧の取得に失敗しました", 500, e);
  }
}
