export const dynamic = "force-dynamic";
// src/app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { LotStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  // ...このあとに続くコード