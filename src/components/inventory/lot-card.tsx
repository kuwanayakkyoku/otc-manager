// src/components/inventory/lot-card.tsx
"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { daysLeft, formatDate, getAlertStatusSimple } from "@/lib/date";
import { Trash2, Package, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryLotWithProduct } from "@/types";

interface LotCardProps {
  lot: InventoryLotWithProduct;
  onQuantityUpdate: (lotId: string, quantity: number) => Promise<void>;
  onDispose: (lotId: string, quantity: number, reason: string) => Promise<void>;
  onDelete: (lotId: string) => Promise<void>;
}

export function LotCard({ lot, onQuantityUpdate, onDispose, onDelete }: LotCardProps) {
  const days = daysLeft(lot.expiryDate);
  const status = getAlertStatusSimple(days);
  const [mode, setMode] = useState<"view" | "edit" | "dispose">("view");
  const [qty, setQty] = useState(lot.quantity);
  const [disposeQty, setDisposeQty] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusColors = {
    expired: "border-l-red-500",
    days7: "border-l-yellow-400",
    days30: "border-l-blue-400",
    normal: "border-l-green-400",
  };

  async function handleSaveQty() {
    setLoading(true);
    await onQuantityUpdate(lot.id, qty);
    setLoading(false);
    setMode("view");
  }

  async function handleDispose() {
    if (!reason.trim()) return;
    setLoading(true);
    await onDispose(lot.id, disposeQty, reason);
    setLoading(false);
    setMode("view");
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true);
    await onDelete(lot.id);
    setLoading(false);
  }

  return (
    <div className={cn("bg-white rounded-xl border-l-4 shadow-sm px-4 py-3", statusColors[status])}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge status={status} />
            <span className="text-sm font-semibold text-gray-800">
              {formatDate(lot.expiryDate)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {days < 0 ? `${Math.abs(days)}日超過` : days === 0 ? "本日期限" : `残 ${days}日`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{lot.quantity}<span className="text-sm font-normal text-gray-500">個</span></p>
          <p className="text-xs text-gray-400">入荷時 {lot.initialQuantity}個</p>
        </div>
      </div>

      {/* Actions */}
      {mode === "view" && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => setMode("edit")} className="flex-1 text-xs">
            数量修正
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMode("dispose")} className="flex-1 text-xs text-orange-600 border-orange-300">
            廃棄登録
          </Button>
          <Button
            size="sm"
            variant={confirmDelete ? "destructive" : "outline"}
            onClick={handleDelete}
            disabled={loading}
            className="text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmDelete ? "確認" : ""}
          </Button>
        </div>
      )}

      {mode === "edit" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" onClick={() => setQty(Math.max(0, qty - 1))} className="h-9 w-9">
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              value={qty}
              min={0}
              onChange={(e) => setQty(Number(e.target.value))}
              className="text-center h-9 text-base font-bold"
            />
            <Button size="icon" variant="outline" onClick={() => setQty(qty + 1)} className="h-9 w-9">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveQty} disabled={loading} className="flex-1 text-xs">保存</Button>
            <Button size="sm" variant="outline" onClick={() => { setQty(lot.quantity); setMode("view"); }} className="flex-1 text-xs">キャンセル</Button>
          </div>
        </div>
      )}

      {mode === "dispose" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" onClick={() => setDisposeQty(Math.max(1, disposeQty - 1))} className="h-9 w-9">
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              value={disposeQty}
              min={1}
              max={lot.quantity}
              onChange={(e) => setDisposeQty(Number(e.target.value))}
              className="text-center h-9 text-base font-bold"
            />
            <Button size="icon" variant="outline" onClick={() => setDisposeQty(Math.min(lot.quantity, disposeQty + 1))} className="h-9 w-9">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="廃棄理由（必須）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-9 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleDispose} disabled={loading || !reason.trim()} className="flex-1 text-xs">
              <Package className="w-3.5 h-3.5 mr-1" />廃棄実行
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMode("view")} className="flex-1 text-xs">キャンセル</Button>
          </div>
        </div>
      )}
    </div>
  );
}
