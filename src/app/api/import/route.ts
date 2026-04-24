import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { parseCsvRow } from "@/lib/api";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("ファイルが選択されていません");

    const text = await file.text();
    const { data, errors } = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return apiError("CSVの解析に失敗しました", 400, errors);
    }

    const rows = data.map(parseCsvRow);

    const janCodesSet = new Set<string>();
    rows.forEach((r) => { if (r.janCode) janCodesSet.add(r.janCode); });
    const janCodes = Array.from(janCodesSet);

    const products = await prisma.product.findMany({
      where: { janCode: { in: janCodes } },
    });
    const productMap = new Map(products.map((p) => [p.janCode, p]));

    const preview = rows.map((row) => {
      const product = productMap.get(row.janCode);
      return {
        janCode: row.janCode,
        productName: row.productName,
        quantity: row.quantity,
        transactionDate: row.transactionDate,
        transactionId: row.transactionId,
        matched: !!product,
        productId: product?.id,
        resolvedName: product?.name,
        error: !row.janCode ? "JANコードなし" : !row.quantity ? "数量不正" : undefined,
      };
    });

    return apiSuccess({ preview, total: rows.length });
  } catch (e) {
    return apiError("CSVの取込に失敗しました", 500, e);
  }
}