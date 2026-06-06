/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, HelpCircle, Inbox } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface ServicesProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onCheckout: (product: Product) => void;
}

export default function Services({ products, onSelectProduct, onCheckout }: ServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Followers', 'Likes', 'Views', 'Comments', 'Combos'];

  // Filter products matching category and search queries
  // Fix previous bug: ALWAYS map and query from the full Zustand array!
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(query) || 
                          p.category.toLowerCase().includes(query) ||
                          p.description.toLowerCase().includes(query);
    
    // Hide expired countdown products from the public services view
    const isNotExpired = !p.enableTimer || !p.expiryDate || new Date(p.expiryDate) > new Date();
    
    return matchesCategory && matchesSearch && isNotExpired;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="services-page-container">
      
      {/* Page Title Header */}
      <div className="space-y-2">
        <h1 className="font-sans text-3xl font-black text-white tracking-tight sm:text-4xl">
          Insta Growth Catalyst
        </h1>
        <p className="text-sm text-white/50 max-w-xl font-medium">
          Select high-authority engagement boosters. Search our active catalog of standalone followers, comments, or promotional combo packs.
        </p>
      </div>

      {/* STICKY SEARCH & FILTERS HEADER BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-dark p-4 md:flex-row md:items-center md:justify-between" id="filter-bar">
        
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search followers, likes, views..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-bg-dark border border-white/10 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-white/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            id="service-search-input"
          />
        </div>

        {/* Categories list pill selector */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-black'
                  : 'bg-bg-dark border border-white/5 text-white/50 hover:border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* SERVICES DISPLAY GRID */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="services-grid">
          {filteredProducts.map((product) => (
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
        /* Empty results state */
        <div className="rounded-2xl border border-dashed border-white/10 py-16 flex flex-col items-center justify-center text-center px-4" id="empty-results">
          <Inbox className="h-12 w-12 text-white/20 animate-pulse mb-3" />
          <h3 className="text-base font-bold text-white">No Growth Packages Found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 leading-relaxed">
            We couldn't locate any active services matching "{searchTerm}" under the {selectedCategory} category. Try refining your keywords or choosing another section.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* BOTTOM TRUTHS BOARD */}
      <div className="rounded-2xl bg-gradient-to-tr from-[#1E1E1E] to-[#0A0A0A] border border-white/5 p-6 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-none">Need custom, bulk bundles for business agencies?</h4>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            If you are an agency managing multiple corporate or verified profiles, contact our customer desk. We can structure custom automated scheduling, split delivery pipelines, and higher discount brackets beyond our listed plans.
          </p>
        </div>
      </div>

    </div>
  );
}
