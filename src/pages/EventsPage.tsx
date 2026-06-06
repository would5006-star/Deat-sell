/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gift, Copy, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { useEventStore } from '../stores/eventStore';
import Timer from '../components/Timer';
import { toast } from 'sonner';

interface EventsPageProps {
  onNavigate: (tab: string) => void;
}

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const { events } = useEventStore();

  // Strict Rule: Expired events must be filtered and hidden from public shoppers
  const activeEvents = events.filter((evt) => {
    return new Date(evt.expiryDate) > new Date();
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard! Apply it at checkout.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="events-view-container">
      
      {/* Title block */}
      <div className="space-y-2">
        <h1 className="font-sans text-3xl font-black text-white tracking-tight sm:text-4xl">
          Active Milestone Specials
        </h1>
        <p className="text-sm text-white/50 max-w-xl font-medium">
          Copy high-value promo codes during active countdowns to claim major price drop discounts on target Instagram growth packs.
        </p>
      </div>

      {/* Events Listing List */}
      {activeEvents.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2" id="events-display-grid">
          {activeEvents.map((evt) => (
            <div 
              key={evt.id} 
              className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-dark transition-all duration-300 hover:border-[#6200EA]/20"
              id={`event-card-${evt.id}`}
            >
              
              {/* Event Cover Image with countdown */}
              <div className="relative aspect-video w-full bg-bg-dark">
                <img 
                  src={evt.image} 
                  alt={evt.title} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-85" />
                
                {/* Absolute status timer */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Timer 
                    expiryDateStr={evt.expiryDate} 
                    className="bg-black/85 backdrop-blur-md border border-[#FFD700]/15 w-full justify-center rounded-xl py-1.5 px-3" 
                  />
                </div>

                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center space-x-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-secondary/10">
                    <Sparkles className="h-3 w-3 animate-spin mr-1" />
                    <span>Active Promo</span>
                  </span>
                </div>
              </div>

              {/* Event copy info panel */}
              <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">{evt.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-2 font-semibold">
                    {evt.description}
                  </p>
                </div>

                {/* Voucher code segment box */}
                <div className="bg-bg-dark border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Voucher Code</span>
                    <p className="text-sm font-extrabold text-primary tracking-wide uppercase">{evt.discountCode}</p>
                  </div>
                  
                  <button
                    onClick={() => handleCopyCode(evt.discountCode)}
                    className="flex items-center space-x-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-neutral-800"
                    title="Copy Discount Code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                {/* Additional Discount Highlight */}
                <div className="flex items-center justify-between pt-1 mt-auto">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white/50">
                    <Gift className="h-4 w-4 text-accent" />
                    <span>Unlocks <span className="text-white font-extrabold">{evt.discountPercent}% OFF</span> orders</span>
                  </div>

                  <button
                    onClick={() => onNavigate('services')}
                    className="flex items-center space-x-1 rounded-lg text-xs font-bold text-primary hover:underline hover:text-primary/95"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>View eligible packages</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty States if no ongoing campaigns are online */
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center flex flex-col items-center justify-center px-4" id="empty-events">
          <AlertCircle className="h-10 w-10 text-white/20 animate-pulse mb-3" />
          <h3 className="text-base font-bold text-white">No Event Campaigns Currently Scheduled</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 leading-relaxed">
            All promotional event countdowns have finished. Our team periodically launches limited flash milestones. Check back here during weekends to secure massive discount drops!
          </p>
          <button
            onClick={() => onNavigate('services')}
            className="mt-5 rounded-xl bg-primary py-3 px-6 text-xs font-bold text-black shadow-lg shadow-primary/10 hover:opacity-95 transition-all"
          >
            Go to Standard Services
          </button>
        </div>
      )}

    </div>
  );
}
