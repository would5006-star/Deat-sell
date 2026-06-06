/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signOut, 
  User, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, runWithRetry } from '../lib/firebase';

interface AdminState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  sendPasswordReset: (email: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  error: null,

  setUser: (user: User | null) => {
    const isUserAdmin = user?.email?.toLowerCase() === 'would5006@gmail.com';
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: isUserAdmin,
      isLoading: false,
    });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Execute Auth logic wrapped securely inside retry backoff helper
      const userCredential = await runWithRetry(() => 
        signInWithEmailAndPassword(auth, email, password)
      );
      const isUserAdmin = userCredential.user.email?.toLowerCase() === 'would5006@gmail.com';
      set({ 
        user: userCredential.user,
        isAuthenticated: true,
        isAdmin: isUserAdmin,
        isLoading: false 
      });
      return true;
    } catch (err: any) {
      let friendlyMessage = 'Authentication failed';
      if (!navigator.onLine) {
        friendlyMessage = 'You are currently offline. Please restore your internet network and retry.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network connection timed out. Please check your VPN, firecards, or ad-blockers, then retry login.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password. Please verify operator credentials.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      set({ error: friendlyMessage, isLoading: false, isAuthenticated: false, isAdmin: false });
      return false;
    }
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await runWithRetry(() => 
        createUserWithEmailAndPassword(auth, email, password)
      );
      const isUserAdmin = userCredential.user.email?.toLowerCase() === 'would5006@gmail.com';
      set({
        user: userCredential.user,
        isAuthenticated: true,
        isAdmin: isUserAdmin,
        isLoading: false
      });
      return true;
    } catch (err: any) {
      let friendlyMessage = 'Sign up failed';
      if (!navigator.onLine) {
        friendlyMessage = 'You are currently offline. Please restore your connection.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network connection timed out. Please check your internet, then retry.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already in use. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'Password is too weak. It must be at least 6 characters.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      set({ error: friendlyMessage, isLoading: false, isAuthenticated: false, isAdmin: false });
      return false;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await runWithRetry(() => 
        signInWithPopup(auth, googleProvider)
      );
      const isUserAdmin = result.user.email?.toLowerCase() === 'would5006@gmail.com';
      set({
        user: result.user,
        isAuthenticated: true,
        isAdmin: isUserAdmin,
        isLoading: false
      });
      return true;
    } catch (err: any) {
      let friendlyMessage = 'Google login failed.';
      if (!navigator.onLine) {
        friendlyMessage = 'You are currently offline. Verify connection.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Google Sign-In network timed out. Please retry.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      set({ 
        error: friendlyMessage, 
        isLoading: false, 
        isAuthenticated: false, 
        isAdmin: false 
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await runWithRetry(() => 
        sendPasswordResetEmail(auth, email)
      );
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      let friendlyMessage = 'Failed to send password reset email';
      if (!navigator.onLine) {
        friendlyMessage = 'You are currently offline. Please restore connection.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network connection timed out. Please check your internet, then retry.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        friendlyMessage = 'No active account found with this email, or the email address is invalid.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      set({ error: friendlyMessage, isLoading: false });
      return false;
    }
  },
}));

// Initialize active listener immediately for state synchronization
onAuthStateChanged(auth, (user) => {
  useAdminStore.getState().setUser(user);
});
