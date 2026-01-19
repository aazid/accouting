import React, { useState, useMemo } from 'react';
import {
    FileText,
    Printer,
    Calendar,
    ChevronRight,
    ChevronDown,
    Download,
    FileSpreadsheet,
    ArrowRightLeft,
    CheckCircle2
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

type ReportType =
    | 'Trial Balance'
    | 'Balance Sheet'
    | 'Trading & P&L'
    | 'Cash Flow'
    | 'Ledger Confirmation';

const Reports: React.FC = () => {
    const { state } = useAccounting();
    const [activeReport, setActiveReport] = useState<ReportType>('Trial Balance');
    const [selectedLedgerId, setSelectedLedgerId] = useState<string>(state.ledgers[0]?.id || '');

    const reports: { name: ReportType; icon: React.ReactNode }[] = [
        { name: 'Trial Balance', icon: <FileText size={16} /> },
        { name: 'Balance Sheet', icon: <FileText size={16} /> },
        { name: 'Trading & P&L', icon: <FileText size={16} /> },
        { name: 'Cash Flow', icon: <ArrowRightLeft size={16} /> },
        { name: 'Ledger Confirmation', icon: <CheckCircle2 size={16} /> },
    ];

    const getTotals = useMemo(() => {
        let debitTotal = 0;
        let creditTotal = 0;

        state.ledgers.forEach(l => {
            const balance = l.currentBalance;
            const isDebitNature = l.group === 'Assets' || l.group === 'Expenses';

            if (isDebitNature) {
                if (balance > 0) debitTotal += balance;
                else creditTotal += Math.abs(balance);
            } else {
                if (balance > 0) creditTotal += balance;
                else debitTotal += Math.abs(balance);
            }
        });

        const calculateGroupTotal = (group: string) =>
            state.ledgers
                .filter(l => l.group === group)
                .reduce((acc, l) => acc + l.currentBalance, 0);

        const calculateSubGroupTotal = (subGroup: string) =>
            state.ledgers
                .filter(l => l.subGroup === subGroup)
                .reduce((acc, l) => acc + l.currentBalance, 0);

        return {
            debitTotal,
            creditTotal,
            assets: calculateGroupTotal('Assets'),
            liabilities: calculateGroupTotal('Liabilities'),
            equity: calculateGroupTotal('Equity'),
            income: calculateGroupTotal('Income'),
            expenses: calculateGroupTotal('Expenses'),
            cash: calculateSubGroupTotal('Cash in Hand'),
            bank: calculateSubGroupTotal('Bank Accounts'),
            directIncome: calculateSubGroupTotal('Direct Income'),
            indirectIncome: calculateSubGroupTotal('Indirect Income'),
            directExpenses: calculateSubGroupTotal('Direct Expenses'),
            indirectExpenses: calculateSubGroupTotal('Indirect Expenses'),
        };
    }, [state.ledgers]);

    const selectedLedger = state.ledgers.find(l => l.id === selectedLedgerId);
    const ledgerVouchers = state.vouchers.filter(v =>
        v.entries.some(e => e.ledgerId === selectedLedgerId)
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 className="heading-1">Financial Statements</h2>
                    <p className="text-label">Statutory reports for {state.currentCompany?.name}.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline"><Calendar size={18} /> Period: This FY</button>
                    <button className="btn btn-outline" onClick={() => window.print()}><Printer size={18} /></button>
                    <button className="btn btn-outline" style={{ color: '#059669', borderColor: '#059669' }}><FileSpreadsheet size={18} /> Excel</button>
                    <button className="btn btn-primary"><Download size={18} /> Export PDF</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
                <div className="card available-reports-card" style={{ height: 'fit-content', padding: '16px' }}>
                    <h3 className="heading-2" style={{ fontSize: '16px', marginBottom: '16px', padding: '0 8px' }}>Available Reports</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {reports.map((report) => (
                            <button
                                key={report.name}
                                className="btn"
                                onClick={() => setActiveReport(report.name)}
                                style={{
                                    justifyContent: 'space-between',
                                    background: activeReport === report.name ? 'var(--primary-light)' : 'transparent',
                                    color: activeReport === report.name ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeReport === report.name ? '700' : '500',
                                    padding: '12px 16px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{report.icon} {report.name}</div>
                                {activeReport === report.name && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 className="heading-2" style={{ fontSize: '28px' }}>{state.currentCompany?.name}</h2>
                        <p className="heading-2" style={{ fontSize: '20px', color: 'var(--primary)', marginTop: '8px' }}>{activeReport}</p>
                        <p className="text-label">1 Shrawan 2081 to 16 Magh 2081</p>
                    </div>

                    <div className="table-container">
                        {activeReport === 'Trial Balance' && (
                            <table>
                                <thead>
                                    <tr style={{ background: 'var(--bg-main)' }}>
                                        <th style={{ width: '50%' }}>Particulars</th>
                                        <th style={{ textAlign: 'right' }}>Debit (Rs.)</th>
                                        <th style={{ textAlign: 'right' }}>Credit (Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td colSpan={3}>Assets</td></tr>
                                    {state.ledgers.filter(l => l.group === 'Assets').map(l => (
                                        <tr key={l.id}>
                                            <td style={{ paddingLeft: '24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChevronDown size={14} /> {l.name}</div></td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance > 0 ? l.currentBalance.toLocaleString() : ''}</td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance < 0 ? Math.abs(l.currentBalance).toLocaleString() : ''}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td colSpan={3}>Liabilities & Equity</td></tr>
                                    {state.ledgers.filter(l => l.group === 'Liabilities' || l.group === 'Equity').map(l => (
                                        <tr key={l.id}>
                                            <td style={{ paddingLeft: '24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChevronDown size={14} /> {l.name}</div></td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance < 0 ? Math.abs(l.currentBalance).toLocaleString() : ''}</td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance > 0 ? l.currentBalance.toLocaleString() : ''}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td colSpan={3}>Expenses</td></tr>
                                    {state.ledgers.filter(l => l.group === 'Expenses').map(l => (
                                        <tr key={l.id}>
                                            <td style={{ paddingLeft: '24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChevronDown size={14} /> {l.name}</div></td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance > 0 ? l.currentBalance.toLocaleString() : ''}</td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance < 0 ? Math.abs(l.currentBalance).toLocaleString() : ''}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td colSpan={3}>Income</td></tr>
                                    {state.ledgers.filter(l => l.group === 'Income').map(l => (
                                        <tr key={l.id}>
                                            <td style={{ paddingLeft: '24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChevronDown size={14} /> {l.name}</div></td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance < 0 ? Math.abs(l.currentBalance).toLocaleString() : ''}</td>
                                            <td style={{ textAlign: 'right' }}>{l.currentBalance > 0 ? l.currentBalance.toLocaleString() : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: '800', background: 'var(--bg-main)' }}>
                                        <td>Total</td>
                                        <td style={{ textAlign: 'right' }}>{getTotals.debitTotal.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>{getTotals.creditTotal.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}

                        {activeReport === 'Balance Sheet' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div>
                                    <h4 style={{ background: '#f8fafc', padding: '12px', borderBottom: '2px solid var(--primary)', marginBottom: '20px', borderRadius: '8px 8px 0 0' }}>Liabilities & Equity</h4>
                                    <div style={{ padding: '0 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: '600' }}>Capital Account (Equity)</span>
                                            <span>Rs. {state.ledgers.filter(l => l.group === 'Equity').reduce((s, l) => s + Math.abs(l.currentBalance), 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: '600' }}>Loans (Liability)</span>
                                            <span>Rs. {state.ledgers.filter(l => l.group === 'Liabilities' && l.subGroup === 'Long Term Liabilities').reduce((s, l) => s + Math.abs(l.currentBalance), 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: '600' }}>Current Liabilities</span>
                                            <span>Rs. {state.ledgers.filter(l => l.group === 'Liabilities' && l.subGroup === 'Current Liabilities').reduce((s, l) => s + Math.abs(l.currentBalance), 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                            <span>Profit & Loss A/c (Net Profit)</span>
                                            <span>Rs. {((getTotals.directIncome - getTotals.directExpenses) + getTotals.indirectIncome - getTotals.indirectExpenses).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--text-main)', borderBottom: '4px double var(--text-main)', marginTop: '32px', padding: '12px 0', fontSize: '18px', fontWeight: '900' }}>
                                            <span>Total Liabilities</span>
                                            <span>Rs. {(getTotals.creditTotal).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ background: '#f8fafc', padding: '12px', borderBottom: '2px solid var(--success)', marginBottom: '20px', borderRadius: '8px 8px 0 0' }}>Assets</h4>
                                    <div style={{ padding: '0 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: '600' }}>Fixed Assets</span>
                                            <span>Rs. {state.ledgers.filter(l => l.subGroup === 'Fixed Assets').reduce((s, l) => s + l.currentBalance, 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: '600' }}>Current Assets</span>
                                            <span>Rs. {state.ledgers.filter(l => l.subGroup === 'Current Assets').reduce((s, l) => s + l.currentBalance, 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: '600' }}>Cash & Bank Balances</span>
                                            <span>Rs. {state.ledgers.filter(l => l.subGroup === 'Bank Accounts' || l.subGroup === 'Cash in Hand').reduce((s, l) => s + l.currentBalance, 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--text-main)', borderBottom: '4px double var(--text-main)', marginTop: '32px', padding: '12px 0', fontSize: '18px', fontWeight: '900', color: 'var(--success)' }}>
                                            <span>Total Assets</span>
                                            <span>Rs. {getTotals.debitTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeReport === 'Trading & P&L' && (
                            <div>
                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: 'var(--primary)' }}>Trading Account</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                        <span>Direct Income (Sales/Services)</span>
                                        <span style={{ fontWeight: '600' }}>Rs. {getTotals.directIncome.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                        <span>Less: Direct Expenses (Purchases/Wages)</span>
                                        <span style={{ fontWeight: '600' }}>Rs. ({getTotals.directExpenses.toLocaleString()})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '12px', fontWeight: 'bold', color: 'var(--success)', fontSize: '18px' }}>
                                        <span>Gross Profit</span>
                                        <span>Rs. {(getTotals.directIncome - getTotals.directExpenses).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-strong)' }}>
                                    <h4 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Profit & Loss Account</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span>Gross Profit b/f</span>
                                        <span>{(getTotals.directIncome - getTotals.directExpenses).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span>Other/Indirect Income</span>
                                        <span>{getTotals.indirectIncome.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span>Less: Indirect Expenses (Admin/Rent/Interest)</span>
                                        <span>({getTotals.indirectExpenses.toLocaleString()})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '3px double var(--primary)', paddingTop: '16px', marginTop: '16px', fontWeight: '800', fontSize: '24px', color: 'var(--primary)' }}>
                                        <span>Net Profit for the Period</span>
                                        <span>Rs. {((getTotals.directIncome - getTotals.directExpenses) + getTotals.indirectIncome - getTotals.indirectExpenses).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeReport === 'Cash Flow' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                    <h4 style={{ marginBottom: '16px' }}>Operating Activities</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Net Profit</span><span>{((getTotals.directIncome - getTotals.directExpenses) + getTotals.indirectIncome - getTotals.indirectExpenses).toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Adjustment for Assets/Liab</span><span>0.00</span></div>
                                </div>
                                <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                    <h4 style={{ marginBottom: '16px' }}>Net Cash Change</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px' }}><span>Closing Cash & Bank</span><span>Rs. {(getTotals.cash + getTotals.bank).toLocaleString()}</span></div>
                                </div>
                            </div>
                        )}

                        {activeReport === 'Ledger Confirmation' && (
                            <div>
                                <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <label className="text-label">Select Ledger:</label>
                                    <select value={selectedLedgerId} onChange={(e) => setSelectedLedgerId(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}>
                                        {state.ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ border: '2px solid var(--border)', padding: '30px', borderRadius: '16px' }}>
                                    <h4 style={{ textAlign: 'center', marginBottom: '20px' }}>Statement of Account</h4>
                                    <table>
                                        <thead><tr><th>Date</th><th>Voucher</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr></thead>
                                        <tbody>
                                            {ledgerVouchers.map(v => {
                                                const entry = v.entries.find(e => e.ledgerId === selectedLedgerId);
                                                return (<tr key={v.id}><td>{v.date}</td><td>{v.number}</td><td style={{ textAlign: 'right' }}>{entry?.debit || ''}</td><td style={{ textAlign: 'right' }}>{entry?.credit || ''}</td></tr>);
                                            })}
                                        </tbody>
                                        <tfoot><tr style={{ fontWeight: 'bold' }}><td colSpan={2}>Closing Balance</td><td colSpan={2} style={{ textAlign: 'right' }}>Rs. {selectedLedger?.currentBalance.toLocaleString()}</td></tr></tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
