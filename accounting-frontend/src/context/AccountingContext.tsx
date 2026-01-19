import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../api';
import authService from '../authService';
import type { Ledger, Voucher, StockItem, Company, User, VoucherEntry } from '../types';

interface State {
    companies: Company[];
    currentCompany: Company | null;
    ledgers: Ledger[];
    vouchers: Voucher[];
    stockItems: StockItem[];
    currentUser: User | null;
}

type Action =
    | { type: 'SET_COMPANY'; payload: Company }
    | { type: 'UPDATE_COMPANY'; payload: Company }
    | { type: 'ADD_LEDGER'; payload: Ledger }
    | { type: 'DELETE_LEDGER'; payload: string }
    | { type: 'ADD_VOUCHER'; payload: Voucher }
    | { type: 'DELETE_VOUCHER'; payload: string }
    | { type: 'ADD_STOCK'; payload: StockItem }
    | { type: 'DELETE_STOCK'; payload: string }
    | { type: 'UPDATE_STOCK'; payload: StockItem[] }
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'REPLACE_STATE'; payload: State };

const initialState: State = {
    companies: [],
    currentCompany: null,
    ledgers: [],
    vouchers: [],
    stockItems: [],
    currentUser: null,
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_COMPANY':
            return { ...state, currentCompany: action.payload };

        case 'UPDATE_COMPANY':
            return {
                ...state,
                currentCompany: action.payload,
                companies: state.companies.map(c => c.id === action.payload.id ? action.payload : c)
            };

        case 'ADD_LEDGER':
            return { ...state, ledgers: [...state.ledgers, action.payload] };

        case 'DELETE_LEDGER':
            return { ...state, ledgers: state.ledgers.filter(l => l.id !== action.payload) };

        case 'ADD_VOUCHER': {
            const newVouchers = [action.payload, ...state.vouchers];
            const updatedLedgers = state.ledgers.map(ledger => {
                let balanceChange = 0;
                action.payload.entries.forEach((entry: VoucherEntry) => {
                    if (entry.ledgerId === ledger.id) {
                        const isDebitNature = ledger.group === 'Assets' || ledger.group === 'Expenses';
                        if (isDebitNature) {
                            balanceChange += (Number(entry.debit) - Number(entry.credit));
                        } else {
                            balanceChange += (Number(entry.credit) - Number(entry.debit));
                        }
                    }
                });
                return { ...ledger, currentBalance: ledger.currentBalance + balanceChange };
            });
            return { ...state, vouchers: newVouchers, ledgers: updatedLedgers };
        }

        case 'DELETE_VOUCHER': {
            const voucherToDelete = state.vouchers.find(v => v.id === action.payload);
            if (!voucherToDelete) return state;

            const remainingVouchers = state.vouchers.filter(v => v.id !== action.payload);
            const revertedLedgers = state.ledgers.map(ledger => {
                let balanceChange = 0;
                voucherToDelete.entries.forEach((entry: VoucherEntry) => {
                    if (entry.ledgerId === ledger.id) {
                        const isDebitNature = ledger.group === 'Assets' || ledger.group === 'Expenses';
                        if (isDebitNature) {
                            balanceChange += (Number(entry.debit) - Number(entry.credit));
                        } else {
                            balanceChange += (Number(entry.credit) - Number(entry.debit));
                        }
                    }
                });
                return { ...ledger, currentBalance: ledger.currentBalance - balanceChange };
            });
            return { ...state, vouchers: remainingVouchers, ledgers: revertedLedgers };
        }

        case 'ADD_STOCK':
            return { ...state, stockItems: [...state.stockItems, action.payload] };

        case 'DELETE_STOCK':
            return { ...state, stockItems: state.stockItems.filter(item => item.id !== action.payload) };

        case 'UPDATE_STOCK':
            return { ...state, stockItems: action.payload };

        case 'SET_USER':
            return { ...state, currentUser: action.payload };

        case 'REPLACE_STATE':
            return { ...action.payload };

        default:
            return state;
    }
};

const AccountingContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
    syncStatus: 'synced' | 'syncing' | 'error' | 'local';
} | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'local'>('local');
    const [isLoaded, setIsLoaded] = useState(false);

    const getInitialState = (): State => {
        const saved = localStorage.getItem('arthik_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load saved data", e);
                return initialState;
            }
        }
        return initialState;
    };

    const [state, dispatch] = useReducer(reducer, getInitialState());

    // Fetch from Django Cloud on Initialization
    useEffect(() => {
        const fetchCloudData = async () => {
            if (authService.isAuthenticated()) {
                setSyncStatus('syncing');
                try {
                    const { data } = await api.get('user-storage/sync/');
                    if (data && data.data && Object.keys(data.data).length > 0) {
                        dispatch({ type: 'REPLACE_STATE', payload: data.data });
                    }
                    setSyncStatus('synced');
                } catch (error) {
                    console.error("Failed to fetch cloud data", error);
                    setSyncStatus('error');
                }
            }
            setIsLoaded(true);
        };
        fetchCloudData();
    }, []);

    // Debounced Cloud Sync with Django
    useEffect(() => {
        if (!isLoaded) return;

        const sync = async () => {
            if (!authService.isAuthenticated()) {
                setSyncStatus('local');
                return;
            }

            setSyncStatus('syncing');
            try {
                await api.post('user-storage/sync/', { data: state });
                setSyncStatus('synced');
            } catch (error) {
                console.error("Sync Error:", error);
                setSyncStatus('error');
            }
        };

        const timer = setTimeout(sync, 2000); 
        localStorage.setItem('arthik_data', JSON.stringify(state));

        return () => clearTimeout(timer);
    }, [state, isLoaded]);

    useEffect(() => {
        if (state.companies.length > 0 && !state.currentCompany) {
            dispatch({ type: 'SET_COMPANY', payload: state.companies[0] });
        }
    }, [state.companies, state.currentCompany, dispatch]);

    return (
        <AccountingContext.Provider value={{ state, dispatch, syncStatus }}>
            {children}
        </AccountingContext.Provider>
    );
};

export const useAccounting = () => {
    const context = useContext(AccountingContext);
    if (context === undefined) {
        throw new Error('useAccounting must be used within an AccountingProvider');
    }
    return context;
};
