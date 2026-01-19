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
    AlertCircle,
    ChevronDown,
    Building,
    Shield,
    LogOut as LogOutIcon,
    X,
    Mail,
    Hash,
    Calendar,
    Briefcase
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import authService from '../authService';
import { useToast } from '../context/ToastContext';
import { getNepaleseDate } from '../utils/dateUtils';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { state, syncStatus } = useAccounting();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showResults, setShowResults] = React.useState(false);
    const [showProfilePopup, setShowProfilePopup] = React.useState(false);
    const [currentDate, setCurrentDate] = React.useState(getNepaleseDate());

    // Update date every minute
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(getNepaleseDate());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

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

    const handleLogout = () => {
        authService.logout();
        showToast('Logged out securely.', 'info');
        navigate('/auth');
    };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div 
                    onClick={() => navigate('/')}
                    style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
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
                                <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentDate.bsDate}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentDate.adDate}</p>
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
                        <div style={{ position: 'relative' }}>
                            <div 
                                onClick={() => setShowProfilePopup(!showProfilePopup)}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '700' }}>{state.currentCompany?.name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                        Administrator <ChevronDown size={12} />
                                    </p>
                                </div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    {state.currentCompany?.name?.[0] || 'A'}
                                </div>
                            </div>

                            {showProfilePopup && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    zIndex: 2000,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '24px'
                                }} onClick={() => setShowProfilePopup(false)}>
                                    <div 
                                        style={{
                                            width: '100%',
                                            maxWidth: '520px',
                                            background: 'white',
                                            borderRadius: '24px',
                                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                            padding: '32px',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Header Decoration */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)', zIndex: 0 }}></div>
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowProfilePopup(false);
                                            }}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '20px', 
                                                right: '20px', 
                                                background: '#f1f5f9', 
                                                border: 'none', 
                                                padding: '10px', 
                                                borderRadius: '12px', 
                                                cursor: 'pointer', 
                                                zIndex: 10, 
                                                color: '#64748b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <X size={20} />
                                        </button>

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                                                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(45deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '28px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                                                    {state.currentUser?.username?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{state.currentUser?.username}</h2>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                                        <Shield size={14} />
                                                        <span style={{ fontWeight: '600', color: 'var(--primary)', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', textTransform: 'uppercase' }}>{state.currentUser?.role || 'Administrator'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Stats Banner */}
                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                                {[
                                                    { label: 'Ledgers', count: state.ledgers.length, color: '#3b82f6' },
                                                    { label: 'Vouchers', count: state.vouchers.length, color: '#8b5cf6' },
                                                    { label: 'Stock Items', count: state.stockItems.length, color: '#10b981' }
                                                ].map((stat, i) => (
                                                    <div key={i} style={{ flex: 1, padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                        <p style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{stat.count}</p>
                                                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>{stat.label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                {/* Left Column: User Info */}
                                                <div>
                                                    <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>User Information</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}><Mail size={16} color="#64748b" /></div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Email Address</p>
                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{state.currentUser?.email}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}><Briefcase size={16} color="#64748b" /></div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Work Role</p>
                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>System Administrator</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Organization Details */}
                                                <div>
                                                    <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Organization Details</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}><Building size={16} color="#64748b" /></div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Company</p>
                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{state.currentCompany?.name}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}><Hash size={16} color="#64748b" /></div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>PAN / VAT Number</p>
                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{state.currentCompany?.panVatNumber || 'Not Set'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ background: 'white', padding: '8px', borderRadius: '8px' }}><Calendar size={16} color="#64748b" /></div>
                                                    <div>
                                                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>Current Financial Year</p>
                                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                                                            {state.currentCompany?.financialYearStart} to {state.currentCompany?.financialYearEnd}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowProfilePopup(false);
                                                    }}
                                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >
                                                    Dismiss
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLogout();
                                                    }}
                                                    style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '12px', background: '#fef2f2', color: 'var(--danger)', border: '1px solid #fee2e2', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >
                                                    <LogOutIcon size={18} /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
