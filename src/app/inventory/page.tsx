"use client";
import { useEffect, useState } from "react";
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
  quantity: number;
  expiryDate: string;
  alertStatus: AlertStatus;
}

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "zenken" },
  { key: "expired", label: "kirekire" },
  { key: "days7", label: "30nichi" },
  { key: "days30", label: "3kagetsu" },
];

function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>(
    (searchParams.get("filter") as Filter) ?? "all"
  );

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("filter", filter);
    const res = await fetch("/api/products?" + params);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <div>
      <PageHeader
        title="zaiko"
        right={
          
            href="/api/export"
            download
            className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
          >
            CSV
          </a>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="search"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1 rounded-full text-sm whitespace-nowrap",
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="mx-auto h-12 w-12 mb-2" />
            <p>not found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => {
              const config = ALERT_STATUS_CONFIG[product.alertStatus];
              return (
                <div
                  key={product.id}
                  onClick={() => router.push("/inventory/" + product.id)}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(product.expiryDate)} / {product.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={config.badge}>{config.label}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return <InventoryContent />;
}