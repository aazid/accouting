import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Trash2,
    ArrowLeftRight,
    HandCoins,
    Receipt as ReceiptIcon,
    ShoppingCart,
    CreditCard,
    FileText,
    CheckCircle2,
    AlertCircle,
    Save,
    Calendar as CalendarIcon,
    Download,
    Search
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import type { VoucherType, VoucherEntry, Voucher } from '../types';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const Vouchers: React.FC = () => {
    const { state, dispatch } = useAccounting();
    const { showToast } = useToast();
    const [activeType, setActiveType] = useState<VoucherType>('Payment');
    const [isCreating, setIsCreating] = useState(false);

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const firstFieldRef = useRef<HTMLSelectElement>(null);

    // New Voucher Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [invRef, setInvRef] = useState('');
    const [entries, setEntries] = useState<Partial<VoucherEntry>[]>([
        { id: '1', ledgerId: '', ledgerName: '', debit: 0, credit: 0 },
        { id: '2', ledgerId: '', ledgerName: '', debit: 0, credit: 0 }
    ]);

    const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;
    const allLedgersSelected = entries.every(e => e.ledgerId !== '');

    useEffect(() => {
        if (isCreating) {
            firstFieldRef.current?.focus();
        }
    }, [isCreating]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 's' && isCreating && isBalanced && allLedgersSelected) {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCreating, isBalanced, allLedgersSelected]);

    const voucherTypes: { label: string; value: VoucherType; icon: React.ReactNode; color: string }[] = [
        { label: 'Payment', value: 'Payment', icon: <CreditCard size={18} />, color: '#ef4444' },
        { label: 'Receipt', value: 'Receipt', icon: <HandCoins size={18} />, color: '#10b981' },
        { label: 'Sales', value: 'Sales', icon: <ReceiptIcon size={18} />, color: '#3b82f6' },
        { label: 'Purchase', value: 'Purchase', icon: <ShoppingCart size={18} />, color: '#f59e0b' },
        { label: 'Journal', value: 'Journal', icon: <FileText size={18} />, color: '#8b5cf6' },
        { label: 'Contra', value: 'Contra', icon: <ArrowLeftRight size={18} />, color: '#64748b' },
    ];

    const addEntry = () => {
        setEntries([...entries, { id: crypto.randomUUID(), ledgerId: '', ledgerName: '', debit: 0, credit: 0 }]);
    };

    const removeEntry = (id: string) => {
        if (entries.length > 2) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const updateEntry = (id: string, field: keyof VoucherEntry, value: string | number) => {
        setEntries(entries.map(e => {
            if (e.id === id) {
                const updated = { ...e, [field]: value } as Partial<VoucherEntry>;
                if (field === 'ledgerId') {
                    const ledger = state.ledgers.find(l => l.id === value as string);
                    updated.ledgerName = ledger?.name || '';
                }
                return updated;
            }
            return e;
        }));
    };

    const handleSave = () => {
        if (!isBalanced || !allLedgersSelected) return;

        const newVoucher: Voucher = {
            id: crypto.randomUUID(),
            number: `${activeType.substring(0, 1)}V-${date.replace(/-/g, '').substring(2)}-${state.vouchers.length + 1}`,
            date,
            type: activeType,
            entries: entries as VoucherEntry[],
            narration: invRef ? `[Ref: ${invRef}] ${narration}` : narration,
            totalAmount: totalDebit,
            createdAt: new Date().toISOString()
        };

        try {
            dispatch({ type: 'ADD_VOUCHER', payload: newVoucher });
            showToast(`${activeType} Voucher posted successfully.`, 'success');
            setIsCreating(false);
            resetForm();
        } catch (error) {
            showToast('Failed to post voucher.', 'error');
        }
    };

    const resetForm = () => {
        setEntries([{ id: '1', ledgerId: '', ledgerName: '', debit: 0, credit: 0 }, { id: '2', ledgerId: '', ledgerName: '', debit: 0, credit: 0 }]);
        setNarration('');
        setInvRef('');
    };

    const handleDeleteVoucher = (id: string) => {
        try {
            dispatch({ type: 'DELETE_VOUCHER', payload: id });
            showToast('Voucher entry deleted.', 'success');
            setDeleteModal({ ...deleteModal, isOpen: false });
        } catch (error) {
            showToast('Failed to delete voucher.', 'error');
        }
    };

    const filteredVouchers = state.vouchers
        .filter(v => v.type === activeType)
        .filter(v =>
            v.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.narration.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(v => filterDate ? v.date === filterDate : true);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 className="heading-1">Voucher Entry</h2>
                    <p className="text-label">Professional double-entry system for precise accounting.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        <Plus size={18} /> New Voucher
                    </button>
                )}
            </div>

            {!isCreating && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    {voucherTypes.map((v) => (
                        <button
                            key={v.value}
                            onClick={() => setActiveType(v.value)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                border: `1px solid ${activeType === v.value ? v.color : 'var(--border)'}`,
                                background: activeType === v.value ? `${v.color}10` : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                fontWeight: activeType === v.value ? '700' : '500',
                                color: activeType === v.value ? v.color : 'var(--text-muted)'
                            }}
                        >
                            {v.icon} {v.label}
                        </button>
                    ))}
                </div>
            )}

            {isCreating ? (
                <div className="card shadow-lg glass-morphism" style={{ borderTop: `4px solid ${voucherTypes.find(t => t.value === activeType)?.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: `${voucherTypes.find(t => t.value === activeType)?.color}20`, color: voucherTypes.find(t => t.value === activeType)?.color }}>
                                {voucherTypes.find(t => t.value === activeType)?.icon}
                            </div>
                            <h3 className="heading-2">New {activeType} Entry</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                placeholder="Invoice/Ref No. (Optional)"
                                value={invRef}
                                onChange={e => setInvRef(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '13px', width: '200px' }}
                            />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontWeight: '600' }}
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '50%' }}>Particulars (Ledger)</th>
                                    <th style={{ textAlign: 'right' }}>Debit (Rs.)</th>
                                    <th style={{ textAlign: 'right' }}>Credit (Rs.)</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <select
                                                    ref={index === 0 ? firstFieldRef : null}
                                                    value={entry.ledgerId}
                                                    onChange={(e) => updateEntry(entry.id!, 'ledgerId', e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const row = e.currentTarget.closest('tr');
                                                            row?.querySelector<HTMLInputElement>('input[name="debit"]')?.focus();
                                                        }
                                                    }}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
                                                >
                                                    <option value="">Select Ledger...</option>
                                                    {state.ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                                {entry.ledgerId && (
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                                                        Curr. Bal: Rs. {state.ledgers.find(l => l.id === entry.ledgerId)?.currentBalance.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="debit"
                                                value={entry.debit || ''}
                                                onChange={(e) => updateEntry(entry.id!, 'debit', Number(e.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const row = e.currentTarget.closest('tr');
                                                        row?.querySelector<HTMLInputElement>('input[name="credit"]')?.focus();
                                                    }
                                                }}
                                                placeholder="0.00"
                                                style={{ width: '100%', padding: '10px', textAlign: 'right', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="credit"
                                                value={entry.credit || ''}
                                                onChange={(e) => updateEntry(entry.id!, 'credit', Number(e.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        if (index === entries.length - 1) {
                                                            addEntry();
                                                        } else {
                                                            const nextRow = e.currentTarget.closest('tr')?.nextElementSibling;
                                                            nextRow?.querySelector<HTMLSelectElement>('select')?.focus();
                                                        }
                                                    }
                                                }}
                                                placeholder="0.00"
                                                style={{ width: '100%', padding: '10px', textAlign: 'right', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => removeEntry(entry.id!)} style={{ color: 'var(--danger)', background: 'none' }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className="btn btn-outline" onClick={addEntry} style={{ marginTop: '16px', width: '100%', borderStyle: 'dotted' }}>+ Add Row (Enter in Credit to add next)</button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', marginTop: '32px' }}>
                        <div>
                            <label className="text-label" style={{ marginBottom: '8px', display: 'block' }}>Narration / Remarks</label>
                            <textarea
                                value={narration}
                                onChange={(e) => setNarration(e.target.value)}
                                placeholder="Enter transaction details (e.g. Paid by Cheque #1234)..."
                                style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                            ></textarea>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Tip: Use <b>Alt + S</b> to quickly save and post.</p>
                        </div>
                        <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-label">Total Debit</span>
                                <span style={{ fontWeight: '700' }}>Rs. {totalDebit.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-label">Total Credit</span>
                                <span style={{ fontWeight: '700' }}>Rs. {totalCredit.toLocaleString()}</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-label">Status</span>
                                {isBalanced ? (
                                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                        <CheckCircle2 size={14} /> BALANCED
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                        <AlertCircle size={14} /> UNBALANCED
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                        <button className="btn btn-outline" onClick={() => setIsCreating(false)}>Discard</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={!isBalanced || !allLedgersSelected}>
                            <Save size={18} /> Save & Post Voucher
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card shadow-sm">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <h3 className="heading-2">Recent {activeType} Vouchers</h3>
                        <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search by number or narration..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '13px' }}
                                />
                            </div>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '13px' }}
                            />
                        </div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Voucher No.</th>
                                    <th>Summary</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVouchers.length > 0 ? (
                                    filteredVouchers.map(v => (
                                        <tr key={v.id}>
                                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarIcon size={14} color="var(--text-muted)" /> {v.date}</div></td>
                                            <td style={{ fontWeight: '600' }}>{v.number}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{v.narration || 'No description provided.'}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '700' }}>Rs. {v.totalAmount.toLocaleString()}</td>
                                            <td><span className="badge badge-success">Verified</span></td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button className="btn-icon" title="Print/Download" style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '8px', borderRadius: '8px' }}>
                                                        <Download size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, id: v.id, name: v.number })}
                                                        className="btn-icon"
                                                        style={{ color: 'var(--danger)', background: 'var(--bg-main)', padding: '8px', borderRadius: '8px' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '0' }}>
                                            <EmptyState
                                                icon={FileText}
                                                title={`No ${activeType} Vouchers`}
                                                description={searchTerm ? `No vouchers match "${searchTerm}" for the selected period.` : `You haven't recorded any ${activeType} transactions yet. Click the button below to start building your financial records.`}
                                                actionLabel={!searchTerm ? `Create ${activeType} Voucher` : undefined}
                                                onAction={() => setIsCreating(true)}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => handleDeleteVoucher(deleteModal.id)}
                itemName={deleteModal.name}
                itemType="Voucher Entry"
            />
        </div>
    );
};

export default Vouchers;
