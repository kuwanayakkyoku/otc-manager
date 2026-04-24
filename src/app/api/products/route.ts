export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { daysLeft, getAlertStatusSimple } from "@/lib/date";
import { LotStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const filter = searchParams.get("filter") ?? "all"; // all | expired | days7 | days30

    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { janCode: { contains: search } },
            ],
          }
        : undefined,
      include: {
        lots: {
          where: { status: LotStatus.ACTIVE },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const summaries = products
      .map((p) => {
        const activeLots = p.lots;
        const totalQuantity = activeLots.reduce((s, l) => s + l.quantity, 0);
        const earliestLot = activeLots[0] ?? null;
        const days = earliestLot ? daysLeft(earliestLot.expiryDate) : null;
        const alertStatus = days !== null ? getAlertStatusSimple(days) : "normal";

        return {
          id: p.id,
          name: p.name,
          spec: p.spec,
          janCode: p.janCode,
          alertDays: p.alertDays,
          earliestExpiry: earliestLot?.expiryDate ?? null,
          totalQuantity,
          alertStatus,
          daysLeft: days,
        };
      })
      .filter((p) => {
        if (filter === "expired") return p.alertStatus === "expired";
        if (filter === "days7") return p.alertStatus === "days7" || p.alertStatus === "expired";
        if (filter === "days30")
          return (
            p.alertStatus === "days30" ||
            p.alertStatus === "days7" ||
            p.alertStatus === "expired"
          );
        return true;
      })
      .sort((a, b) => {
        if (a.daysLeft === null) return 1;
        if (b.daysLeft === null) return -1;
        return a.daysLeft - b.daysLeft;
      });

    return apiSuccess(summaries);
  } catch (e) {
    return apiError("蝠・刀荳隕ｧ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆", 500, e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, spec, janCode, alertDays } = body;

    if (!name || !spec || !janCode) {
      return apiError("name, spec, janCode 縺ｯ蠢・医〒縺・);
    }

    const existing = await prisma.product.findUnique({ where: { janCode } });
    if (existing) {
      return apiError("縺薙・JAN繧ｳ繝ｼ繝峨・縺吶〒縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺・, 409);
    }

    const product = await prisma.product.create({
      data: {
        name,
        spec,
        janCode,
        alertDays: alertDays ?? [30, 7, 0],
      },
    });

    return apiSuccess(product, 201);
  } catch (e) {
    return apiError("蝠・刀縺ｮ逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆", 500, e);
  }
}

