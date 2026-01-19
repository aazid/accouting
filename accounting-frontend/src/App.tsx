import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AccountingProvider } from './context/AccountingContext';
import { ToastProvider } from './context/ToastContext';
import authService from './authService';
import type { User } from './authService';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ledgers from './pages/Ledgers';
import Vouchers from './pages/Vouchers';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode in localStorage
    const isDemoMode = localStorage.getItem('arthik_demo_mode') === 'true';
    setDemoMode(isDemoMode);

    // Get current user from storage or service
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'access_token') {
        setUser(authService.getCurrentUser());
      }
      if (e.key === 'arthik_demo_mode') {
        setDemoMode(localStorage.getItem('arthik_demo_mode') === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!user || demoMode;

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
