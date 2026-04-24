// src/app/settings/page.tsx
"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { Bell, Link, Clock, ChevronRight, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { toasts, toast, dismiss } = useToast();
  const [lineToken, setLineToken] = useState(process.env.NEXT_PUBLIC_LINE_TOKEN_HINT ?? "");
  const [lineUserId, setLineUserId] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [alertTime, setAlertTime] = useState("09:00");
  const [defaultDays, setDefaultDays] = useState("30, 7, 0");

  async function handleLineTest() {
    setTestLoading(true);
    const res = await fetch("/api/line/test", { method: "POST" });
    if (res.ok) {
      toast("テスト通知を送信しました ✅", "success");
    } else {
      const err = await res.json();
      toast(err.error ?? "送信に失敗しました", "error");
    }
    setTestLoading(false);
  }

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageHeader title="設定" />

      <div className="px-4 pt-4 space-y-5">
        {/* Alert thresholds */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Bell className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-800 text-sm">アラート設定</h2>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                デフォルトアラート閾値（カンマ区切り・日数）
              </label>
              <Input
                value={defaultDays}
                onChange={(e) => setDefaultDays(e.target.value)}
                placeholder="例: 30, 7, 0"
              />
              <p className="text-xs text-gray-400 mt-1">
                各商品の個別設定はないためデフォルト値が適用されます
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                アラート実行時刻
              </label>
              <Input
                type="time"
                value={alertTime}
                onChange={(e) => setAlertTime(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Vercel Cron Jobs の設定と合わせてください（vercel.json）
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => toast("設定を保存しました（環境変数で管理してください）", "info")}
            >
              設定を保存
            </Button>
          </div>
        </div>

        {/* LINE integration */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Link className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-gray-800 text-sm">LINE連携</h2>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ セキュリティに注意</p>
              <p className="text-xs text-yellow-700">
                トークンは環境変数（.env.local）で管理することを推奨します。
                本画面での変更はUIのみで、再起動時にリセットされます。
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                LINE Channel Access Token
              </label>
              <Input
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="LINE_CHANNEL_ACCESS_TOKEN"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                LINE User ID（通知先）
              </label>
              <Input
                value={lineUserId}
                onChange={(e) => setLineUserId(e.target.value)}
                placeholder="LINE_USER_ID"
              />
            </div>
            <Button
              onClick={handleLineTest}
              disabled={testLoading}
              variant="success"
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {testLoading ? "送信中…" : "テスト通知を送信"}
            </Button>
          </div>
        </div>

        {/* Cron info */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Clock className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-gray-800 text-sm">自動アラートバッチ</h2>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-xs text-gray-500">
              Vercel Cron Jobs で毎日自動実行されます。vercel.json に以下を追加してください。
            </p>
            <div className="bg-gray-900 rounded-xl p-3 overflow-x-auto">
              <pre className="text-xs text-green-400 whitespace-pre">{`{
  "crons": [{
    "path": "/api/alerts/check",
    "schedule": "0 0 * * *"
  }]
}`}</pre>
            </div>
            <p className="text-xs text-gray-400">
              ※ スケジュールはUTC基準です。JST 09:00 = UTC 00:00
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs flex items-center justify-between"
              onClick={() => toast("手動実行は API から POST /api/alerts/check で行えます", "info")}
            >
              <span>手動でアラートチェックを実行</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Environment variables guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-700 mb-2">必要な環境変数（.env.local）</p>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-5">{`DATABASE_URL="postgresql://..."
LINE_CHANNEL_ACCESS_TOKEN="..."
LINE_USER_ID="U..."
CRON_SECRET="your-secret"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"`}</pre>
          </div>
        </div>

        <div className="pb-6 text-center">
          <p className="text-xs text-gray-400">OTC期限管理 v0.1.0</p>
        </div>
      </div>
    </div>
  );
}
