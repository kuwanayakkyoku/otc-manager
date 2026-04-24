import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const logs = await prisma.alertLog.findMany({
      include: {
        lot: {
          include: { product: true },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 100,
    });
    return apiSuccess(logs);
  } catch (e) {
    return apiError("通知履歴の取得に失敗しました", 500, e);
  }
}