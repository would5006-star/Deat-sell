/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Blog, Comment } from '../types';
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

interface BlogState {
  blogs: Blog[];
  isLoading: boolean;
  error: string | null;
  addBlog: (blog: Omit<Blog, 'id' | 'comments' | 'date'>) => Promise<{ success: boolean; error?: string }>;
  updateBlog: (id: string, blog: Partial<Blog>) => Promise<{ success: boolean; error?: string }>;
  deleteBlog: (id: string) => Promise<void>;
  addComment: (blogId: string, comment: Omit<Comment, 'id' | 'date'>) => Promise<void>;
}

// Case-insensitive verification checking word "SMM" to adhere fully to rules
const containsForbiddenWord = (...texts: string[]): boolean => {
  const forbidden = /\bsmm\b/i;
  return texts.some((text) => forbidden.test(text));
};

const getSeededBlogs = (): Omit<Blog, 'id'>[] => [
  {
    title: 'Unlocking the Instagram Algorithm in 2026',
    excerpt: 'Understand how watch time, shares, and authentic comment ratios fuel your reach and how to leverage them for growth.',
    content: 'The Instagram algorithm is constantly evolving, yet the core metric remains the same: user satisfaction. In 2026, the weight placed on Saves and Shares has increased by 150%. If users are sharing your content to their stories or direct messages, Instagram understands that your post is highly valuable. To boost this, produce relatable carousel graphics and helpful Reel guides that force people to hit the save button. By analyzing your key distribution factors and maintaining a high-fidelity organic growth plan, you can stay ahead of the curve.',
    category: 'Instagram Strategy',
    tags: ['algorithm', 'reels', 'engagement'],
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('Instagram Algorithm 2026', 'Instagram Strategy', 1),
    comments: [
      {
        id: 'c-1',
        author: 'Rohan Sharma',
        content: 'This is super informative! The point about story shares makes absolute sense.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'c-2',
        author: 'Priyah Patel',
        content: 'Does saving a post multiple times help, or does it only count once?',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    title: '5 Pillars of a High-Converting Creator Bio',
    excerpt: 'Convert random profile visits into loyal followers using the perfect profile branding framework.',
    content: 'Your bio is your digital shop window. You only have 3 seconds to convince a visitor to stay. The 5 pillars are: \n\n1) A clear, high-contrast, professional profile image. \n2) A search-optimized name containing your niche keywords. \n3) A clear, punchy benefit statement describing exactly what value you provide. \n4) Social proof or testimonials. \n5) A compelling call-to-action leading to your primary links.\n\nWhen visitors see a well-coordinated profile structure, their trust in your brand increases tenfold. Clean typography, cohesive brand colors, and structured layouts are your key to organic mastery.',
    category: 'Profile Optimization',
    tags: ['bio', 'branding', 'followers'],
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('High Converting Bio', 'Profile Optimization', 4),
    comments: [],
  },
  {
    title: 'The Anatomy of a Viral Reel',
    excerpt: 'From visual hooks to audio trends: why some Reels explode in hours while others stall at 200 views.',
    content: 'Why do some Reels freeze at 200 views while others rocket into the millions? It is all about the first 3 seconds and the Loop Ratio.\n\nTo succeed: \n1) Create a compelling text hook in the first frame. \n2) Use high-contrast dynamic captions. \n3) Select trending, low-saturation atmospheric music tracks. \n4) Keep video length tight (5-7 seconds) so users watch it multiple times, driving your watch-time metric beyond 100%. \n\nThis signals the algorithmic feeds to distribute your post immediately to wider explore channels. Authentic engagement boosts the momentum.',
    category: 'Engagement Services',
    tags: ['viral', 'reels', 'video'],
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('Anatomy of Viral Reel', 'Engagement Services', 2),
    comments: [
      {
        id: 'c-3',
        author: 'Kabir Dev',
        content: 'Brilliant breakdown. Short looping videos literally doubled my reach last week!',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    title: 'Transforming Stories into Sales Pipelines',
    excerpt: 'Learn the exact sequence of Story posts that build deep warmth and drive followers to click your purchase links.',
    content: 'Stories are your primary relationship-building tool. While Feed posts bring new traffic, Stories convert that traffic into revenue and long-term customers. \n\nImplement the Three-Step Story Setup:\n- Step 1: Ask an engaging question using interactive sticker polls to trigger the algorithm.\n- Step 2: Present the core problem faced by your audience and explain your secret solution.\n- Step 3: Introduce your offer with a strong link sticker.\n\nThis sequence drives double-digit conversions compared to cold product links. Establish yourself as an Instagram Marketing Specialist who values real relationships.',
    category: 'Instagram Marketing Tips',
    tags: ['sales', 'stories', 'conversion'],
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    image: generateGradientPlaceholder('Story Sales Pipeline', 'Instagram Marketing Tips', 0),
    comments: []
  }
];

export const useBlogStore = create<BlogState>((set, get) => {
  const collectionRef = collection(db, 'blogs');

  // Real-time snapshot listener
  onSnapshot(collectionRef, async (snapshot) => {
    const list: Blog[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Blog);
    });

    if (list.length === 0) {
      // Local state fallback list to keep layout decorated elegantly
      const seeds = getSeededBlogs().map((b, idx) => ({ id: `seed-${idx}`, ...b })) as Blog[];
      seeds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ blogs: seeds, isLoading: false, error: null });

      // Seeding only if authenticated Administrator loaded the panel
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email?.toLowerCase() === 'beatbounce181@gmail.com') {
        console.log('Verified Administrator authenticated. Seeding Firestore blogs collection...');
        try {
          const seeds = getSeededBlogs();
          for (const seed of seeds) {
            await runWithRetry(() => addDoc(collectionRef, {
              ...seed,
              date: new Date().toISOString()
            }));
          }
        } catch (err) {
          console.error('[Blog Seeding Halted]:', err);
        }
      }
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ blogs: list, isLoading: false, error: null });
    }
  }, (error) => {
    console.warn('[Blogs Listener Fallback Active] Reading locally seeded blogs:', error.message);
    const seeds = getSeededBlogs().map((b, idx) => ({ id: `seed-fallback-${idx}`, ...b })) as Blog[];
    seeds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    set({ blogs: seeds, isLoading: false, error: null });
  });

  return {
    blogs: [],
    isLoading: true,
    error: null,

    addBlog: async (newBlog) => {
      // Rule: Case-insensitive block of SMM
      if (
        containsForbiddenWord(
          newBlog.title,
          newBlog.content,
          newBlog.excerpt,
          newBlog.category,
          newBlog.tags.join(' ')
        )
      ) {
        return {
          success: false,
          error: 'Strict Content Policy Violation: The forbidden word "SMM" is not allowed in titles, content, excerpts, tags, or categories. Please use alternatives like "Instagram Growth", "Engagement Boost", or "Marketing Tips".',
        };
      }

      try {
        const img = newBlog.image || generateGradientPlaceholder(newBlog.title, newBlog.category || 'Blog', 1);
        await runWithRetry(() => addDoc(collectionRef, {
          ...newBlog,
          image: img,
          date: new Date().toISOString(),
          comments: []
        }));
        return { success: true };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'blogs');
        return { success: false, error: error instanceof Error ? error.message : 'Unknown Firestore write error' };
      }
    },

    updateBlog: async (id, updatedFields) => {
      if (updatedFields.title || updatedFields.content || updatedFields.excerpt || updatedFields.category || updatedFields.tags) {
        if (
          containsForbiddenWord(
            updatedFields.title || '',
            updatedFields.content || '',
            updatedFields.excerpt || '',
            updatedFields.category || '',
            (updatedFields.tags || []).join(' ')
          )
        ) {
          return {
            success: false,
            error: 'Strict Content Policy Violation: The forbidden word "SMM" is not allowed. Choose premium terms like "Instagram Growth" instead.',
          };
        }
      }

      try {
        const docRef = doc(db, 'blogs', id);
        await runWithRetry(() => updateDoc(docRef, {
          ...updatedFields,
          updatedAt: new Date().toISOString()
        }));
        return { success: true };
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `blogs/${id}`);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown Firestore update error' };
      }
    },

    deleteBlog: async (id) => {
      try {
        const docRef = doc(db, 'blogs', id);
        await runWithRetry(() => deleteDoc(docRef));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
      }
    },

    addComment: async (blogId, cmd) => {
      try {
        const blogsList = get().blogs;
        const targetBlog = blogsList.find((b) => b.id === blogId);
        if (!targetBlog) return;

        const newComment: Comment = {
          id: 'c-' + Date.now(),
          author: cmd.author || 'Anonymous Guest',
          content: cmd.content,
          date: new Date().toISOString(),
        };

        const updatedComments = [...(targetBlog.comments || []), newComment];
        const docRef = doc(db, 'blogs', blogId);
        
        await runWithRetry(() => updateDoc(docRef, {
          comments: updatedComments
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `blogs/${blogId}/comments`);
      }
    }
  };
});
