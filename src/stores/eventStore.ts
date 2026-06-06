/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { EventOffer } from '../types';
import { generateGradientPlaceholder } from '../utils/placeholderImages';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, runWithRetry } from '../lib/firebase';

interface EventState {
  events: EventOffer[];
  isLoading: boolean;
  error: string | null;
  addEvent: (event: Omit<EventOffer, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<EventOffer>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const getSeededEvents = (): Omit<EventOffer, 'id'>[] => [
  {
    title: 'Monsoon Milestone Growth Blast',
    description: 'Get an extra flat 50% off on all Premium Followers & Reels Views. Elevate your status this monsoon season and cross your milestone targets!',
    discountCode: 'GROWTH50',
    discountPercent: 50,
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('Monsoon Milestone Boost', 'Events', 2),
  },
  {
    title: 'Weekend Reels Blitz Special',
    description: 'Jumpstart your content discoverability! Unlock 30% discount on all custom interactive comment packages and viral reels combos.',
    discountCode: 'REELS30',
    discountPercent: 30,
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('Weekend Reels Blitz', 'Events', 0),
  },
  {
    title: 'Elite Creator Accelerator Hub',
    description: 'Our premium 1:1 strategy classes and Royal packages are discounted by 25% for the next 24 hours only. Secure your growth roadmap.',
    discountCode: 'CREATOR25',
    discountPercent: 25,
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('Elite Creator Accelerator', 'Events', 5),
  }
];

export const useEventStore = create<EventState>((set) => {
  const collectionRef = collection(db, 'events');

  // Real-time listener with automatic local backup fallback if Firestore rules or connections reject
  onSnapshot(collectionRef, async (snapshot) => {
    const list: EventOffer[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as EventOffer);
    });

    if (list.length === 0) {
      // Local state fallback to seeds to offer instant loaded storefront
      const seeds = getSeededEvents().map((e, idx) => ({ id: `seed-${idx}`, ...e }));
      set({ events: seeds, isLoading: false, error: null });

      // Admin auto-seeding
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email?.toLowerCase() === 'would5006@gmail.com') {
        console.log('Verified Administrator authenticated. Seeding Firestore events collection...');
        try {
          const seeds = getSeededEvents();
          for (const seed of seeds) {
            await runWithRetry(() => addDoc(collectionRef, {
              ...seed,
              createdAt: new Date().toISOString()
            }));
          }
        } catch (err) {
          console.error('[Event Seeding Halted]:', err);
        }
      }
    } else {
      set({ events: list, isLoading: false, error: null });
    }
  }, (error) => {
    console.warn('[Events Listener Fallback Active] Reading locally seeded events:', error.message);
    const seeds = getSeededEvents().map((e, idx) => ({ id: `seed-fallback-${idx}`, ...e }));
    set({ events: seeds, isLoading: false, error: null });
  });

  return {
    events: [],
    isLoading: true,
    error: null,

    addEvent: async (newEvt) => {
      try {
        const img = newEvt.image || generateGradientPlaceholder(newEvt.title, 'Events', 2);
        await runWithRetry(() => addDoc(collectionRef, {
          ...newEvt,
          image: img,
          createdAt: new Date().toISOString()
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'events');
      }
    },

    updateEvent: async (id, updatedFields) => {
      try {
        const docRef = doc(db, 'events', id);
        await runWithRetry(() => updateDoc(docRef, {
          ...updatedFields,
          updatedAt: new Date().toISOString()
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
      }
    },

    deleteEvent: async (id) => {
      try {
        const docRef = doc(db, 'events', id);
        await runWithRetry(() => deleteDoc(docRef));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
      }
    }
  };
});
