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
  { key: "all", label: "蜈ｨ莉ｶ" },
  { key: "expired", label: "譛滄剞蛻・ｌ" },
  { key: "days7", label: "30譌･莉･蜀・ },
  { key: "days30", label: "3繝ｶ譛井ｻ･蜀・ },
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
    const res = await fetch(`/api/products?${params}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <div>
      <PageHeader
        title="蝨ｨ蠎ｫ荳隕ｧ"
        right={
          
            href="/api/export"
            download
            className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
          >
            CSV蜃ｺ蜉・
          </a>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="蝠・刀蜷阪〒讀懃ｴ｢"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
        </div>
        <div className
