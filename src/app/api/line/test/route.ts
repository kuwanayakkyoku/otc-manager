export const dynamic = "force-dynamic";
// src/app/api/line/test/route.ts
import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { sendLineMessage } from "@/lib/api";

export async function POST(_req: NextRequest) {
  try {
    await sendLineMessage(
      "縲舌ユ繧ｹ繝磯夂衍縲曾nOTC譛滄剞邂｡逅・す繧ｹ繝・Β縺九ｉ縺ｮ繝・せ繝磯夂衍縺ｧ縺吶・nLINE騾｣謳ｺ縺梧ｭ｣蟶ｸ縺ｫ險ｭ螳壹＆繧後※縺・∪縺・笨・
    );
    return apiSuccess({ message: "繝・せ繝磯夂衍繧帝∽ｿ｡縺励∪縺励◆" });
  } catch (e) {
    return apiError("LINE騾夂衍縺ｮ騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆", 500, e instanceof Error ? e.message : e);
  }
}

