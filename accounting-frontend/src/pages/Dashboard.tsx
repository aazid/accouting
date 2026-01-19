import React, { useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowRight,
    FileText,
    CheckCircle2,
    Plus,
    ShoppingCart,
    Receipt as ReceiptIcon,
    AlertCircle,
    Package
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const Dashboard: React.FC = () => {
    const { state, dispatch } = useAccounting();
    const navigate = useNavigate();

    const [compName, setCompName] = React.useState('');

    const handleInitialSetup = (e: React.FormEvent) => {
        e.preventDefault();
        const newCompany = {
            id: crypto.randomUUID(),
            name: compName,
            address: 'Kathmandu, Nepal',
            panVatNumber: '601234567',
            financialYearStart: '2081-04-01',
            financialYearEnd: '2082-03-31',
            currency: 'NPR'
        };
        dispatch({ type: 'UPDATE_COMPANY', payload: newCompany });
    };

    const loadDemoData = () => {
        const demoCompany = {
            id: 'demo-1',
            name: 'Pioneer Trading House',
            address: 'New Road, Kathmandu',
            panVatNumber: '602455891',
            financialYearStart: '2081-04-01',
            financialYearEnd: '2082-03-31',
            currency: 'NPR'
        };

        const demoLedgers = [
            { id: 'l1', name: 'Nabil Bank A/c', group: 'Assets', subGroup: 'Bank Accounts', openingBalance: 500000, currentBalance: 500000 },
            { id: 'l2', name: 'Cash in Hand', group: 'Assets', subGroup: 'Cash in Hand', openingBalance: 50000, currentBalance: 50000 },
            { id: 'l3', name: 'Sales Revenue', group: 'Income', subGroup: 'Direct Income', openingBalance: 0, currentBalance: 0 },
            { id: 'l4', name: 'Office Rent', group: 'Expenses', subGroup: 'Indirect Expenses', openingBalance: 0, currentBalance: 0 },
            { id: 'l5', name: 'Capital Account', group: 'Equity', subGroup: 'Equity', openingBalance: 550000, currentBalance: 550000 },
            { id: 'l6', name: 'Sunrise Traders', group: 'Liabilities', subGroup: 'Sundry Creditors', openingBalance: 0, currentBalance: 0 },
            { id: 'l7', name: 'Tech Solutions Pvt Ltd', group: 'Assets', subGroup: 'Sundry Debtors', openingBalance: 0, currentBalance: 0 },
        ];

        const demoStock = [
            { id: 's1', name: 'Laptop Pro 14', category: 'Electronics', unit: 'Pcs', currentStock: 15, purchasePrice: 120000, salesPrice: 155000 },
            { id: 's2', name: 'Wireless Mouse', category: 'Accessories', unit: 'Pcs', currentStock: 45, purchasePrice: 1200, salesPrice: 2500 },
            { id: 's3', name: 'External SSD 1TB', category: 'Storage', unit: 'Pcs', currentStock: 8, purchasePrice: 8500, salesPrice: 12500 },
        ];

        dispatch({ type: 'UPDATE_COMPANY', payload: demoCompany });
        demoLedgers.forEach(l => dispatch({ type: 'ADD_LEDGER', payload: l as any }));
        demoStock.forEach(s => dispatch({ type: 'ADD_STOCK', payload: s as any }));

        // Add a demo voucher
        const demoVoucher = {
            id: 'v1',
            date: '2081-10-15',
            number: 'PV-001',
            type: 'Payment',
            entries: [
                { id: 'e1', ledgerId: 'l1', debit: 0, credit: 25000 },
                { id: 'e2', ledgerId: 'l4', debit: 25000, credit: 0 },
            ],
            narration: 'Office rent paid for the month of Ashwin via Nabil Bank.',
            totalAmount: 25000,
            createdAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_VOUCHER', payload: demoVoucher as any });
    };

    const stats = useMemo(() => {
        const income = state.ledgers.filter(l => l.group === 'Income').reduce((acc, l) => acc + l.currentBalance, 0);
        const expenses = state.ledgers.filter(l => l.group === 'Expenses').reduce((acc, l) => acc + l.currentBalance, 0);
        const cash = state.ledgers.find(l => l.subGroup === 'Cash in Hand')?.currentBalance || 0;
        const bank = state.ledgers.filter(l => l.subGroup === 'Bank Accounts').reduce((acc, l) => acc + l.currentBalance, 0);

        // Realistic metrics
        const receivables = state.ledgers.filter(l => l.subGroup === 'Sundry Debtors').reduce((acc, l) => acc + l.currentBalance, 0);
        const payables = state.ledgers.filter(l => l.subGroup === 'Sundry Creditors').reduce((acc, l) => acc + Math.abs(l.currentBalance), 0);

        const netProfit = income - expenses;
        const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;

        return { income, expenses, cash, bank, receivables, payables, netProfit, profitMargin };
    }, [state.ledgers]);

    const chartData = useMemo(() => {
        const stats = [
            { name: 'Shrawan', sales: 4000, expenses: 2400 },
            { name: 'Bhadra', sales: 3000, expenses: 1398 },
            { name: 'Ashwin', sales: 2000, expenses: 9800 },
            { name: 'Kartik', sales: 2780, expenses: 3908 },
            { name: 'Mangsir', sales: 1890, expenses: 4800 },
            { name: 'Poush', sales: 2390, expenses: 3800 },
        ];
        return stats;
    }, []);


    if (!state.currentCompany) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card shadow-lg glass-morphism animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '48px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <Plus size={40} />
                    </div>
                    <h2 className="heading-1" style={{ marginBottom: '12px' }}>Welcome to ArArthik</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Let's start by setting up your primary organization workspace. This will securely store your accounts.</p>

                    <form onSubmit={handleInitialSetup} style={{ textAlign: 'left' }}>
                        <label className="text-label" style={{ marginBottom: '8px', display: 'block' }}>Company / Firm Name</label>
                        <input
                            required
                            type="text"
                            value={compName}
                            onChange={e => setCompName(e.target.value)}
                            placeholder="e.g. Acme CA Firm"
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-strong)', marginBottom: '24px', fontSize: '15px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '50px', marginBottom: '16px' }}>
                            Setup & Start Accounting
                        </button>

                        <button
                            type="button"
                            onClick={loadDemoData}
                            className="btn btn-outline"
                            style={{ width: '100%', justifyContent: 'center', height: '50px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                            Explore with Demo Data
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h2 className="heading-1">Business Overview</h2>
                <p className="text-label">Welcome back, here's what's happening with {state.currentCompany?.name} today.</p>
            </div>

            <div className="grid-stats">
                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '4px solid #166534' }}>
                    <div style={{ padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '12px' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-label">Receivables</p>
                        <p className="heading-2">Rs. {stats.receivables.toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: '#166534' }}>Incoming funds</p>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '4px solid #991b1b' }}>
                    <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-label">Payables</p>
                        <p className="heading-2">Rs. {stats.payables.toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: '#991b1b' }}>Outstanding bills</p>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '4px solid #3730a3' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', color: '#3730a3', borderRadius: '12px' }}>
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-label">Cash & Bank</p>
                        <p className="heading-2">Rs. {(stats.cash + stats.bank).toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net liquidity</p>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '4px solid #0f172a', background: 'var(--bg-main)' }}>
                    <div style={{ padding: '12px', background: '#e2e8f0', color: '#0f172a', borderRadius: '12px' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-label">Net Profit Margin</p>
                        <p className="heading-2">{stats.profitMargin.toFixed(1)}%</p>
                        <p style={{ fontSize: '11px', color: stats.profitMargin > 20 ? 'var(--success)' : 'var(--text-muted)' }}>
                            {stats.profitMargin > 20 ? 'Healthy Margin' : 'Sector Average'}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px', marginTop: '24px' }}>
                <div className="card shadow-sm">
                    <h3 className="heading-2" style={{ marginBottom: '20px' }}>Sales vs Expenses Trend</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card shadow-sm glass-morphism">
                    <h3 className="heading-2" style={{ marginBottom: '20px' }}>Quick Daily Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Link to="/vouchers" className="btn btn-outline" style={{ flexDirection: 'column', padding: '20px', height: 'auto', gap: '12px' }}>
                            <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)' }}><ReceiptIcon size={20} /></div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>Bill Entry</span>
                        </Link>
                        <Link to="/inventory" className="btn btn-outline" style={{ flexDirection: 'column', padding: '20px', height: 'auto', gap: '12px' }}>
                            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '10px', color: '#10b981' }}><ShoppingCart size={20} /></div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>Stock Take</span>
                        </Link>
                        <Link to="/ledgers" className="btn btn-outline" style={{ flexDirection: 'column', padding: '20px', height: 'auto', gap: '12px' }}>
                            <div style={{ padding: '10px', background: '#fff7ed', borderRadius: '10px', color: '#f59e0b' }}><Plus size={20} /></div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>Add Client</span>
                        </Link>
                        <Link to="/reports" className="btn btn-outline" style={{ flexDirection: 'column', padding: '20px', height: 'auto', gap: '12px' }}>
                            <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: '10px', color: '#8b5cf6' }}><FileText size={20} /></div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>P&L View</span>
                        </Link>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>TODAY'S TASK</span>
                            <span className="badge badge-warning">2 Pending</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: '2px' }} />
                            <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>Bank reconciliation for Nabil Bank (Poush 30)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="card shadow-sm">
                    <h3 className="heading-3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={18} color="var(--success)" /> Top Receivables (Clients)
                    </h3>
                    <div className="table-container" style={{ border: 'none' }}>
                        <table style={{ background: 'transparent' }}>
                            <tbody>
                                {state.ledgers.filter(l => l.subGroup === 'Sundry Debtors' && l.currentBalance > 0)
                                    .sort((a, b) => b.currentBalance - a.currentBalance)
                                    .slice(0, 3).map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '12px 0', fontSize: '13px' }}>{l.name}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '13px' }}>Rs. {l.currentBalance.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                {state.ledgers.filter(l => l.subGroup === 'Sundry Debtors').length === 0 && (
                                    <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '20px' }}>No client balances yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card shadow-sm" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 className="heading-3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={18} color="#f59e0b" /> Critical Alerts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {state.stockItems.filter(i => i.currentStock < 10).length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff7ed', borderRadius: '10px' }}>
                                <Package size={16} color="#f59e0b" />
                                <span style={{ fontSize: '12px', fontWeight: '600' }}>{state.stockItems.filter(i => i.currentStock < 10).length} Items running low in stock.</span>
                            </div>
                        )}
                        {state.vouchers.length === 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f0f9ff', borderRadius: '10px' }}>
                                <FileText size={16} color="var(--primary)" />
                                <span style={{ fontSize: '12px', fontWeight: '600' }}>No vouchers recorded this financial year.</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
                            <CheckCircle2 size={16} color="var(--success)" />
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>All data is safely synced to cloud.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="heading-2">Recent Voucher Activity</h3>
                    <Link to="/vouchers" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View All <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Voucher No.</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.vouchers.length > 0 ? (
                                state.vouchers.slice(0, 5).map(v => (
                                    <tr key={v.id}>
                                        <td>{v.date}</td>
                                        <td style={{ fontWeight: '700' }}>{v.number}</td>
                                        <td><span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{v.type}</span></td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{v.narration}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '800' }}>Rs. {v.totalAmount.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '0' }}>
                                        <EmptyState
                                            icon={FileText}
                                            title="No Recent Activity"
                                            description="Your transaction log is empty. Once you post your first voucher, it will appear here for quick reference."
                                            actionLabel="Record Daybook Entry"
                                            onAction={() => navigate('/vouchers')}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
