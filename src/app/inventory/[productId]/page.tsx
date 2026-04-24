// src/app/inventory/[productId]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LotCard } from "@/components/inventory/lot-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { LotStatus } from "@prisma/client";
import { ChevronLeft, Plus, Edit2, Check, X } from "lucide-react";
import type { InventoryLotWithProduct } from "@/types";

interface Product {
  id: string;
  name: string;
  spec: string;
  janCode: string;
  alertDays: number[];
  lots: InventoryLotWithProduct[];
}

export default function InventoryDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { toasts, toast, dismiss } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSpec, setEditSpec] = useState("");
  const [editAlertDays, setEditAlertDays] = useState("");
  const [showAddLot, setShowAddLot] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/products/${productId}`);
    if (res.ok) {
      const data = await res.json();
      setProduct(data);
      setEditName(data.name);
      setEditSpec(data.spec);
      setEditAlertDays(data.alertDays.join(", "));
    } else {
      toast("商品が見つかりません", "error");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [productId]);

  async function handleSaveProduct() {
    setSaving(true);
    const alertDays = editAlertDays
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, spec: editSpec, janCode: product!.janCode, alertDays }),
    });
    if (res.ok) {
      toast("商品情報を更新しました", "success");
      setEditMode(false);
      load();
    } else {
      const err = await res.json();
      toast(err.error, "error");
    }
    setSaving(false);
  }

  async function handleAddLot() {
    if (!newExpiry || newQty < 1) { toast("期限と数量を入力してください", "error"); return; }
    setSaving(true);
    const res = await fetch("/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, expiryDate: newExpiry, quantity: newQty }),
    });
    if (res.ok) {
      toast("ロットを追加しました", "success");
      setShowAddLot(false);
      setNewExpiry("");
      setNewQty(1);
      load();
    } else {
      const err = await res.json();
      toast(err.error, "error");
    }
    setSaving(false);
  }

  async function handleQuantityUpdate(lotId: string, quantity: number) {
    const res = await fetch(`/api/lots/${lotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) { toast("数量を更新しました", "success"); load(); }
    else { const err = await res.json(); toast(err.error, "error"); }
  }

  async function handleDispose(lotId: string, quantity: number, reason: string) {
    const res = await fetch(`/api/lots/${lotId}/dispose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity, reason }),
    });
    if (res.ok) { toast("廃棄を登録しました", "success"); load(); }
    else { const err = await res.json(); toast(err.error, "error"); }
  }

  async function handleDelete(lotId: string) {
    const res = await fetch(`/api/lots/${lotId}`, { method: "DELETE" });
    if (res.ok) { toast("ロットを削除しました", "success"); load(); }
    else { const err = await res.json(); toast(err.error, "error"); }
  }

  const activeLots = product?.lots.filter((l) => l.status !== LotStatus.DELETED) ?? [];

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageHeader
        title={loading ? "読み込み中…" : (product?.name ?? "商品詳細")}
        right={
          <button onClick={() => router.back()} className="p-2 text-gray-400 active:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
        }
      />

      {loading ? (
        <div className="px-4 pt-4 space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : product && (
        <div className="px-4 pt-4 space-y-4">
          {/* Product info card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            {!editMode ? (
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-base">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.spec}</p>
                  <p className="text-xs text-gray-400 mt-1">JAN: {product.janCode}</p>
                  <p className="text-xs text-gray-400">アラート閾値: {product.alertDays.join(", ")}日</p>
                </div>
                <button onClick={() => setEditMode(true)} className="p-2 text-gray-400 active:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700">商品マスタ編集</p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">商品名</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">規格</label>
                  <Input value={editSpec} onChange={(e) => setEditSpec(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">アラート閾値（カンマ区切り、例: 30, 7, 0）</label>
                  <Input value={editAlertDays} onChange={(e) => setEditAlertDays(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProduct} disabled={saving} className="flex-1 text-xs">
                    <Check className="w-3.5 h-3.5 mr-1" />保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)} className="flex-1 text-xs">
                    <X className="w-3.5 h-3.5 mr-1" />キャンセル
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Lots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-700">ロット一覧（{activeLots.length}件）</h2>
              <Button size="sm" variant="outline" onClick={() => setShowAddLot(!showAddLot)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />ロット追加
              </Button>
            </div>

            {showAddLot && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 space-y-3">
                <p className="text-sm font-semibold text-blue-800">新規ロット追加</p>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">使用期限</label>
                  <Input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} className="bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">個数</label>
                  <div className="flex items-center gap-3">
                    <Button size="icon" variant="outline" onClick={() => setNewQty(Math.max(1, newQty - 1))} className="h-10 w-10 bg-white">
                      <span className="text-lg">−</span>
                    </Button>
                    <Input
                      type="number"
                      value={newQty}
                      min={1}
                      onChange={(e) => setNewQty(Number(e.target.value))}
                      className="text-center font-bold text-lg bg-white"
                    />
                    <Button size="icon" variant="outline" onClick={() => setNewQty(newQty + 1)} className="h-10 w-10 bg-white">
                      <span className="text-lg">＋</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddLot} disabled={saving} className="flex-1 text-xs">追加する</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddLot(false)} className="flex-1 text-xs">キャンセル</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {activeLots.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">ロットがありません</p>
              ) : (
                activeLots.map((lot) => (
                  <LotCard
                    key={lot.id}
                    lot={lot}
                    onQuantityUpdate={handleQuantityUpdate}
                    onDispose={handleDispose}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
