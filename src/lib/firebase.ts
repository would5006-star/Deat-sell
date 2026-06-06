/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Enhanced custom retry helper for network-tolerant operations (auth, firestore write/storage uploads)
export async function runWithRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1500,
  exponential = true
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please restore connection to proceed.');
      }
      return await operation();
    } catch (error: any) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkError = 
        errorMessage.includes('network-request-failed') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('Network Error') ||
        errorMessage.includes('timeout') ||
        error?.code === 'auth/network-request-failed' ||
        error?.code === 'auth/internal-error';

      if (attempt >= retries || !isNetworkError) {
        throw error;
      }
      
      const waitTime = exponential ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      console.warn(`[DeatSell Firebase API] Network interruption; retrying in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// Standard diagnostic error types & handlers from Firebase Integration Skill instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Decoded: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

