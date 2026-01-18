export type AccountGroup =
  | 'Assets'
  | 'Liabilities'
  | 'Equity'
  | 'Income'
  | 'Expenses';

export type AccountSubGroup =
  | 'Current Assets'
  | 'Fixed Assets'
  | 'Current Liabilities'
  | 'Long Term Liabilities'
  | 'Direct Income'
  | 'Indirect Income'
  | 'Direct Expenses'
  | 'Indirect Expenses'
  | 'Bank Accounts'
  | 'Cash in Hand'
  | 'Sundry Debtors'
  | 'Sundry Creditors'
  | 'Sales Accounts'
  | 'Purchase Accounts';

export interface Ledger {
  id: string;
  name: string;
  group: AccountGroup;
  subGroup: AccountSubGroup;
  openingBalance: number;
  currentBalance: number;
  panNumber?: string;
  isDefault?: boolean;
}

export type VoucherType =
  | 'Payment'
  | 'Receipt'
  | 'Sales'
  | 'Purchase'
  | 'Journal'
  | 'Contra';

export interface VoucherEntry {
  id: string;
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface Voucher {
  id: string;
  number: string;
  date: string; // ISO string
  type: VoucherType;
  entries: VoucherEntry[];
  narration: string;
  totalAmount: number;
  createdAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  unit: string; // Pcs, Kg, Mtr, etc.
  sku?: string;
  openingStock: number;
  currentStock: number;
  purchasePrice: number;
  salesPrice: number;
  category?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  panVatNumber: string;
  financialYearStart: string;
  financialYearEnd: string;
  currency: string;
}

export type UserRole = 'Admin' | 'Accountant' | 'Staff';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  cashBalance: number;
  bankBalance: number;
  netProfit: number;
}
