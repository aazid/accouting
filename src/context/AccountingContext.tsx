import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Ledger, Voucher, StockItem, Company, User } from '../types';

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
            // Update Ledger Balances
            const updatedLedgers = state.ledgers.map(ledger => {
                let balanceChange = 0;
                action.payload.entries.forEach(entry => {
                    if (entry.ledgerId === ledger.id) {
                        // For Assets/Expenses: Debit increases balance, Credit decreases
                        // For Liabilities/Equity/Income: Credit increases balance, Debit decreases
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
            // Reverse Ledger Balances
            const revertedLedgers = state.ledgers.map(ledger => {
                let balanceChange = 0;
                voucherToDelete.entries.forEach(entry => {
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

// Cloud sync is handled in useEffect debounced hooks above

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

    // Fetch from Cloud on Login
    useEffect(() => {
        const fetchCloudData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setSyncStatus('syncing');
                const { data, error } = await supabase
                    .from('user_storage')
                    .select('data')
                    .eq('user_id', session.user.id)
                    .single();

                if (data && !error) {
                    dispatch({ type: 'REPLACE_STATE', payload: data.data });
                    setSyncStatus('synced');
                } else {
                    setSyncStatus('synced');
                    // If no data in cloud, initialize user with a default company if needed
                    if (state.companies.length === 0) {
                        dispatch({ type: 'SET_USER', payload: { id: session.user.id, email: session.user.email!, role: 'Admin' } });
                    }
                }
            }
            setIsLoaded(true);
        };
        fetchCloudData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                fetchCloudData();
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('arthik_data');
                window.location.reload();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Debounced Cloud Sync
    useEffect(() => {
        if (!isLoaded) return;

        const sync = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setSyncStatus('local');
                return;
            }

            setSyncStatus('syncing');
            const { error } = await supabase
                .from('user_storage')
                .upsert({
                    user_id: session.user.id,
                    data: state,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error("Sync Error:", error);
                setSyncStatus('error');
            } else {
                setSyncStatus('synced');
            }
        };

        const timer = setTimeout(sync, 2000); // Wait 2s after last change
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAccounting = () => {
    const context = useContext(AccountingContext);
    if (context === undefined) {
        throw new Error('useAccounting must be used within an AccountingProvider');
    }
    return context;
};
