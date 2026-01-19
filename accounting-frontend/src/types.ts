export type AccountGroup = 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';

export type AccountSubGroup =
    | 'Current Assets'
    | 'Fixed Assets'
    | 'Bank Accounts'
    | 'Cash in Hand'
    | 'Current Liabilities'
    | 'Sundry Debtors'
    | 'Sundry Creditors'
    | 'Direct Income'
    | 'Indirect Income'
    | 'Direct Expenses'
    | 'Indirect Expenses'
    | 'Long Term Liabilities';

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

export type VoucherType = 'Payment' | 'Receipt' | 'Sales' | 'Purchase' | 'Journal' | 'Contra';

export interface VoucherEntry {
    id: string;
    ledgerId: string;
    ledgerName: string;
    debit: number;
    credit: number;
}

export interface Voucher {
    id: string;
    number: string;
    date: string;
    type: VoucherType;
    entries: VoucherEntry[];
    narration: string;
    totalAmount: number;
    createdAt: string;
}

export interface StockItem {
    id: string;
    name: string;
    category?: string;
    unit: string;
    openingStock: number;
    currentStock: number;
    purchasePrice: number;
    salesPrice: number;
}

export interface Company {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    pan?: string;
    panVatNumber?: string;
    financialYearStart?: string;
    financialYearEnd?: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    role?: string;
}
