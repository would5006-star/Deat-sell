/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Menu, X, Instagram, Sparkles, LogOut, ShieldAlert } from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';

interface NavbarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  onOpenAdminLogin: () => void;
}

export default function Navbar({ currentTab, onChangeTab, onOpenAdminLogin }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAdminStore();

  const handleTabChange = (tab: string) => {
    onChangeTab(tab);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'events', label: 'Events' },
    { id: 'blog', label: 'Blog Feed' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-bg-dark/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo Brand Brand */}
          <div 
            className="flex cursor-pointer items-center space-x-2" 
            onClick={() => handleTabChange('home')}
            id="brand-logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-secondary to-primary p-0.5 shadow-lg shadow-primary/10">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-bg-dark">
                <Instagram className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <span className="font-sans text-xl font-black tracking-tight text-white sm:text-2xl">
                DEAT<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> SELL</span>
              </span>
              <p className="font-sans text-[9px] font-bold tracking-[0.25em] text-secondary">
                INSTAGRAM ACCELERATION
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleTabChange(link.id)}
                id={`nav-${link.id}`}
                className={`font-sans text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  currentTab === link.id
                    ? 'text-primary'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Admin Controls */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleTabChange('admin')}
                  id="nav-admin"
                  className="flex items-center space-x-1.5 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>{isAdmin ? 'Admin Panel' : 'My Account'}</span>
                </button>
                <button
                  onClick={() => {
                     logout();
                     handleTabChange('home');
                  }}
                  id="nav-logout"
                  className="rounded-lg bg-white/5 p-2 text-white/50 hover:bg-accent/10 hover:text-accent transition-colors"
                  title={isAdmin ? "Logout Admin" : "Logout Account"}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                id="btn-admin-login-trigger"
                className="flex items-center space-x-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors py-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-white/70 hover:bg-white/5 hover:text-white focus:outline-none transition-colors"
              aria-label="Toggle Menu"
              id="hamburger-btn"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-bg-dark px-4 py-3 md:hidden">
          <div className="space-y-3 pb-3 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleTabChange(link.id)}
                className={`block w-full text-left rounded-lg px-4 py-2.5 font-sans text-base font-semibold ${
                  currentTab === link.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="my-2 border-t border-white/5 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleTabChange('admin')}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-black"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isAdmin ? 'Go to Admin Panel' : 'Go to My Account'}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleTabChange('home');
                    }}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-accent/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isAdmin ? 'Logout Admin' : 'Logout Account'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminLogin();
                  }}
                  className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/50 hover:bg-white/5"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Sign Up / Access Portal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
