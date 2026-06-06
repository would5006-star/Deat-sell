/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Toaster, toast } from 'sonner';
import { ShieldAlert, X, Sparkles, AlertCircle, Mail, Lock, LogOut } from 'lucide-react';

// STORES
import { useProductStore } from './stores/productStore';
import { useEventStore } from './stores/eventStore';
import { useBlogStore } from './stores/blogStore';
import { useAdminStore } from './stores/adminStore';

// MAIN PAGES
import Home from './pages/Home';
import Services from './pages/Services';
import EventsPage from './pages/EventsPage';
import BlogPage from './pages/BlogPage';
import AdminPage from './pages/AdminPage';

// COMPONENTS
import Navbar from './components/Navbar';
import CheckoutModal from './components/CheckoutModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [checkoutProduct, setCheckoutProduct] = useState<any | null>(null);
  
  // Admin Login/Signup Dialog State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginFormActionLoading, setLoginFormActionLoading] = useState(false);

  // Sync state with our unified administrative store
  const { products } = useProductStore();
  const { user, isAuthenticated, isAdmin, error: authStoreError, login, signup, logout, loginWithGoogle, clearError } = useAdminStore();

  const handleAdminAuthEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      toast.error('Both email and password are required.');
      return;
    }
    
    setLoginFormActionLoading(true);
    if (authMode === 'signup') {
      const successfullyRegistered = await signup(adminEmail.trim(), adminPassword);
      setLoginFormActionLoading(false);

      if (successfullyRegistered) {
        const isRegUserAdmin = adminEmail.trim().toLowerCase() === 'would5006@gmail.com';
        toast.success(isRegUserAdmin ? 'Account Created! Welcome to the Admin Terminal.' : 'Account Created! Welcome to Deat Sell.', {
          icon: '✨',
          duration: 3000,
        });
        setShowAdminLogin(false);
        setAdminPassword('');
        setActiveTab('admin');
      } else {
        toast.error(authStoreError || 'Registration failed. Verify password complexity.');
      }
    } else {
      const successfullyAuthenticated = await login(adminEmail.trim(), adminPassword);
      setLoginFormActionLoading(false);

      if (successfullyAuthenticated) {
        const isLoginUserAdmin = adminEmail.trim().toLowerCase() === 'would5006@gmail.com';
        toast.success(isLoginUserAdmin ? 'Access Granted! Opening Admin Terminal...' : 'Login Successful! Welcome to your Portal.', {
          icon: isLoginUserAdmin ? '🔑' : '✨',
          duration: 3000,
        });
        setShowAdminLogin(false);
        setAdminPassword('');
        setActiveTab('admin');
      } else {
        toast.error(authStoreError || 'Authentication Rejected. Verify credentials.');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoginFormActionLoading(true);
    const successfullyAuthenticated = await loginWithGoogle();
    setLoginFormActionLoading(false);

    if (successfullyAuthenticated) {
      const isGoogleUserAdmin = useAdminStore.getState().isAdmin;
      toast.success(isGoogleUserAdmin ? 'Successfully linked Google account. Welcome to the Admin Terminal!' : 'Successfully logged in with Google!', {
        icon: '⭐',
        duration: 3000,
      });
      setShowAdminLogin(false);
      setActiveTab('admin');
    } else {
      toast.error(authStoreError || 'Google Sign-In failed or was aborted.');
    }
  };

  // Dedicated Product detail consultation launcher
  const handleSelectProductDetail = (p: any) => {
    toast(`Consulting regarding "${p.title}"`, {
      description: `Speed: ${p.deliveryTime} • Price: ${formatINRLocal(p.price)}. Proceeding to details check.`,
      action: {
        label: 'Secure Now',
        onClick: () => setCheckoutProduct(p)
      }
    });
  };

  const formatINRLocal = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-between text-white" id="main-app-container">
      
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <Navbar 
        currentTab={activeTab} 
        onChangeTab={setActiveTab} 
        onOpenAdminLogin={() => {
          clearError();
          setShowAdminLogin(true);
        }} 
      />

      {/* 2. DYNAMIC LAYOUT PAGE VIEWS */}
      <main className="flex-grow animate-fade-in">
        {activeTab === 'home' && (
          <Home 
            products={products}
            onSelectProduct={handleSelectProductDetail}
            onCheckout={(p) => setCheckoutProduct(p)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'services' && (
          <Services 
            products={products}
            onSelectProduct={handleSelectProductDetail}
            onCheckout={(p) => setCheckoutProduct(p)}
          />
        )}

        {activeTab === 'events' && (
          <EventsPage 
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'blog' && (
          <BlogPage />
        )}

        {activeTab === 'admin' && (
          isAuthenticated ? (
            isAdmin ? (
              <AdminPage />
            ) : (
              <div className="mx-auto max-w-xl px-4 py-16 animate-fade-in" id="standard-user-portal">
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-dark shadow-2xl p-8 sm:p-12 relative text-center">
                  
                  {/* Decorative background gradients */}
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-[#B388FF]/5 blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-lg shadow-primary/10">
                      <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-bg-dark text-primary font-black text-xl uppercase">
                        {(user?.displayName || user?.email || 'US').slice(0, 2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        Welcome, {user?.displayName || user?.email?.split('@')[0]}!
                      </h2>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setActiveTab('home')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-90 transition-all cursor-pointer"
                      >
                        <span>Go to Home Page</span>
                      </button>

                      <button
                        onClick={async () => {
                          await logout();
                          setActiveTab('home');
                          toast.info('Logged out from account.', { icon: '✨' });
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-white transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out Account</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-4 animate-fade-in">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Join Deat Sell SMM Portal</h3>
              <p className="text-xs text-white/50 max-w-sm">
                Please register or sign in to access your dashboard. Create an account to explore premium campaigns and packages instantly.
              </p>
              <button
                onClick={() => {
                  clearError();
                  setShowAdminLogin(true);
                }}
                className="rounded-xl bg-primary py-2.5 px-6 text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-95 cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          )
        )}
      </main>

      {/* 3. PREMIUM MODERN FOOTER BAR */}
      <footer className="border-t border-white/5 bg-surface-dark py-8 px-4" id="deatsell-footer">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/30">
          <div className="flex flex-col space-y-1 sm:text-left text-center">
            <span className="text-white font-extrabold text-sm tracking-wider">DEAT <span className="text-primary font-black">SELL</span></span>
            <p className="text-[10px] uppercase tracking-widest text-[#B388FF]">Instagram Accelerator Ecosystem</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/50">
            <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home Page</button>
            <button onClick={() => setActiveTab('services')} className="hover:text-white transition-colors">Growth Plans</button>
            <button onClick={() => setActiveTab('events')} className="hover:text-white transition-colors">Event Calendar</button>
            <button onClick={() => setActiveTab('blog')} className="hover:text-white transition-colors font-sans">Strategic Blog Feed</button>
          </div>

          <div className="text-center sm:text-right">
            <p>© 2026 Deat Sell Corp. All Rights Reserved.</p>
            <p className="text-[10px] font-mono text-white/10 mt-1">Full-Stack Production Engine Powered by Firebase</p>
          </div>
        </div>
      </footer>

      {/* 4. DIALOG MODAL LAYERS */}

      {/* 4.1 SECURE LOCAL CHECKOUT MODAL */}
      {checkoutProduct && (
        <CheckoutModal 
          product={checkoutProduct} 
          onClose={() => setCheckoutProduct(null)} 
        />
      )}

      {/* 4.2 REAL FIREBASE ADMIN ENTRANCE MODAL (GATE) */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" id="admin-passcode-gate-overlay">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-dark shadow-2xl p-6" id="login-modal-card">
            
            <button
              onClick={() => {
                setShowAdminLogin(false);
                setAdminPassword('');
                clearError();
              }}
              className="absolute top-4 right-4 rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Segmented Tab Controls for Sign In vs. Sign Up */}
            <div className="flex border-b border-white/5 pb-3 mb-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  clearError();
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  clearError();
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            <form onSubmit={handleAdminAuthEmail} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="h-6 w-6 stroke-2" />
                </div>

                <div className="space-y-1 mt-3">
                  <h3 className="font-sans text-base font-extrabold text-white">
                    {authMode === 'signin' ? 'Member Portal Access' : 'Register Member Account'}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wide text-white/40 font-semibold">
                    {authMode === 'signin' 
                      ? 'Log in to access your SMM packages, events and blogs'
                      : 'Create your account to browse premium growth plans'}
                  </p>
                </div>
              </div>



              {authMode === 'signup' && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-primary/85 leading-relaxed">
                  <span className="font-bold block">Access Level: Member Portal</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    Signing up grants you instant access to browse events, track growth packages, and view premium Instagram strategic blogs.
                  </p>
                </div>
              )}

              {/* Text Fields */}
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white/50 uppercase tracking-widest text-[10px] flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operator@deatsell.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-4 py-3 font-semibold text-white placeholder-white/20 focus:border-primary focus:outline-none"
                    id="admin-email-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/50 uppercase tracking-widest text-[10px] flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-4 py-3 font-semibold text-white placeholder-white/20 focus:border-primary focus:outline-none"
                    id="admin-password-input"
                  />
                </div>
                
                {authStoreError && (
                  <p className="text-xs font-bold text-accent text-center mt-1 text-red-500">{authStoreError}</p>
                )}
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loginFormActionLoading}
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-primary py-3 font-sans text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {loginFormActionLoading 
                    ? 'Processing Firebase Authentication...' 
                    : authMode === 'signup' 
                      ? 'Sign Up & Create Account' 
                      : 'Sign In with Email & Password'}
                </button>

                {/* Secure google sign in button wrapper */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <span className="relative bg-surface-dark px-3 text-[9px] uppercase font-bold tracking-widest text-white/30">Alternative registration</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loginFormActionLoading}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Link Live Google Account</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. SONNER THEMED ACCENT DIALOGS */}
      <Toaster position="top-right" theme="dark" closeButton />

    </div>
  );
}
