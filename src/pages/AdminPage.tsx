/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { 
  Sparkles, 
  Trash2, 
  PlusCircle, 
  Tag, 
  Calendar, 
  ShoppingBag, 
  CheckCircle, 
  DollarSign, 
  ShieldAlert, 
  FileText, 
  Clock, 
  AlertTriangle,
  Link2,
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { useEventStore } from '../stores/eventStore';
import { useBlogStore } from '../stores/blogStore';
import { useAdminStore } from '../stores/adminStore';
import { Product, EventOffer, Blog } from '../types';
import { formatINR } from '../utils/currencyFormatter';
import ImageUploader from '../components/ImageUploader';
import { toast } from 'sonner';

type AdminTab = 'products' | 'events' | 'blogs';

export default function AdminPage() {
  const { isAuthenticated, logout } = useAdminStore();
  const { products, addProduct, deleteProduct } = useProductStore();
  const { events, addEvent, deleteEvent } = useEventStore();
  const { blogs, addBlog, deleteBlog } = useBlogStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Confirmation Modals State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'product' | 'event' | 'blog' | null>(null);

  // Forms Content States

  // 1. Product Form
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('Followers');
  const [pDelivery, setPDelivery] = useState('Instant');
  const [pImage, setPImage] = useState('');
  const [pEnableTimer, setPEnableTimer] = useState(false);
  const [pExpiry, setPExpiry] = useState('');
  const [pChatOnly, setPChatOnly] = useState(false);
  const [pInstaLink, setPInstaLink] = useState('https://instagram.com');
  const [pWhatsAppLink, setPWhatsAppLink] = useState('https://wa.me/919999999999');
  const [pMessengerLink, setPMessengerLink] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(true);

  // 2. Event Form
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCode, setECode] = useState('');
  const [ePercent, setEPercent] = useState('');
  const [eExpiry, setEExpiry] = useState('');
  const [eImage, setEImage] = useState('');
  const [eExternalUrl, setEExternalUrl] = useState('');

  // 3. Blog Form
  const [bTitle, setBTitle] = useState('');
  const [bExcerpt, setBExcerpt] = useState('');
  const [bContent, setBContent] = useState('');
  const [bCategory, setBCategory] = useState('Instagram Growth');
  const [bTags, setBTags] = useState('');
  const [bImage, setBImage] = useState('');
  const [bExternalUrl, setBExternalUrl] = useState('');

  // SMM rule helper
  const isSMMUsage = (...texts: string[]): boolean => {
    const regex = /\bsmm\b/i;
    return texts.some((t) => regex.test(t));
  };

  // Submit Handlers

  // Product Add Submission
  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim() || !pPrice) {
      toast.error('Title and price are mandatory inputs.');
      return;
    }

    const priceNum = Number(pPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please input a valid numeric price.');
      return;
    }

    // Capture state and compile
    addProduct({
      title: pTitle.trim(),
      description: pDesc.trim() || 'No description supplied.',
      price: priceNum,
      category: pCategory,
      deliveryTime: pDelivery.trim() || 'Instant',
      image: pImage, 
      enableTimer: pEnableTimer,
      expiryDate: pEnableTimer && pExpiry ? new Date(pExpiry).toISOString() : '',
      isChatOnly: pChatOnly,
      instagramLink: pInstaLink.trim(),
      whatsappLink: pWhatsAppLink.trim(),
      messengerLink: pMessengerLink.trim(),
      isFeatured: pIsFeatured,
    });

    toast.success('Product package created successfully inside persistent storage!');
    
    // Clear Form Fields
    setPTitle('');
    setPDesc('');
    setPPrice('');
    setPDelivery('Instant');
    setPImage('');
    setPEnableTimer(false);
    setPExpiry('');
    setPChatOnly(false);
    setPInstaLink('https://instagram.com');
    setPWhatsAppLink('https://wa.me/919999999999');
    setPMessengerLink('');
  };

  // Event Add Submission
  const handleAddEventSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!eTitle.trim() || !eCode.trim() || !ePercent || !eExpiry) {
      toast.error('Title, unique code, percentage, and expiry timestamp are mandatory fields.');
      return;
    }

    const pct = Number(ePercent);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      toast.error('Discount percentage must fall between 1 and 100.');
      return;
    }

    addEvent({
      title: eTitle.trim(),
      description: eDesc.trim(),
      discountCode: eCode.trim().toUpperCase(),
      discountPercent: pct,
      expiryDate: new Date(eExpiry).toISOString(),
      image: eImage,
      externalUrl: eExternalUrl.trim() || undefined,
    });

    toast.success('Event campaign published instantly and is live!');
    setETitle('');
    setEDesc('');
    setECode('');
    setEPercent('');
    setEExpiry('');
    setEImage('');
    setEExternalUrl('');
  };

  // Blog Add Submission (applying NO SMM Rule)
  const handleAddBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bContent.trim() || !bExcerpt.trim()) {
      toast.error('Title, Excerpt, and body values are required.');
      return;
    }

    // Run SMM text check
    const tagsArr = bTags.split(',').map((t) => t.trim());
    if (
      isSMMUsage(bTitle, bContent, bExcerpt, bCategory, tagsArr.join(' '))
    ) {
      toast.error('Content Rule Violation: The acronym "SMM" is strictly prohibited in educational blogs! Choose premium terms.');
      return;
    }

    const result = await addBlog({
      title: bTitle.trim(),
      excerpt: bExcerpt.trim(),
      content: bContent.trim(),
      category: bCategory,
      tags: tagsArr,
      image: bImage,
      externalUrl: bExternalUrl.trim() || undefined,
    });

    if (result.success) {
      toast.success('Educational growth blueprint published successfully!');
      setBTitle('');
      setBExcerpt('');
      setBContent('');
      setBTags('');
      setBImage('');
      setBExternalUrl('');
    } else {
      toast.error(result.error || 'Failed to publish blog.');
    }
  };

  // Delete Core Handlers
  const triggerDelete = (id: string, type: 'product' | 'event' | 'blog') => {
    setDeleteId(id);
    setDeleteType(type);
  };

  const confirmDeleteAction = () => {
    if (!deleteId || !deleteType) return;

    if (deleteType === 'product') {
      deleteProduct(deleteId);
      toast.success('Product item deleted instantly from the catalog.');
    } else if (deleteType === 'event') {
      deleteEvent(deleteId);
      toast.success('Event campaign offer deleted successfully.');
    } else if (deleteType === 'blog') {
      deleteBlog(deleteId);
      toast.success('Educational blog draft purged.');
    }

    setDeleteId(null);
    setDeleteType(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="admin-hub-container">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="font-sans text-3xl font-black text-white tracking-tight flex items-center space-x-2">
            <Sparkles className="h-7 w-7 text-primary" />
            <span>Operator Terminal</span>
          </h1>
          <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mt-1">
            Realtime catalog orchestration • Firebase Security Active
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-xs font-bold text-white hover:bg-white/10 transition-colors shrink-0"
        >
          Logout Session
        </button>
      </div>

      {/* DASHBOARD TAB NAVIGATORS */}
      <div className="flex space-x-1.5 border-b border-white/5 pb-1">
        {(['products', 'events', 'blogs'] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab
                ? 'text-primary border-primary bg-primary/5'
                : 'text-white/40 border-transparent hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. MAIN ACTIVE TABS */}

      {/* PRODUCTS TAB MODULE */}
      {activeTab === 'products' && (
        <div className="grid gap-8 lg:grid-cols-3" id="admin-products-tab">
          
          {/* Form Create Section */}
          <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-5 h-fit">
            <h3 className="font-black text-base text-white flex items-center space-x-1.5">
              <PlusCircle className="h-5 w-5 text-primary" />
              <span>Compose Service</span>
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5,000 High-Quality Followers"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Service Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain refill rates, retention periods, and drop safeties..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="299"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Followers">Followers</option>
                    <option value="Likes">Likes</option>
                    <option value="Views">Views</option>
                    <option value="Comments">Comments</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Delivery Speed</label>
                  <input
                    type="text"
                    placeholder="e.g. Instant (10m) / Drip"
                    value={pDelivery}
                    onChange={(e) => setPDelivery(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end pb-1.5 pl-2">
                  <label className="relative flex items-center space-x-2 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={pIsFeatured}
                      onChange={(e) => setPIsFeatured(e.target.checked)}
                      className="rounded border-white/10 bg-bg-dark p-1 text-primary focus:ring-primary accent-primary text-xs"
                    />
                    <span className="uppercase tracking-wider text-[10px] text-white/50">Feature Banner</span>
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid gap-3 grid-cols-2 border-t border-white/5 pt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pEnableTimer}
                    onChange={(e) => setPEnableTimer(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Active Timer</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pChatOnly}
                    onChange={(e) => setPChatOnly(e.target.checked)}
                    className="accent-accent"
                  />
                  <span className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Chat-Only Call</span>
                </label>
              </div>

              {pEnableTimer && (
                <div className="space-y-1 animate-pulse border border-[#FFD700]/10 rounded-xl p-3 bg-[#FFD700]/5">
                  <label className="font-bold text-[#FFD700] uppercase tracking-wider text-[10px]">Expiry Stamp *</label>
                  <input
                    type="datetime-local"
                    required={pEnableTimer}
                    value={pExpiry}
                    onChange={(e) => setPExpiry(e.target.value)}
                    className="w-full rounded-lg bg-bg-dark border border-white/10 px-2 py-1.5 text-xs text-white uppercase focus:outline-none"
                  />
                </div>
              )}

              {/* Operations Direct links */}
              <div className="border-t border-white/5 pt-3 space-y-3">
                <span className="font-bold text-white/40 uppercase tracking-widest text-[9px] block">Operations Desk Relays</span>
                
                <div className="space-y-1.5">
                  <label className="font-bold text-white/40 tracking-wider text-[10px]">WhatsApp Route</label>
                  <input
                    type="text"
                    placeholder="https://wa.me/919999999999"
                    value={pWhatsAppLink}
                    onChange={(e) => setPWhatsAppLink(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/40 tracking-wider text-[10px]">Instagram DM Option (Profile link)</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/deatsell.growth"
                    value={pInstaLink}
                    onChange={(e) => setPInstaLink(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/40 tracking-wider text-[10px]">Messenger Route</label>
                  <input
                    type="text"
                    placeholder="https://m.me/deatsell"
                    value={pMessengerLink}
                    onChange={(e) => setPMessengerLink(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Compressor Image upload */}
              <ImageUploader 
                onImageUploaded={(b64) => setPImage(b64)} 
                currentImage={pImage} 
                onClear={() => setPImage('')}
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-3 font-sans text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-95 hover:scale-[1.01] transition-all"
              >
                Publish New Boost Package
              </button>
            </form>
          </div>

          {/* Table List Section */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-surface-dark p-6 h-fit space-y-4">
            <h3 className="font-black text-base text-white">Active Service Catalogs ({products.length})</h3>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-white/5 rounded-xl">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-bg-dark text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      <tr>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Price</th>
                        <th className="px-4 py-3 text-center">Deletes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-white/70">
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <img src={prod.image} alt="" className="h-8 w-8 rounded object-cover bg-black" referrerPolicy="no-referrer" />
                              <div className="max-w-[180px] truncate">
                                <span className="font-bold text-white block truncate">{prod.title}</span>
                                <span className="font-mono text-[9px] text-white/30">{prod.deliveryTime}</span>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="rounded bg-white/5 px-2 py-0.5 font-bold uppercase text-[9px] text-[#B388FF]">
                              {prod.category}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-bold text-primary">
                            {formatINR(prod.price)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <button
                              onClick={() => triggerDelete(prod.id, 'product')}
                              className="rounded p-1.5 text-white/30 hover:bg-accent/15 hover:text-accent transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* EVENTS TAB MODULE */}
      {activeTab === 'events' && (
        <div className="grid gap-8 lg:grid-cols-3" id="admin-events-tab">
          
          {/* Create Form */}
          <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-5 h-fit text-xs">
            <h3 className="font-black text-base text-white flex items-center space-x-1.5">
              <Tag className="h-5 w-5 text-primary" />
              <span>Compose Campaign Offer</span>
            </h3>

            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day Rush"
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Short description *</label>
                <textarea
                  rows={2}
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                  placeholder="Explain event, discount application targets..."
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Voucher code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GROWTH50"
                    value={eCode}
                    onChange={(e) => setECode(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-bold uppercase text-white focus:border-primary focus:outline-none placeholder-white/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Discount (%) *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={ePercent}
                    onChange={(e) => setEPercent(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Expiry Stamp *</label>
                <input
                  type="datetime-local"
                  required
                  value={eExpiry}
                  onChange={(e) => setEExpiry(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Campaign Link / Action URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://instagram.com/p/example"
                  value={eExternalUrl}
                  onChange={(e) => setEExternalUrl(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none placeholder-white/20"
                />
              </div>

              <ImageUploader
                onImageUploaded={(b64) => setEImage(b64)}
                currentImage={eImage}
                onClear={() => setEImage('')}
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-3 font-sans text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-95 transition-all"
              >
                Launch Live Event Campaign
              </button>
            </form>
          </div>

          {/* List existing */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-surface-dark p-6 h-fit space-y-4">
            <h3 className="font-black text-base text-white">Launched Promo Events ({events.length})</h3>

            <div className="grid gap-4">
              {events.map((evt) => {
                const isDead = new Date(evt.expiryDate) < new Date();
                return (
                  <div key={evt.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-bg-dark rounded-xl border border-white/5 gap-4 text-xs font-semibold">
                    <div className="flex items-center space-x-3">
                      <img src={evt.image} alt="" className="h-12 w-12 rounded object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">{evt.title}</h4>
                        <p className="text-[10px] text-white/40 flex items-center space-x-1.5 mt-1">
                          <span>Voucher Code: <strong className="text-primary">{evt.discountCode}</strong></span>
                          <span>•</span>
                          <span>Unlocks {evt.discountPercent}% OFF</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      {isDead ? (
                        <span className="rounded bg-accent/15 px-2.5 py-0.5 text-[9px] font-bold text-accent uppercase">Ended</span>
                      ) : (
                        <span className="rounded bg-primary/10 px-2.5 py-0.5 text-[9px] font-extrabold text-primary uppercase animate-pulse">Running</span>
                      )}
                      
                      <button
                        onClick={() => triggerDelete(evt.id, 'event')}
                        className="rounded p-1.5 text-white/30 hover:bg-accent/15 hover:text-accent transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* BLOGS TAB MODULE */}
      {activeTab === 'blogs' && (
        <div className="grid gap-8 lg:grid-cols-3" id="admin-blogs-tab">
          
          {/* Create Blog form */}
          <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-surface-dark p-6 space-y-5 h-fit text-xs">
            <h3 className="font-black text-base text-white flex items-center space-x-1.5">
              <FileText className="h-5 w-5 text-primary" />
              <span>Compose Growth Blueprint</span>
            </h3>

            {/* Content Policies banner */}
            <div className="rounded-xl border border-[#00C853]/20 bg-[#00C853]/5 p-3 text-[10px] text-primary leading-relaxed">
              <strong>⚠ Strict Compliance Filter Active:</strong> References to the blocked word "SMM" inside title, content, fields, excerpts or labels will automatically trigger state rejections. Promote premium alternatives.
            </div>

            <form onSubmit={handleAddBlogSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unlocking the Instagram Algorithm in 2026"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Brief Summary Excerpt *</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the core learnings and strategies..."
                  value={bExcerpt}
                  onChange={(e) => setBExcerpt(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Article Written Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type full insights here. Do NOT mention SMM."
                  value={bContent}
                  onChange={(e) => setBContent(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Category Label</label>
                  <select
                    value={bCategory}
                    onChange={(e) => setBCategory(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Instagram Strategy">Instagram Strategy</option>
                    <option value="Profile Optimization">Profile Optimization</option>
                    <option value="Engagement Services">Engagement Services</option>
                    <option value="Instagram Marketing Tips">Instagram Marketing Tips</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Tags (Comma split)</label>
                  <input
                    type="text"
                    placeholder="reels, virality, metrics"
                    value={bTags}
                    onChange={(e) => setBTags(e.target.value)}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white/40 uppercase tracking-wider text-[10px]">Reference Link / Additional Article URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://example.com/deep-dive"
                  value={bExternalUrl}
                  onChange={(e) => setBExternalUrl(e.target.value)}
                  className="w-full rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2.5 font-semibold text-white focus:border-primary focus:outline-none placeholder-white/20"
                />
              </div>

              <ImageUploader
                onImageUploaded={(b64) => setBImage(b64)}
                currentImage={bImage}
                onClear={() => setBImage('')}
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-3 font-sans text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-95 transition-all"
              >
                Publish Strategy Blueprint
              </button>
            </form>
          </div>

          {/* List blogs */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-surface-dark p-6 h-fit space-y-4">
            <h3 className="font-black text-base text-white">Drafted Blueprints ({blogs.length})</h3>

            <div className="grid gap-4">
              {blogs.map((b) => (
                <div key={b.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-bg-dark rounded-xl border border-white/5 gap-4 text-xs font-semibold">
                  <div className="flex items-center space-x-3">
                    <img src={b.image} alt="" className="h-12 w-12 rounded object-cover" referrerPolicy="no-referrer" />
                    <div className="max-w-xs md:max-w-md truncate">
                      <h4 className="font-bold text-sm text-white truncate leading-tight">{b.title}</h4>
                      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">Category: {b.category}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerDelete(b.id, 'blog')}
                    className="rounded p-1.5 text-white/30 hover:bg-accent/15 hover:text-accent transition-colors shrink-0"
                    title="Purge Blog"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. CORE MODAL DELETE CONFIRMATION SYSTEM */}
      {deleteId && deleteType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="delete-modal-backdrop">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface-dark p-6 text-center space-y-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <AlertTriangle className="h-6 w-6 stroke-2" />
            </div>

            <div className="space-y-2">
              <h3 className="font-sans text-base font-extrabold text-white">Confirm Absolute Deletion?</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Are you completely sure you want to remove this <strong>{deleteType}</strong> from local storage? This action is instant, irreversible, and clears the item from all dashboards.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteId(null);
                  setDeleteType(null);
                }}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
              >
                Cancel Lock
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 rounded-xl bg-accent py-2.5 text-xs font-bold text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/15"
                id="modal-confirm-delete-btn"
              >
                Verify Destruction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
