/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, ShieldCheck, Zap, Star, Sparkles, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onCheckout: (product: Product) => void;
  onNavigate: (tab: string) => void;
}

export default function Home({ products, onSelectProduct, onCheckout, onNavigate }: HomeProps) {
  // Filter out products that have an expired timer
  const activeProducts = products.filter((p) => {
    if (!p.enableTimer || !p.expiryDate) return true;
    return new Date(p.expiryDate) > new Date();
  });

  // Take the top 3 featured items
  const featured = activeProducts.filter((p) => p.isFeatured).slice(0, 3);
  // Fallback to first 3 active if none are marked featured
  const displayFeatured = featured.length > 0 ? featured : activeProducts.slice(0, 3);

  const trustSignals = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: 'Ultra-Instant Refilling',
      description: 'Auto-refill network guarantees zero drop-rates on delivered packages.'
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-secondary text-[#B388FF]" />,
      title: 'No Passwords Required',
      description: 'We prioritize account wellness. Only public handles are used for delivery.'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-accent" />,
      title: 'Algorithmic Warmup',
      description: 'Every subscriber and like mimics genuine user velocity to spike organic reach.'
    }
  ];

  const recentTransactions = [
    'Order #98124: 5K Professional Followers Delivery Completed (Takes 1.2s)',
    'Order #98125: 10K Reels Views Boost Complete - Exploded on Explore (Takes 0.8s)',
    'Order #98126: 250 comments delivered successfully for @fashion_hub (Takes 2s)',
    'Order #98127: Starter Combo activated for @indiaclicks_ - Reach Up 450% (Takes 1.5s)',
    'Order #98128: 10K Followers delivered for Brand Blueprint Blueprint (Takes 5s)',
  ];

  return (
    <div className="space-y-16 py-6 md:py-12" id="home-view-container">
      
      {/* 1. HERO BANNER */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center space-y-8" id="hero-section">
        <div className="absolute top-0 opacity-10 filter blur-[150px] bg-gradient-to-tr from-secondary to-primary h-[350px] w-[350px] rounded-full -z-10" />
        
        {/* Sparkle Ribbon */}
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs text-white/80 font-semibold tracking-wide backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
          <span>Supreme Instagram Reach Optimization Network</span>
        </div>

        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-4xl">
          UNLEASH SUPREME <br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            INSTAGRAM DOMINATION
          </span>
        </h1>

        <p className="font-sans text-sm sm:text-base md:text-lg text-white/60 max-w-2xl leading-relaxed font-semibold">
          Skyrocket your authority overnight. Purchase premium followers, instant likes, comments, and reels views formatted for organic growth. Secure, zero drops, 100% compliant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-4">
          <button
            onClick={() => onNavigate('services')}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-[#00C853] py-4 px-6 text-sm font-bold text-black hover:opacity-95 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            id="hero-services-btn"
          >
            Explore Growth Services
          </button>
          <button
            onClick={() => onNavigate('events')}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-4 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-all hover:-translate-y-0.5"
            id="hero-events-btn"
          >
            Milestone Events
          </button>
        </div>
      </section>

      {/* 2. LIVE DELIVERIES TICKER (MARQUEE) */}
      <section className="relative border-y border-white/10 bg-surface-dark py-4 overflow-hidden" id="marquee-section">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg-dark to-transparent z-10 pointers-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg-dark to-transparent z-10 pointers-events-none" />
        <div className="animate-marquee whitespace-nowrap flex space-x-8">
          {[...recentTransactions, ...recentTransactions].map((tx, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-[11px] font-mono font-bold tracking-wider text-primary uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{tx}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUST SIGNALS PANEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="trust-signals">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold uppercase tracking-widest text-[#B388FF]">Our Pillars of Delivery</h2>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Engineered for client safety and account longevity</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustSignals.map((signal, idx) => (
            <div key={idx} className="rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-dark border border-white/5">
                {signal.icon}
              </div>
              <h3 className="text-base font-bold text-white">{signal.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed font-semibold">{signal.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="featured-products">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Active Flash Campaigns</h2>
            <p className="text-xs text-white/50 font-semibold leading-relaxed mt-1">
              Check out these premium featured boosts containing active promotional timers.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            All Services
          </button>
        </div>

        {displayFeatured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayFeatured.map((product) => (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  onSelect={() => onSelectProduct(product)}
                  onCheckout={() => onCheckout(product)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-surface-dark p-12 text-center text-white/40 font-semibold text-sm">
            No active campaigns found. Please view all catalogs on our Services page.
          </div>
        )}
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12" id="testimonials">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold uppercase tracking-widest text-primary">Creator Circle Feedback</h2>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Real stories from creators who scaled beyond barriers</p>
        </div>

        <div className="grid gap-6 leading-relaxed md:grid-cols-2 lg:grid-cols-3 text-xs">
          
          <div className="rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-4">
            <div className="flex items-center space-x-1.5 text-accent">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent stroke-none" />)}
            </div>
            <p className="text-white/70 italic font-medium leading-relaxed">
              "My reels used to lock up at exactly 2k views. I bought the 20K views package from Deat Sell and applying the extra reach pushed my next video into 2.5 million organic views! Best investment of 2026."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">A</div>
              <div>
                <p className="font-bold text-white">Aditya Sen</p>
                <p className="text-[10px] text-white/40">Travel Vlogger (@adityawanders)</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-4">
            <div className="flex items-center space-x-1.5 text-accent">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent stroke-none" />)}
            </div>
            <p className="text-white/70 italic font-medium leading-relaxed">
              "We run an apparel agency in India. The 10K Followers royal pack completely reformed our storefront. High drop refilling holds strong even after months. Incredible support desk."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center font-bold text-secondary text-[#B388FF]">M</div>
              <div>
                <p className="font-bold text-white">Meera Nair</p>
                <p className="text-[10px] text-white/40">Co-founder, TrendLine India</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-4">
            <div className="flex items-center space-x-1.5 text-accent">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent stroke-none" />)}
            </div>
            <p className="text-white/70 italic font-medium leading-relaxed">
              "Outstanding quality on customs comments. We targets specific tech feedback and the accounts matched perfectly. Fast, offline support checks are seamless."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">N</div>
              <div>
                <p className="font-bold text-white">Nikunj Patel</p>
                <p className="text-[10px] text-white/40">Tech Producer, GeekSphere</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
