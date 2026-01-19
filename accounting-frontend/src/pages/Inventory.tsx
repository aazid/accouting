import React, { useState } from 'react';
import {
    Plus,
    Search,
    AlertTriangle,
    Trash2,
    X,
    Package,
    Tag,
    Layers,
    DollarSign
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import type { StockItem } from '../types';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const Inventory: React.FC = () => {
    const { state, dispatch } = useAccounting();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Item Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('Pcs');
    const [qty, setQty] = useState(0);
    const [purchase, setPurchase] = useState(0);
    const [sales, setSales] = useState(0);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const filteredItems = state.stockItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: StockItem = {
            id: crypto.randomUUID(),
            name,
            category,
            unit,
            openingStock: qty,
            currentStock: qty,
            purchasePrice: purchase,
            salesPrice: sales
        };
        try {
            dispatch({ type: 'ADD_STOCK', payload: newItem });
            showToast(`Item "${name}" added to inventory.`, 'success');
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            showToast('Failed to add item.', 'error');
        }
    };

    const resetForm = () => {
        setName('');
        setCategory('');
        setUnit('Pcs');
        setQty(0);
        setPurchase(0);
        setSales(0);
    };

    const handleDelete = (id: string) => {
        try {
            dispatch({ type: 'DELETE_STOCK', payload: id });
            showToast('Item removed from inventory.', 'success');
            setDeleteModal({ ...deleteModal, isOpen: false });
        } catch (error) {
            showToast('Failed to delete item.', 'error');
        }
    };

    const totalValue = state.stockItems.reduce((acc, item) => acc + (item.currentStock * item.purchasePrice), 0);
    const lowStockCount = state.stockItems.filter(i => i.currentStock < 10).length;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 className="heading-1">Inventory Management</h2>
                    <p className="text-label">Live stock tracking and valuation for your business.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Stock Item
                </button>
            </div>

            <div className="grid-stats">
                <div className="card shadow-sm">
                    <p className="text-label">Total Stock Value</p>
                    <p className="heading-2">Rs. {totalValue.toLocaleString()}</p>
                    <p style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>In-Stock Goods</p>
                </div>
                <div className="card shadow-sm">
                    <p className="text-label">Stock Varieties</p>
                    <p className="heading-2">{state.stockItems.length}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unique SKUs</p>
                </div>
                <div className="card shadow-sm">
                    <p className="text-label">Low Stock Alerts</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        <AlertTriangle size={18} />
                        <p className="heading-2">{lowStockCount}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Below 10 units</p>
                </div>
            </div>

            <div className="card shadow-sm" style={{ marginTop: '24px' }}>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search items or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                    />
                </div>

                {filteredItems.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th style={{ textAlign: 'right' }}>Quantity</th>
                                    <th>Unit</th>
                                    <th style={{ textAlign: 'right' }}>Purchase Price</th>
                                    <th style={{ textAlign: 'right' }}>Sales Price</th>
                                    <th style={{ textAlign: 'right' }}>Stock Value</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: '700' }}>{item.name}</td>
                                        <td><span className="badge" style={{ background: 'var(--bg-main)' }}>{item.category || 'General'}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ fontWeight: '800', color: item.currentStock < 10 ? 'var(--danger)' : 'var(--text-main)' }}>
                                                {item.currentStock}
                                            </span>
                                        </td>
                                        <td>{item.unit}</td>
                                        <td style={{ textAlign: 'right' }}>Rs. {item.purchasePrice.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>Rs. {item.salesPrice.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '800' }}>Rs. {(item.currentStock * item.purchasePrice).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.name })}
                                                className="btn-icon"
                                                style={{ color: 'var(--danger)', background: 'var(--bg-main)', padding: '8px', borderRadius: '8px' }}
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
                        icon={Package}
                        title="Your Warehouse is Empty"
                        description={searchTerm ? `No stock items found for "${searchTerm}".` : "Track your products and goods here. Setting up your inventory helps in automatic voucher calculations."}
                        actionLabel={!searchTerm ? "Add My First Item" : undefined}
                        onAction={() => setIsModalOpen(true)}
                    />
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => handleDelete(deleteModal.id)}
                itemName={deleteModal.name}
                itemType="Stock Item"
            />

            {/* Add Item Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 className="heading-2">Add Stock Item</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> Item Name</label>
                                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Printer Paper" style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={14} /> Category</label>
                                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Stationary" style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={14} /> Initial Quantity</label>
                                    <input required type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Unit</label>
                                    <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'white' }}>
                                        <option value="Pcs">Pcs</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Ltr">Ltr</option>
                                        <option value="Box">Box</option>
                                        <option value="Packet">Packet</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={14} /> Purchase Price</label>
                                    <input required type="number" value={purchase} onChange={(e) => setPurchase(Number(e.target.value))} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={14} /> Sales Price</label>
                                    <input required type="number" value={sales} onChange={(e) => setSales(Number(e.target.value))} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Stock Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
