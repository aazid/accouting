import React, { useState } from 'react';
import {
    Building2,
    Shield,
    CreditCard,
    Bell,
    Database,
    Globe,
    FileText,
    Save
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { useToast } from '../context/ToastContext';
import type { Company } from '../types';

const Settings: React.FC = () => {
    const { state, dispatch } = useAccounting();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'profile' | 'roles'>('profile');
    const company = state.currentCompany;

    // Form State
    const [name, setName] = useState(company?.name || '');
    const [pan, setPan] = useState(company?.panVatNumber || '');
    const [address, setAddress] = useState(company?.address || '');
    const [fyStart, setFyStart] = useState(company?.financialYearStart || '');
    const [fyEnd, setFyEnd] = useState(company?.financialYearEnd || '');

    const handleSave = () => {
        if (!company) return;
        const updatedCompany: Company = {
            ...company,
            name,
            panVatNumber: pan,
            address,
            financialYearStart: fyStart,
            financialYearEnd: fyEnd
        };
        try {
            dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
            showToast('Company profile updated successfully.', 'success');
        } catch (error) {
            showToast('Failed to update company profile.', 'error');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h2 className="heading-1">Settings</h2>
                <p className="text-label">Manage your company profile, preferences, and system configuration.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
                {/* Settings Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button onClick={() => setActiveTab('profile')} className="btn" style={{ justifyContent: 'flex-start', background: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600' }}>
                        <Building2 size={18} /> Company Profile
                    </button>
                    <button className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-muted)' }}>
                        <FileText size={18} /> Tax & Compliance
                    </button>
                    <button className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-muted)' }}>
                        <CreditCard size={18} /> Billing & Subscription
                    </button>
                    <button onClick={() => setActiveTab('roles')} className="btn" style={{ justifyContent: 'flex-start', background: activeTab === 'roles' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'roles' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600' }}>
                        <Shield size={18} /> Security & Roles
                    </button>
                    <button className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-muted)' }}>
                        <Bell size={18} /> Notifications
                    </button>
                    <button className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-muted)' }}>
                        <Database size={18} /> Backup & Restore
                    </button>

                    <div style={{ marginTop: '20px', padding: '16px', background: '#fefce8', borderRadius: '12px', border: '1px solid #fde047' }}>
                        <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#854d0e', marginBottom: '4px' }}>PRO TIP: CLOUD ACCESS</p>
                        <p style={{ fontSize: '10px', color: '#854d0e' }}>Multi-location access is ready! Just enter your Supabase keys in the .env file to activate cloud sync.</p>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="card shadow-md">
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <h3 className="heading-2" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>Company Profile</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Company Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">PAN/VAT Number</label>
                                    <input
                                        type="text"
                                        value={pan}
                                        onChange={(e) => setPan(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                                    <label className="text-label">Business Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Currency</label>
                                    <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px', background: 'white' }}>
                                        <option>NPR - Nepalese Rupee</option>
                                        <option>USD - US Dollar</option>
                                        <option>INR - Indian Rupee</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">System Language</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px', background: 'var(--bg-main)' }}>
                                        <Globe size={16} /> English (US)
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Financial Year Start</label>
                                    <input
                                        type="date"
                                        value={fyStart}
                                        onChange={(e) => setFyStart(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="text-label">Financial Year End</label>
                                    <input
                                        type="date"
                                        value={fyEnd}
                                        onChange={(e) => setFyEnd(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="animate-fade-in">
                            <h3 className="heading-2" style={{ marginBottom: '12px' }}>Security & User Roles</h3>
                            <p className="text-label" style={{ marginBottom: '24px' }}>Control who can access your business data from different locations.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Shield size={20} color="var(--primary)" /></div>
                                        <div>
                                            <p style={{ fontWeight: '800' }}>Admin (Master Access)</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>You have full permission over all modules.</p>
                                        </div>
                                    </div>
                                    <span className="badge badge-success" style={{ padding: '6px 12px' }}>Active</span>
                                </div>

                                <button className="btn btn-outline" style={{ borderStyle: 'dashed', justifyContent: 'center', height: '80px', borderRadius: '16px', fontSize: '15px' }}>
                                    + Add Accountant / Sub-Admin
                                </button>

                                <div style={{ marginTop: '32px', padding: '24px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--primary-light)' }}>
                                    <h4 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Quick Role Switch (For Testing)</h4>
                                    <p className="text-label" style={{ marginBottom: '20px' }}>Swap your current session role to verify permission locks across the app.</p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            className={`btn ${state.currentUser?.role === 'Admin' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => {
                                                dispatch({ type: 'SET_USER', payload: { id: 'u1', email: 'admin@arthik.com', role: 'Admin' } });
                                                showToast('Acting as Admin', 'info');
                                            }}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            className={`btn ${state.currentUser?.role === 'Accountant' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => {
                                                dispatch({ type: 'SET_USER', payload: { id: 'u2', email: 'acc@arthik.com', role: 'Accountant' } });
                                                showToast('Acting as Accountant', 'info');
                                            }}
                                        >
                                            Accountant
                                        </button>
                                        <button
                                            className={`btn ${state.currentUser?.role === 'Staff' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => {
                                                dispatch({ type: 'SET_USER', payload: { id: 'u3', email: 'staff@arthik.com', role: 'Staff' } });
                                                showToast('Acting as Staff', 'info');
                                            }}
                                        >
                                            Staff
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <button className="btn btn-outline" onClick={() => { setName(company?.name || ''); }}>Reset</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <Save size={18} /> Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
