import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Trash2,
    BookOpen,
    Download,
    X
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import type { Ledger, AccountGroup, AccountSubGroup } from '../types';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const Ledgers: React.FC = () => {
    const { state, dispatch } = useAccounting();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Ledger Form State
    const [newName, setNewName] = useState('');
    const [newGroup, setNewGroup] = useState<AccountGroup>('Assets');
    const [newSubGroup, setNewSubGroup] = useState<AccountSubGroup>('Current Assets');
    const [newOpening, setNewOpening] = useState(0);
    const [newPan, setNewPan] = useState('');

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const filteredLedgers = state.ledgers.filter(ledger =>
        ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ledger.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateLedger = (e: React.FormEvent) => {
        e.preventDefault();
        const newLedger: Ledger = {
            id: crypto.randomUUID(),
            name: newName,
            group: newGroup,
            subGroup: newSubGroup,
            openingBalance: newOpening,
            currentBalance: newOpening,
            panNumber: newPan
        };
        try {
            dispatch({ type: 'ADD_LEDGER', payload: newLedger });
            showToast(`Ledger "${newName}" created successfully.`, 'success');
            setIsModalOpen(false);
            setNewName('');
            setNewOpening(0);
        } catch (error) {
            showToast('Failed to create ledger. Please try again.', 'error');
        }
    };

    const deleteLedger = (id: string) => {
        try {
            dispatch({ type: 'DELETE_LEDGER', payload: id });
            showToast('Ledger deleted successfully.', 'success');
            setDeleteModal({ ...deleteModal, isOpen: false });
        } catch (error) {
            showToast('Failed to delete ledger.', 'error');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 className="heading-1">Ledgers & Accounts</h2>
                    <p className="text-label">Manage your chart of accounts and opening balances.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline"><Download size={18} /> Export</button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Create New Ledger
                    </button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search ledgers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                        />
                    </div>
                    <button className="btn btn-outline"><Filter size={18} /> Filter</button>
                </div>

                {filteredLedgers.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ledger Name</th>
                                    <th>Group</th>
                                    <th>Sub Group</th>
                                    <th>PAN/VAT</th>
                                    <th style={{ textAlign: 'right' }}>Current Balance</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLedgers.map(ledger => (
                                    <tr key={ledger.id}>
                                        <td style={{ fontWeight: '600' }}>{ledger.name}</td>
                                        <td>
                                            <span className={`badge ${ledger.group === 'Assets' ? 'badge-success' : ledger.group === 'Liabilities' ? 'badge-danger' : 'badge-warning'}`}>
                                                {ledger.group}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{ledger.subGroup}</td>
                                        <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{ledger.panNumber || '-'}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '800', color: ledger.currentBalance < 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {Math.abs(ledger.currentBalance).toLocaleString()} {ledger.currentBalance < 0 ? 'Cr' : 'Dr'}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: ledger.id, name: ledger.name })}
                                                disabled={ledger.isDefault}
                                                className="btn-icon"
                                                style={{
                                                    color: 'var(--danger)',
                                                    background: 'var(--bg-main)',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: ledger.isDefault ? 'not-allowed' : 'pointer',
                                                    opacity: ledger.isDefault ? 0.3 : 1
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title="No Ledgers Found"
                        description={searchTerm ? `No results found for "${searchTerm}". Try a different term.` : "Your accounts list is empty. Create your first ledger to start recording transactions."}
                        actionLabel={!searchTerm ? "Create My First Ledger" : undefined}
                        onAction={() => setIsModalOpen(true)}
                    />
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => deleteLedger(deleteModal.id)}
                itemName={deleteModal.name}
                itemType="Ledger"
            />

            {/* Create Ledger Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 className="heading-2">Create New Ledger</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateLedger} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="text-label">Ledger Name</label>
                                <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Siddhartha Bank" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-strong)' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Account Group</label>
                                    <select value={newGroup} onChange={(e) => setNewGroup(e.target.value as AccountGroup)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: 'white' }}>
                                        <option value="Assets">Assets</option>
                                        <option value="Liabilities">Liabilities</option>
                                        <option value="Equity">Equity</option>
                                        <option value="Income">Income</option>
                                        <option value="Expenses">Expenses</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Sub Group</label>
                                    <select value={newSubGroup} onChange={(e) => setNewSubGroup(e.target.value as AccountSubGroup)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: 'white' }}>
                                        <option value="Current Assets">Current Assets</option>
                                        <option value="Fixed Assets">Fixed Assets</option>
                                        <option value="Bank Accounts">Bank Accounts</option>
                                        <option value="Cash in Hand">Cash in Hand</option>
                                        <option value="Current Liabilities">Current Liabilities</option>
                                        <option value="Sundry Debtors">Sundry Debtors (Customers)</option>
                                        <option value="Sundry Creditors">Sundry Creditors (Vendors)</option>
                                        <option value="Direct Income">Direct Income</option>
                                        <option value="Direct Expenses">Direct Expenses</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">PAN / VAT Number</label>
                                    <input type="text" value={newPan} onChange={(e) => setNewPan(e.target.value)} placeholder="e.g. 601234567" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-strong)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Opening Balance (Rs.)</label>
                                    <input type="number" value={newOpening} onChange={(e) => setNewOpening(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-strong)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Ledger</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledgers;
