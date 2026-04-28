"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, ALERT_STATUS_CONFIG } from "@/lib/date";
import { Search, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertStatus } from "@/types";

type Filter = "all" | "expired" | "days7" | "days30";

interface ProductSummary {
  id: string;
  name: string;
  spec: string;
  janCode: string;
  earliestExpiry: string | null;
  totalQuantity: number;
  alertStatus: AlertStatus;
  daysLeft: number | null;
}

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "全件" },
  { key: "expired", label: "期限切れ" },
  { key: "days7", label: "30日以内" },
  { key: "days30", label: "3ヶ月以内" },
];

function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>((searchParams.get("filter") as Filter) ?? "all");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("filter", filter);
    const res = await fetch(`/api/products?${params}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <PageHeader
        title="在庫一覧"
        right={
          <a href="/api/export" download className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
            CSV出力
          </a>
        }
      />
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100 sticky top-14 z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="商品名・JANコードで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              className="pl-9"
            />
          </div>
          <button onClick={load} className="bg-blue-600 text-white px-4 rounded-xl
git add .
git commit -m "fix inventory page"
git push
git add .
git commit -m "fix inventory page"
git push
[System.IO.File]::WriteAllText("src\app\inventory\page.tsx", @'
"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, ALERT_STATUS_CONFIG } from "@/lib/date";
import { Search, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertStatus } from "@/types";

type Filter = "all" | "expired" | "days7" | "days30";

interface ProductSummary {
  id: string;
  name: string;
  spec: string;
  janCode: string;
  earliestExpiry: string | null;
  totalQuantity: number;
  alertStatus: AlertStatus;
  daysLeft: number | null;
}

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "全件" },
  { key: "expired", label: "期限切れ" },
  { key: "days7", label: "30日以内" },
  { key: "days30", label: "3ヶ月以内" },
];

function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>((searchParams.get("filter") as Filter) ?? "all");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("filter", filter);
    const res = await fetch(`/api/products?${params}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <PageHeader
        title="在庫一覧"
        right={
          <a href="/api/export" download className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
            CSV出力
          </a>
        }
      />
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100 sticky top-14 z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="商品名・JANコードで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              className="pl-9"
            />
          </div>
          <button onClick={load} className="bg-blue-600 text-white px-4 rounded-xl text-sm font-semibold">
            検索
          </button>
        </div>
        <div className="flex gap-1 mt-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-colors",
                filter === key ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-3 space-y-2">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
          ))
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">商品が見つかりません</p>
          </div>
        ) : (
          products.map((p) => {
            const cfg = ALERT_STATUS_CONFIG[p.alertStatus];
            return (
              <button
                key={p.id}
                onClick={() => router.push(`/inventory/${p.id}`)}
                className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 text-left shadow-sm active:bg-gray-50"
              >
                <div className={cn("w-1.5 h-12 rounded-full flex-shrink-0", cfg.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.spec}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge status={p.alertStatus} />
                    {p.earliestExpiry && (
                      <span className="text-xs text-gray-400">
                        最短: {formatDate(new Date(p.earliestExpiry))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900">{p.totalQuantity}<span className="text-xs text-gray-400 font-normal">個</span></p>
                  {p.daysLeft !== null && (
                    <p className={cn("text-xs font-semibold", cfg.color)}>
                      {p.daysLeft < 0 ? `${Math.abs(p.daysLeft)}日超過` : p.daysLeft === 0 ? "本日期限" : `残${p.daysLeft}日`}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">読み込み中…</div>}>
      <InventoryContent />
    </Suspense>
  );
}