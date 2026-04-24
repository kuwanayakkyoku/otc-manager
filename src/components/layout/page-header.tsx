// src/components/layout/page-header.tsx
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, right, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-safe",
        className
      )}
    >
      <div className="flex items-center justify-between h-14">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  );
}
