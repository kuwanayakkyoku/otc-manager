// src/types/index.ts
import { LotStatus, SaleSource, AlertType } from "@prisma/client";

export type { LotStatus, SaleSource, AlertType };

export interface ProductWithLots {
  id: string;
  name: string;
  spec: string;
  janCode: string;
  alertDays: number[];
  createdAt: Date;
  updatedAt: Date;
  lots: InventoryLotWithProduct[];
}

export interface InventoryLotWithProduct {
  id: string;
  productId: string;
  expiryDate: Date;
  quantity: number;
  initialQuantity: number;
  status: LotStatus;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    name: string;
    spec: string;
    janCode: string;
    alertDays: number[];
  };
}

export interface ProductSummary {
  id: string;
  name: string;
  spec: string;
  janCode: string;
  alertDays: number[];
  earliestExpiry: Date | null;
  totalQuantity: number;
  alertStatus: AlertStatus;
}

export type AlertStatus = "expired" | "days7" | "days30" | "normal";

export interface DashboardStats {
  expiredCount: number;
  days7Count: number;
  days30Count: number;
  alertLots: AlertLotItem[];
}

export interface AlertLotItem {
  lotId: string;
  productId: string;
  productName: string;
  spec: string;
  expiryDate: Date;
  quantity: number;
  daysLeft: number;
  alertStatus: AlertStatus;
}

export interface CsvPreviewRow {
  janCode: string;
  productName: string;
  quantity: number;
  transactionDate: string;
  transactionId: string;
  matched: boolean;
  productId?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
