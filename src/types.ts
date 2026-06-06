/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string; // Followers, Likes, Views, Comments, Reels, Combos
  deliveryTime: string;
  image: string; // Base64 compressed image
  enableTimer: boolean;
  expiryDate: string; // ISO date-time string
  isChatOnly: boolean;
  instagramLink?: string;
  whatsappLink?: string;
  messengerLink?: string;
  isFeatured?: boolean;
}

export interface EventOffer {
  id: string;
  title: string;
  description: string;
  discountCode: string;
  discountPercent: number;
  expiryDate: string; // ISO date-time string
  image: string; // Base64
  externalUrl?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string; // ISO date-time string
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string; // ISO date-time string
  comments: Comment[];
  image: string; // Base64
  externalUrl?: string;
}

export interface AdminSettings {
  isAuthenticated: boolean;
  lastActive?: string;
}
