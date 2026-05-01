// csv export added
// src/app/scan/page.tsx
"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { Minus, Plus, Check, ScanLine } from "lucide-react";

type Mode = "scan" | "form-existing" | "form-new" | "done";

interface Product {
  id: string;
  name: string;
  spec: string;
  janCode: string;
}

export default function ScanPage() {
  const { toasts, toast, dismiss } = useToast();
  const [mode, setMode] = useState<Mode>("scan");
  const [janCode, setJanCode] = useState("");
  const [manualJan, setManualJan] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [newName, setNewName] = useState("");
  const [newSpec, setNewSpec] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  async function lookupJan(code: string) {
    setJanCode(code);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/jan/${code}`);
      if (res.ok) {
        const p = await res.json();
        setProduct(p);
        setMode("form-existing");
      } else {
        setProduct(null);
        setMode("form-new");
      }
    } catch {
      toast("JANコード検索中にエラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualLookup() {
    if (!manualJan.trim()) return;
    await lookupJan(manualJan.trim());
  }

  async function handleSubmit() {
    if (!expiryDate || quantity < 1) {
      toast("期限と数量を入力してください", "error");
      return;
    }
    setLoading(true);

    try {
      let productId = product?.id;

      // 新規SKU登録
      if (!productId) {
        if (!newName || !newSpec) {
          toast("商品名と規格を入力してください", "error");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName, spec: newSpec, janCode }),
        });
        if (!res.ok) {
          const err = await res.json();
          toast(err.error, "error");
          setLoading(false);
          return;
        }
        const newProduct = await res.json();
        productId = newProduct.id;
      }

      // ロット登録
      const res = await fetch("/api/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, expiryDate, quantity }),
      });

      if (res.ok) {
        toast("在庫を登録しました ✅", "success");
        setMode("done");
      } else {
        const err = await res.json();
        toast(err.error, "error");
      }
    } catch {
      toast("登録中にエラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMode("scan");
    setJanCode("");
    setManualJan("");
    setProduct(null);
    setNewName("");
    setNewSpec("");
    setExpiryDate("");
    setQuantity(1);
  }

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageHeader title="バーコードスキャン" subtitle="JANコードを読み取って在庫を登録" />

      <div className="px-4 pt-4 space-y-4">
        {mode === "scan" && (
          <>
            <BarcodeScanner
              onDetected={lookupJan}
              onError={(e) => toast(e, "error")}
            />
            {/* Manual input fallback */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">手動入力</p>
              <div className="flex gap-2">
                <Input
                  placeholder="JANコードを入力"
                  value={manualJan}
                  onChange={(e) => setManualJan(e.target.value)}
                  inputMode="numeric"
                  className="text-base"
                />
                <Button onClick={handleManualLookup} disabled={loading} className="flex-shrink-0">
                  <ScanLine className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {(mode === "form-existing" || mode === "form-new") && (
          <div className="space-y-4">
            {/* Product info */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">JAN: {janCode}</p>
                  {mode === "form-existing" && product ? (
                    <>
                      <p className="font-bold text-gray-900 text-lg">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.spec}</p>
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">既存商品</span>
                    </>
                  ) : (
                    <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">新規商品</span>
                  )}
                </div>
                <button onClick={reset} className="text-xs text-blue-600 underline">再スキャン</button>
              </div>
            </div>

            {/* New product fields */}
            {mode === "form-new" && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
                <p className="text-sm font-bold text-gray-700">商品マスタ登録</p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">商品名</label>
                  <Input placeholder="例：ロキソニンS" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">規格</label>
                  <Input placeholder="例：12錠入り" value={newSpec} onChange={(e) => setNewSpec(e.target.value)} />
                </div>
              </div>
            )}

            {/* Lot input */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
              <p className="text-sm font-bold text-gray-700">入荷情報</p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">使用期限</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">個数</label>
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 rounded-xl"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="text-center text-2xl font-bold h-12"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full">
              {loading ? "登録中…" : "在庫を登録する"}
            </Button>
          </div>
        )}

        {mode === "done" && (
          <div className="flex flex-col items-center py-16 space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">登録完了</p>
            <p className="text-sm text-gray-500">{product?.name ?? newName}</p>
            <Button onClick={reset} size="lg" className="mt-4 w-full">
              続けてスキャン
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
