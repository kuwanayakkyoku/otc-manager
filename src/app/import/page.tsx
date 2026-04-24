// src/app/import/page.tsx
"use client";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewRow {
  janCode: string;
  productName: string;
  quantity: number;
  transactionDate: string;
  transactionId: string;
  matched: boolean;
  productId?: string;
  resolvedName?: string;
  error?: string;
}

interface UnmatchedItem {
  id: string;
  rawProductName: string;
  janCode: string | null;
  quantity: number;
  importedAt: string;
}

type Step = "upload" | "preview" | "done";

export default function ImportPage() {
  const { toasts, toast, dismiss } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ processed: number; unmatched: number; errors: string[] } | null>(null);
  const [loadingUnmatched, setLoadingUnmatched] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/import", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setPreview(data.preview);
      setStep("preview");
    } else {
      const err = await res.json();
      toast(err.error, "error");
    }
    setLoading(false);
    e.target.value = "";
  }

  async function handleExecute() {
    setLoading(true);
    const res = await fetch("/api/import/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: preview }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
      setStep("done");
      loadUnmatched();
    } else {
      const err = await res.json();
      toast(err.error, "error");
    }
    setLoading(false);
  }

  async function loadUnmatched() {
    setLoadingUnmatched(true);
    const res = await fetch("/api/unmatched");
    if (res.ok) setUnmatched(await res.json());
    setLoadingUnmatched(false);
  }

  async function handleResolve(id: string) {
    const res = await fetch(`/api/unmatched/${id}/resolve`, { method: "PUT" });
    if (res.ok) {
      toast("解決済みにしました", "success");
      setUnmatched((prev) => prev.filter((u) => u.id !== id));
    }
  }

  const matchedCount = preview.filter((r) => r.matched).length;
  const unmatchedCount = preview.filter((r) => !r.matched).length;

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageHeader title="CSV取込" subtitle="POSレジデータを取り込んで在庫を消し込みます" />

      <div className="px-4 pt-4 space-y-4">
        {/* CSV format guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-800 mb-1">CSVフォーマット（ヘッダー行必須）</p>
          <p className="text-xs text-blue-600 font-mono">JANコード, 商品名, 数量, 取引日, 取引ID</p>
        </div>

        {step === "upload" && (
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center gap-3 active:bg-gray-50 transition-colors"
            >
              <Upload className="w-10 h-10 text-gray-300" />
              <p className="font-semibold text-gray-500">{loading ? "解析中…" : "CSVファイルを選択"}</p>
              <p className="text-xs text-gray-400">iPhoneの「ファイル」アプリから選択できます</p>
            </button>

            {/* Unmatched list */}
            {unmatched.length === 0 && (
              <Button variant="ghost" size="sm" onClick={loadUnmatched} disabled={loadingUnmatched} className="w-full text-xs text-gray-500">
                未割当データを確認する
              </Button>
            )}
            {unmatched.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm font-bold text-gray-700">未割当データ（{unmatched.length}件）</p>
                </div>
                <div className="space-y-2">
                  {unmatched.map((u) => (
                    <div key={u.id} className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.rawProductName}</p>
                        <p className="text-xs text-gray-500">JAN: {u.janCode ?? "なし"} ／ 数量: {u.quantity}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleResolve(u.id)} className="text-xs">
                        解決済み
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-green-700">{matchedCount}</p>
                <p className="text-xs font-semibold text-green-600">マッチ済み</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-yellow-700">{unmatchedCount}</p>
                <p className="text-xs font-semibold text-yellow-600">未マッチ</p>
              </div>
            </div>

            {/* Preview rows */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {preview.map((row, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl px-4 py-3 border",
                    row.matched
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {row.matched
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {row.matched ? (row.resolvedName ?? row.productName) : row.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        JAN: {row.janCode} ／ 数量: {row.quantity}
                      </p>
                      {row.error && <p className="text-xs text-red-500">{row.error}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("upload")} className="flex-1">
                やり直す
              </Button>
              <Button onClick={handleExecute} disabled={loading} className="flex-1">
                {loading ? "実行中…" : "消し込み実行"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <p className="text-xl font-bold text-gray-900">消し込み完了</p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>処理件数: <span className="font-bold text-gray-900">{result.processed}</span>件</p>
                <p>未割当: <span className="font-bold text-yellow-600">{result.unmatched}</span>件</p>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-3 bg-red-50 rounded-xl p-3 text-left">
                  <p className="text-xs font-bold text-red-700 mb-1">警告</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => { setStep("upload"); setPreview([]); setResult(null); }}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              続けてCSVを取り込む
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
