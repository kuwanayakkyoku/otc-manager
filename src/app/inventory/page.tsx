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
  { key: "all", label: "陷茨ｽｨ闔会ｽｶ" },
  { key: "expired", label: "隴帶ｻ・応陋ｻ繝ｻ・・ },
  { key: "days7", label: "30隴鯉ｽ･闔会ｽ･陷繝ｻ },
  { key: "days30", label: "3郢晢ｽｶ隴帑ｺ包ｽｻ・･陷繝ｻ },
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
        title="陜ｨ・ｨ陟趣ｽｫ闕ｳﾂ髫包ｽｧ"
        right={
          
            href="/api/export"
            download
            className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
          >
            CSV陷・ｽｺ陷峨・
          </a>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="陜繝ｻ蛻陷ｷ髦ｪ縲定ｮ諛・ｽｴ・｢"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
        </div>
        <div className
