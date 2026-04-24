// src/components/ui/toast.tsx
"use client";
import { cn } from "@/lib/utils";
import type { ToastType } from "@/hooks/use-toast";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const configs = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-800 text-white",
};

export function ToastItem({ message, type, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[240px] max-w-sm",
        configs[type]
      )}
      onClick={onDismiss}
    >
      <span>{message}</span>
      <button className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: { id: string; message: string; type: ToastType }[];
  dismiss: (id: string) => void;
}

export function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} type={t.type} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
