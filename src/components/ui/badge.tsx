// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";
import type { AlertStatus } from "@/types";

const variants = {
  expired: "bg-red-100 text-red-700 border-red-200",
  days7: "bg-yellow-100 text-yellow-700 border-yellow-200",
  days30: "bg-blue-100 text-blue-700 border-blue-200",
  normal: "bg-green-100 text-green-700 border-green-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

const labels: Record<AlertStatus, string> = {
  expired: "期限切れ",
  days7: "7日以内",
  days30: "30日以内",
  normal: "正常",
};

interface BadgeProps {
  status?: AlertStatus;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ status, className, children }: BadgeProps) {
  const variant = status ? variants[status] : variants.default;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variant,
        className
      )}
    >
      {children ?? (status ? labels[status] : "")}
    </span>
  );
}

// src/components/ui/card.tsx は inline で定義
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-4 pt-4 pb-2", className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-4 pb-4", className)}>{children}</div>;
}
