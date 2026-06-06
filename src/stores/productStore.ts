/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Product } from '../types';
import { generateGradientPlaceholder } from '../utils/placeholderImages';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, runWithRetry } from '../lib/firebase';


interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

// 10 premium seed products spanning different Instagram metrics
const getSeededProducts = (): Omit<Product, 'id'>[] => [
  {
    title: '1,000 Premium Real Active Followers',
    description: 'Boost your profile with 100% active Instagram profiles. No drops, organic delivery speed, safety-approved for algorithms.',
    price: 499,
    category: 'Followers',
    deliveryTime: 'Instant (1-2 Hours)',
    image: generateGradientPlaceholder('1K Real Followers', 'Followers', 0),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    messengerLink: '',
    isFeatured: true,
  },
  {
    title: '5,000 Professional Organic Followers',
    description: 'Grow naturally with our graduated follower bundle. High retention rate, premium profiles with real activity pipelines.',
    price: 1899,
    category: 'Followers',
    deliveryTime: 'Gradual (24-48 Hours)',
    image: generateGradientPlaceholder('5K Organic Followers', 'Followers', 1),
    enableTimer: true,
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    messengerLink: '',
    isFeatured: true,
  },
  {
    title: '10,000 Royal Agency Growth Followers',
    description: 'The supreme follower package for high-end influencers and businesses. Premium priority support + 30 days unlimited drop refilling.',
    price: 3499,
    category: 'Followers',
    deliveryTime: 'Safe Drip-Feed (3 Days)',
    image: generateGradientPlaceholder('10K Royal Followers', 'Followers', 5),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: true,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    messengerLink: '',
    isFeatured: true,
  },
  {
    title: '2,500 Ultra Instant Post Likes',
    description: 'Ignite the Instagram Explore page. Send 2500 high-grade likes from authentic-looking accounts instantly upon publishing.',
    price: 299,
    category: 'Likes',
    deliveryTime: 'Instant (Within 10 Mins)',
    image: generateGradientPlaceholder('2.5K Instant Likes', 'Likes', 2),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    messengerLink: '',
    isFeatured: false,
  },
  {
    title: '20,000 High-Retention Reels Views',
    description: 'Boost your Reels in the algorithm. Increases discovery rates, explorer reach, and watch-time ratios dramatically.',
    price: 199,
    category: 'Views',
    deliveryTime: 'Instant (15-30 Mins)',
    image: generateGradientPlaceholder('20K Reels Views', 'Views', 3),
    enableTimer: true,
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    messengerLink: '',
    isFeatured: false,
  },
  {
    title: '100 Premium Relevant Custom Comments',
    description: 'Get verified-looking accounts typing positive, custom, niche-relevant comments. Perfect to foster high organic discourse.',
    price: 349,
    category: 'Comments',
    deliveryTime: 'Gradual (1-2 Hours)',
    image: generateGradientPlaceholder('100 Custom Comments', 'Comments', 4),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    isFeatured: false,
  },
  {
    title: 'The Viral Accelerator Starter Combo',
    description: 'Get our best value package in one stroke: 1,500 Followers, 1,000 Likes, and 15,000 Reels Views. Maximize your explore potential.',
    price: 899,
    category: 'Combos',
    deliveryTime: 'Instant Delivery Spread',
    image: generateGradientPlaceholder('Viral Starter Combo', 'Combos', 1),
    enableTimer: true,
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    isFeatured: true,
  },
  {
    title: 'Reels Explosive Expansion Syndicate',
    description: 'Mega-package containing 10,000 Premium Likes, 100,000 Views, and 200 Custom Comments to spark full viral potential.',
    price: 2499,
    category: 'Combos',
    deliveryTime: 'Drip Feed (24 Hours)',
    image: generateGradientPlaceholder('Explosive Reels Combo', 'Combos', 2),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    isFeatured: false,
  },
  {
    title: '1-on-1 Instagram Profile Masterclass',
    description: 'Personalized strategy session targeting bio optimization, content audits, hashtag clusters, and elite monetization avenues.',
    price: 4999,
    category: 'Combos',
    deliveryTime: 'Scheduled Booking',
    image: generateGradientPlaceholder('1:1 Profile Masterclass', 'Combos', 5),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: true,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    isFeatured: true,
  },
  {
    title: '5,000 High-Engagement Reeling Likes',
    description: 'Fuel your carousel posts or reels. Elevates the initial watch-and-react ratio, raising placement in relevant feed hashtags.',
    price: 599,
    category: 'Likes',
    deliveryTime: 'Instant (1 Hour)',
    image: generateGradientPlaceholder('5K Reel Likes', 'Likes', 0),
    enableTimer: false,
    expiryDate: '',
    isChatOnly: false,
    instagramLink: 'https://instagram.com',
    whatsappLink: 'https://wa.me/919999999999',
    isFeatured: false,
  }
];

export const useProductStore = create<ProductState>((set, get) => {
  const collectionRef = collection(db, 'products');

  // Set up real-time listener with automatic local backup fallback if Firestore rules or connections reject
  onSnapshot(collectionRef, async (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Product);
    });

    if (list.length === 0) {
      // Set local state to seed products so the user sees a rich UI immediately
      const seeds = getSeededProducts().map((p, idx) => ({ id: `seed-${idx}`, ...p }));
      set({ products: seeds, isLoading: false, error: null });

      // Remote writes are ONLY triggered when the designated Admin operates
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email?.toLowerCase() === 'would5006@gmail.com') {
        console.log('Verified Administrator authenticated. Seeding Firestore products collection...');
        try {
          const seeds = getSeededProducts();
          for (const seed of seeds) {
            await runWithRetry(() => addDoc(collectionRef, {
              ...seed,
              createdAt: new Date().toISOString()
            }));
          }
        } catch (err) {
          console.error('[Product Seeding Halted]:', err);
        }
      }
    } else {
      set({ products: list, isLoading: false, error: null });
    }
  }, (error) => {
    console.warn('[Products Listener Fallback Active] Reading locally seeded catalog:', error.message);
    const seeds = getSeededProducts().map((p, idx) => ({ id: `seed-fallback-${idx}`, ...p }));
    set({ products: seeds, isLoading: false, error: null });
  });

  return {
    products: [],
    isLoading: true,
    error: null,

    addProduct: async (newProd) => {
      try {
        const img = newProd.image || generateGradientPlaceholder(newProd.title, newProd.category, 0);
        await runWithRetry(() => addDoc(collectionRef, {
          ...newProd,
          image: img,
          createdAt: new Date().toISOString()
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'products');
      }
    },

    updateProduct: async (id, updatedFields) => {
      try {
        const docRef = doc(db, 'products', id);
        await runWithRetry(() => updateDoc(docRef, {
          ...updatedFields,
          updatedAt: new Date().toISOString()
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      }
    },

    deleteProduct: async (id) => {
      try {
        const docRef = doc(db, 'products', id);
        await runWithRetry(() => deleteDoc(docRef));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    },
  };
});
