import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AccountingProvider } from './context/AccountingContext';
import { ToastProvider } from './context/ToastContext';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ledgers from './pages/Ledgers';
import Vouchers from './pages/Vouchers';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode in localStorage
    const isDemoMode = localStorage.getItem('arthik_demo_mode') === 'true';
    setDemoMode(isDemoMode);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Listen for demo mode changes
    const handleStorageChange = () => {
      setDemoMode(localStorage.getItem('arthik_demo_mode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check if user is authenticated (either via Supabase OR demo mode)
  const isAuthenticated = session || demoMode;

  if (loading) return null;

  return (
    <ToastProvider>
      <AccountingProvider>
        <Router>
          {!isAuthenticated ? (
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          ) : (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ledgers" element={<Ledgers />} />
                <Route path="/vouchers" element={<Vouchers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          )}
        </Router>
      </AccountingProvider>
    </ToastProvider>
  );
}

export default App;
