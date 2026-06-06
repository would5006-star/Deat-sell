/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, MessageSquare, MessageCircle, Instagram, Clock, Zap } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currencyFormatter';
import Timer from './Timer';

// URL Helpers for Direct Chat Link routing
const getWhatsAppUrl = (p: Product) => {
  const rawTarget = p.whatsappLink || '';
  if (!rawTarget) return '#';
  
  if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
    if (rawTarget.includes('text=')) {
      return rawTarget;
    }
    const text = `Hello DeatSell! I am interested in inquiring about "${p.title}". Let's arrange details!`;
    return `${rawTarget}${rawTarget.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
  }
  
  const phoneNo = rawTarget.replace(/[^0-9]/g, '');
  const text = `Hello DeatSell! I am interested in inquiring about "${p.title}". Let's arrange details!`;
  return `https://api.whatsapp.com/send?phone=${phoneNo || '919999999999'}&text=${encodeURIComponent(text)}`;
};

const getInstagramUrl = (p: Product) => {
  const link = p.instagramLink || '';
  if (!link) return '#';
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link;
  }
  return `https://instagram.com/${link.replace('@', '')}`;
};

const getMessengerUrl = (p: Product) => {
  const link = p.messengerLink || '';
  if (!link) return '#';
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link;
  }
  return `https://m.me/${link}`;
};

interface ProductCardProps {
  product: Product;
  onSelect: () => void;
  onCheckout: () => void;
}

export default function ProductCard({ product, onSelect, onCheckout }: ProductCardProps) {
  // Check if expiration is active
  const isTimerActive = product.enableTimer && product.expiryDate;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-dark transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
      id={`product-card-${product.id}`}
    >
      
      {/* Dynamic Image container */}
      <div 
        className="relative aspect-video w-full cursor-pointer overflow-hidden bg-bg-dark"
        onClick={onSelect}
      >
        <img 
          src={product.image} 
          alt={product.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-60" />
        
        {/* Category Pill Badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary uppercase backdrop-blur-md border border-white/5">
            {product.category}
          </span>
        </div>

        {/* Dynamic Countdown Ribbon inside Card banner */}
        {isTimerActive && (
          <div className="absolute bottom-3 left-3 right-3">
            <Timer 
              expiryDateStr={product.expiryDate} 
              className="bg-black/80 backdrop-blur-md border border-white/10 w-full justify-center rounded-lg py-1 px-2.5" 
            />
          </div>
        )}
      </div>

      {/* Card Information */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Title */}
        <h3 
          className="line-clamp-1 cursor-pointer font-sans text-base font-bold text-white transition-colors hover:text-primary"
          onClick={onSelect}
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Shortened description */}
        <p className="mt-2 line-clamp-2 text-xs text-white/50 leading-relaxed">
          {product.description}
        </p>

        {/* Speed indicators */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3 text-[11px] font-semibold text-white/40">
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-secondary" />
            <span>Speed: {product.deliveryTime}</span>
          </span>
          <span className="flex items-center space-x-1 text-primary">
            <Zap className="h-3 w-3 fill-primary/10" />
            <span>Refills Approved</span>
          </span>
        </div>

        {/* Price & CTA Section */}
        <div className="mt-auto pt-5 flex items-center justify-between">
          <div className="flex flex-col">
            {product.isChatOnly ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Inquiry Only</span>
                <span className="text-sm font-black text-white/80 tracking-tight leading-none pt-1">
                  Custom Plan Design
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Total Price</span>
                <span className="text-xl font-extrabold text-white tracking-tight leading-none pt-1">
                  {formatINR(product.price)}
                </span>
              </>
            )}
          </div>

          {product.isChatOnly ? (
            <div className="flex items-center gap-1.5" id={`chat-options-${product.id}`}>
              {/* WhatsApp Button */}
              {product.whatsappLink && product.whatsappLink.trim() !== '' && (
                <a
                  href={getWhatsAppUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/25 hover:border-green-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  title="Chat on WhatsApp"
                  id={`btn-wa-${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {/* Instagram Button */}
              {product.instagramLink && product.instagramLink.trim() !== '' && (
                <a
                  href={getInstagramUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1306c]/10 border border-[#e1306c]/20 text-pink-400 hover:bg-[#e1306c]/25 hover:border-[#e1306c]/40 hover:-translate-y-0.5 transition-all duration-200"
                  title="Chat on Instagram"
                  id={`btn-ig-${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {/* Messenger Button */}
              {product.messengerLink && product.messengerLink.trim() !== '' && (
                <a
                  href={getMessengerUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  title="Chat on Messenger"
                  id={`btn-messenger-${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
              )}
              {/* Fallback Inquire button if absolutely nothing is configured */}
              {(!product.whatsappLink && !product.instagramLink && !product.messengerLink) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckout();
                  }}
                  id={`btn-chat-${product.id}`}
                  className="flex items-center space-x-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Inquire</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onCheckout}
              id={`btn-buy-${product.id}`}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-primary to-[#00E676] px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:opacity-95"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Secure Boost</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
