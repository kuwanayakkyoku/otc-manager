// src/components/layout/bottom-nav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ScanLine, Package, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: LayoutDashboard },
  { href: "/inventory", label: "在庫", icon: Package },
  { href: "/scan", label: "スキャン", icon: ScanLine, center: true },
  { href: "/import", label: "取込", icon: Upload },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, center }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          if (center) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center -mt-5">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors",
                    active ? "bg-blue-700" : "bg-blue-600 active:bg-blue-700"
                  )}
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <span className="text-[10px] mt-1 font-medium text-blue-600">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors",
                active ? "text-blue-600" : "text-gray-400 active:text-gray-600"
              )}
            >
              <Icon
                className={cn("w-6 h-6", active ? "text-blue-600" : "text-gray-400")}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn("text-[10px] font-medium", active ? "text-blue-600" : "text-gray-400")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
