import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Receipt,
    Package,
    BarChart3,
    Settings,
    Search,
    LogOut,
    Bell,
    Cloud,
    CloudOff,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { state, syncStatus } = useAccounting();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showResults, setShowResults] = React.useState(false);

    // Command Palette Logic
    const searchResults = React.useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        const results = [];

        // Pages
        const pages = [
            { name: 'Go to Dashboard', path: '/', type: 'Navigation' },
            { name: 'Go to Ledgers', path: '/ledgers', type: 'Navigation' },
            { name: 'Go to Vouchers', path: '/vouchers', type: 'Navigation' },
            { name: 'Go to Inventory', path: '/inventory', type: 'Navigation' },
            { name: 'Go to Reports', path: '/reports', type: 'Navigation' },
        ];
        results.push(...pages.filter(p => p.name.toLowerCase().includes(query)));

        // Ledgers
        results.push(...state.ledgers
            .filter(l => l.name.toLowerCase().includes(query))
            .map(l => ({ name: `Ledger: ${l.name}`, path: `/ledgers`, type: 'Ledger' }))
        );

        // Vouchers
        results.push(...state.vouchers
            .filter(v => v.number.toLowerCase().includes(query) || v.narration.toLowerCase().includes(query))
            .map(v => ({ name: `Voucher: ${v.number}`, path: `/vouchers`, type: 'Voucher' }))
        );

        return results.slice(0, 8);
    }, [searchQuery, state]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('global-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Ledgers', icon: <BookOpen size={20} />, path: '/ledgers' },
        { name: 'Vouchers', icon: <Receipt size={20} />, path: '/vouchers' },
        { name: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
        { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            showToast('Logged out securely.', 'info');
            navigate('/auth');
        } else {
            showToast('Logout failed.', 'error');
        }
    };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#60a5fa' }}>Ar</span>thik
                    </h1>
                    <p style={{ fontSize: '10px', color: 'var(--sidebar-text)', textTransform: 'uppercase', marginTop: '4px', opacity: 0.6 }}>
                        Modern Accounting
                    </p>
                </div>

                <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 24px',
                                color: isActive ? '#fff' : '#94a3b8',
                                backgroundColor: isActive ? '#2563eb' : 'transparent',
                                fontSize: '14px',
                                fontWeight: isActive ? '600' : '500',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            })}
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{
                        padding: '12px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#2563eb',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            {state.currentUser?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: 'white',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{state.currentUser?.email}</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8' }}>{state.currentUser?.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '6px',
                                transition: 'all 0.2s'
                            }}
                            className="logout-btn"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-content">
                <header className="top-bar" style={{ padding: '0 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                        <div style={{ position: 'relative', width: '450px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="global-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowResults(true);
                                }}
                                onFocus={() => setShowResults(true)}
                                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                placeholder="Search client, voucher or command... (⌘ K)"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '14px',
                                    border: '1px solid var(--border-strong)',
                                    fontSize: '14px',
                                    background: '#f8fafc',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                className="search-input"
                            />
                            {showResults && searchResults.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                                    border: '1px solid var(--border)',
                                    zIndex: 1000,
                                    overflow: 'hidden'
                                }}>
                                    {searchResults.map((res, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                navigate(res.path);
                                                setSearchQuery('');
                                                setShowResults(false);
                                            }}
                                            style={{
                                                padding: '12px 20px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid var(--border)',
                                                fontSize: '14px'
                                            }}
                                            className="search-item"
                                        >
                                            <span style={{ fontWeight: '600' }}>{res.name}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>{res.type}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right', paddingRight: '16px', borderRight: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maha 3, 2082 BS</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Friday, Jan 16</p>
                            </div>
                            <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    padding: '6px 12px',
                                    borderRadius: '99px',
                                    background: syncStatus === 'synced' ? '#f0fdf4' : syncStatus === 'error' ? '#fef2f2' : '#f8fafc',
                                    color: syncStatus === 'synced' ? 'var(--success)' : syncStatus === 'error' ? 'var(--danger)' : 'var(--text-muted)'
                                }}>
                                    {syncStatus === 'synced' && <><Cloud size={14} /> CLOUD SYNCED</>}
                                    {syncStatus === 'syncing' && <><RefreshCw size={14} className="animate-spin" /> SYNCING...</>}
                                    {syncStatus === 'error' && <><AlertCircle size={14} /> SYNC ERROR</>}
                                    {syncStatus === 'local' && <><CloudOff size={14} /> LOCAL ONLY</>}
                                </div>
                                <div style={{ position: 'relative', cursor: 'pointer' }}>
                                    <Bell size={20} />
                                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '36px', width: '1px', background: 'var(--border)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: '700' }}>{state.currentCompany?.name}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                {state.currentCompany?.name?.[0] || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="page-container animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
