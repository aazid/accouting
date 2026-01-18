import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    LogIn,
    UserPlus,
    Lock,
    Mail,
    Loader2,
    ShieldCheck,
    Globe,
    Zap,
    CheckCircle2
} from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'Admin' // Default role for first user
                        }
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Verification link sent! Check your email.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed. Check your credentials.';
            setMessage({ type: 'error', text: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#0f172a',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Left Side: Branding & Features */}
            <div style={{
                flex: 1.2,
                background: 'linear-gradient(45deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '60px',
                display: 'none', // Hide on mobile
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }} className="auth-branding">
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
                            <ShieldCheck size={32} color="#4f46e5" />
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>ArArthik</h1>
                    </div>

                    <h2 style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px' }}>
                        The Most Reliable <br />
                        <span style={{ color: '#a5b4fc' }}>Accounting Suite</span> for Nepal.
                    </h2>

                    <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '48px', maxWidth: '500px' }}>
                        Securely manage your ledgers, vouchers, and statutory reports with real-time cloud synchronization.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Globe size={24} style={{ flexShrink: 0, color: '#a5b4fc' }} />
                            <div>
                                <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>Global Access</h4>
                                <p style={{ fontSize: '14px', opacity: 0.8 }}>Work from anywhere, anytime on any device.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Zap size={24} style={{ flexShrink: 0, color: '#a5b4fc' }} />
                            <div>
                                <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>Atomic Security</h4>
                                <p style={{ fontSize: '14px', opacity: 0.8 }}>Your financial data is encrypted and isolated.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative background circle */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%'
                }}></div>
            </div>

            {/* Right Side: Auth Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: '#0f172a'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                            {isSignUp ? 'Create Workspace' : 'Secure Entry'}
                        </h3>
                        <p style={{ color: '#94a3b8' }}>
                            {isSignUp ? 'Join thousands of businesses managing their finances safely.' : 'Enter your credentials to access your financial records.'}
                        </p>
                    </div>

                    {message && (
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                            color: message.type === 'success' ? '#10b981' : '#f87171',
                            display: 'flex',
                            gap: '12px',
                            fontSize: '14px'
                        }}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                                WORK EMAIL
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@firm.com"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 44px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>PASSWORD</label>
                                {!isSignUp && <a href="#" style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>Forgot?</a>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 44px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '15px',
                                        outline: 'none'
                                    }}
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '10px',
                                transition: 'transform 0.1s, filter 0.2s'
                            }}
                            className="auth-btn"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                isSignUp ? <><UserPlus size={18} /> Create Admin Account</> : <><LogIn size={18} /> Access Account</>
                            )}
                        </button>

                        {!isSignUp && (
                            <button
                                type="button"
                                onClick={() => {
                                    setLoading(true);
                                    // Demo Mode Bypass - no Supabase required
                                    localStorage.setItem('arthik_demo_mode', 'true');
                                    localStorage.setItem('arthik_demo_user', JSON.stringify({
                                        email: 'demo@arthik.com',
                                        role: 'Demo User',
                                        name: 'Demo Account'
                                    }));
                                    setMessage({ type: 'success', text: 'Demo mode activated! Redirecting...' });
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 500);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid #334155',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Explorer Mode (Demo Access)
                            </button>
                        )}
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}
                        >
                            {isSignUp ? 'Already a member? ' : 'New to Arthik? '}
                            <span style={{ color: '#4f46e5', fontWeight: '700' }}>
                                {isSignUp ? 'Sign In Now' : 'Create Free Account'}
                            </span>
                        </button>
                    </div>

                    <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #334155', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#475569', letterSpacing: '0.5px' }}>
                            ISO 27001 COMPLIANT • SECURE DATA ENCRYPTION • NEPAL TAX READY
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-branding { display: flex !important; }
                @media (max-width: 900px) {
                    .auth-branding { display: none !important; }
                }
                .auth-input:focus {
                    border-color: #4f46e5 !important;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
                }
                .auth-btn:hover {
                    filter: brightness(1.1);
                }
                .auth-btn:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
};

export default Auth;

