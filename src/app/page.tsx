"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { ALERT_STATUS_CONFIG } from "@/lib/date";
import type { AlertStatus } from "@/types";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";

interface AlertLotItem {
  lotId: string;
  productId: string;
  productName: string;
  spec: string;
  expiryDate: string;
  expiryDateFormatted?: string;
  quantity: number;
  daysLeft: number;
  alertStatus: AlertStatus;
}

interface DashboardStats {
  expiredCount: number;
  days30Count: number;
  days90Count: number;
  alertLots: AlertLotItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    if (res.ok) setStats(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const statsList = [
    { key: "expired" as AlertStatus, label: "期限切れ", count: stats?.expiredCount ?? 0 },
    { key: "days30" as AlertStatus, label: "30日以内", count: stats?.days30Count ?? 0 },
    { key: "days180" as AlertStatus, label: "3ヶ月以内", count: stats?.days30Count ?? 0 }
  ];

  return (
    <div>
      <PageHeader
        title="OTC期限管理"
        subtitle={new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
        right={
          <button onClick={load} className="p-2 text-gray-400 active:text-gray-600">
            <RefreshCw className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
              ))
            : statsList.map(({ key, label, count }) => {
                const cfg = ALERT_STATUS_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => router.push(`/inventory?filter=${key}`)}
                    className={`${cfg.bg} ${cfg.border} border rounded-2xl p-3 text-left active:scale-95 transition-transform`}
                  >
                    <p className={`text-3xl font-black ${cfg.color}`}>{count}</p>
                    <p className={`text-xs font-semibold mt-1 ${cfg.color}`}>{label}</p>
                  </button>
                );
              })}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-700">要対応ロット（期限昇順）</h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : stats?.alertLots?.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-700">アラート対象なし</p>
              <p className="text-xs text-green-500 mt-1">すべての商品が正常です</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.alertLots?.map((lot) => {
                const cfg = ALERT_STATUS_CONFIG[lot.alertStatus];
                const dateLabel = lot.expiryDateFormatted ?? formatDate(new Date(lot.expiryDate));
                return (
                  <button
                    key={lot.lotId}
                    onClick={() => router.push(`/inventory?filter=${lot.alertStatus}`)}
                    className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 text-left shadow-sm active:bg-gray-50"
                  >
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{lot.productName}</p>
                      <p className="text-xs text-gray-400">{lot.spec}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${cfg.color}`}>
                        {lot.daysLeft < 0 ? `${Math.abs(lot.daysLeft)}日超過` : lot.daysLeft === 0 ? "本日" : `${lot.daysLeft}日`}
                      </p>
                      <p className="text-xs text-gray-400">{dateLabel}</p>
                      <p className="text-xs text-gray-500">{lot.quantity}個</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}