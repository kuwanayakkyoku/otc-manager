// src/middleware.ts
// 認証ミドルウェアの枠（将来の認証追加用）
// 現在は認証不要。NextAuth.js 等を追加する際にここに実装を追加してください。

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: 認証チェックをここに追加
  // 例: セッションクッキーの検証、JWT検証など

  return NextResponse.next();
}

export const config = {
  // 認証が必要になったらパスを追加
  matcher: [],
};
