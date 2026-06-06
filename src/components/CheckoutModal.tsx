/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  CreditCard, 
  Send, 
  CheckCircle, 
  Gift, 
  Loader2, 
  MessageCircle, 
  Instagram, 
  MessageSquare
} from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currencyFormatter';
import { useEventStore } from '../stores/eventStore';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
}

type CheckoutStep = 'review' | 'profile' | 'payment' | 'success';

export default function CheckoutModal({ product, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramError, setInstagramError] = useState('');
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // Percentage
  const [couponError, setCouponError] = useState('');
  const [appliedCodeLabel, setAppliedCodeLabel] = useState('');

  // Payment Options
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');

  // Store
  const { events } = useEventStore();

  // Price Calculations
  const discountAmount = Math.round((product.price * appliedDiscount) / 100);
  const finalPrice = product.price - discountAmount;
  const orderId = 'DS-' + Math.floor(100000 + Math.random() * 900000);

  // Apply Promo code
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    // Lookup in store-persisted events for matching valid coupon
    const matchedEvent = events.find(
      (evt) => evt.discountCode.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (matchedEvent) {
      // Check expiry of coupon event
      if (new Date(matchedEvent.expiryDate) < new Date()) {
        setCouponError('This coupon code is expired!');
        return;
      }
      setAppliedDiscount(matchedEvent.discountPercent);
      setAppliedCodeLabel(matchedEvent.discountCode.toUpperCase());
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try GROWTH50, REELS30, or active codes.');
    }
  };

  // Profile link verification
  const handleValidateProfile = () => {
    setInstagramError('');
    const cleaned = instagramHandle.trim();
    if (!cleaned) {
      setInstagramError('Instagram Link/Handle is mandatory to deliver resources.');
      return;
    }

    if (cleaned.length < 3) {
      setInstagramError('Please enter a valid Instagram account handle or profile URL.');
      return;
    }

    if (product.isChatOnly) {
      setStep('success');
    } else {
      setStep('payment');
    }
  };

  // Simulate payment
  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setPaymentStatusMessage('Connecting to secure banking gateway...');

    setTimeout(() => {
      setPaymentStatusMessage('Awaiting token confirmation from NPCI servers...');
      setTimeout(() => {
        setPaymentStatusMessage('Verifying digital signature and secure escrow ledger...');
        setTimeout(() => {
          setIsProcessingPayment(false);
          setStep('success');
        }, 1200);
      }, 1000);
    }, 1000);
  };

  // Pre-formatted chat links for confirmations based on product state
  const getWhatsAppMessageUrl = () => {
    const rawTarget = product.whatsappLink || 'https://wa.me/919999999999';
    // Base URL extractor
    const phoneNo = rawTarget.includes('wa.me/') 
      ? rawTarget.split('wa.me/')[1].replace(/[^0-9]/g, '') 
      : '919999999999';

    const text = product.isChatOnly
      ? `Hello DeatSell! I am interested in inquiring about "${product.title}" for my profile "${instagramHandle}". Let's arrange details!`
      : `Hello DeatSell! I just purchased "${product.title}" (Order *#${orderId}*) for ${formatINR(finalPrice)} targeting profile "${instagramHandle}". Please expedite my boost!`;
    return `https://api.whatsapp.com/send?phone=${phoneNo}&text=${encodeURIComponent(text)}`;
  };

  const getInstagramMessageUrl = () => {
    return product.instagramLink || 'https://instagram.com';
  };

  const getMessengerMessageUrl = () => {
    return product['messengerLink'] || 'https://m.me/deatsell.growth';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="checkout-modal-backdrop">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-surface-dark shadow-2xl transition-all"
        id="checkout-modal-card"
      >
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-sans text-base font-bold text-white uppercase tracking-wider">
              {step === 'success' ? 'Order Accomplished' : 'Secure Checkout'}
            </h2>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              id="checkout-close-btn"
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dynamic Progress indicator */}
        {step !== 'success' && (
          <div className="bg-bg-dark h-1.5 w-full flex">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{
                width: step === 'review' ? '33.33%' : step === 'profile' ? '66.66%' : '100%'
              }}
            />
          </div>
        )}

        {/* Content Step Boxes */}
        <div className="p-6">

          {/* STEP 1: REVIEW */}
          {step === 'review' && (
            <div className="space-y-5" id="step-review">
              
              {/* Product recap box */}
              <div className="flex items-start space-x-4 rounded-xl bg-bg-dark p-4 border border-white/5">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="h-16 w-16 rounded-lg object-cover bg-surface-dark border border-white/5"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                    {product.category}
                  </span>
                  <h4 className="mt-1 font-bold text-sm text-white truncate">{product.title}</h4>
                  <p className="text-xs text-white/40 font-semibold">Delivery Time: {product.deliveryTime}</p>
                </div>
              </div>

              {/* Promo details or Chat instructions */}
              {product.isChatOnly ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-white/70 space-y-2">
                  <div className="flex items-center space-x-2 text-primary">
                    <MessageSquare className="h-4 w-4" />
                    <p className="font-extrabold text-white uppercase tracking-wider text-[10px] text-primary">⚡ Chat-Only Service Package</p>
                  </div>
                  <p>
                    This is an exclusive contact-inquiry plan. You will be routed directly to the configured operator channels to discuss customized options, deliverables, and customized timings. No online payment processes occur in this flow.
                  </p>
                </div>
              ) : (
                <>
                  {/* Coupon inputs */}
                  <div className="space-y-1.5">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Gift className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                        <input
                          type="text"
                          placeholder="ENTER EVENT COUPON (e.g. GROWTH50)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full rounded-xl bg-bg-dark border border-white/10 pl-9 pr-4 py-2.5 text-xs font-bold text-white placeholder-white/30 uppercase tracking-widest focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 font-sans text-xs font-bold text-white hover:bg-white/10 transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedDiscount > 0 && (
                      <p className="text-xs font-bold text-primary">
                        ✓ Code <span className="underline">{appliedCodeLabel}</span> applied! {appliedDiscount}% discount loaded.
                      </p>
                    )}
                    {couponError && (
                      <p className="text-xs font-semibold text-accent">{couponError}</p>
                    )}
                  </div>

                  {/* Price summary table */}
                  <div className="space-y-2 rounded-xl bg-bg-dark/40 p-4 border border-white/5 text-xs font-semibold">
                    <div className="flex justify-between text-white/50">
                      <span>Regular Service Price</span>
                      <span>{formatINR(product.price)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount Included ({appliedDiscount}%)</span>
                        <span>-{formatINR(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-extrabold text-white">
                      <span>Total Amount (Final)</span>
                      <span className="text-primary">{formatINR(finalPrice)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Proceed CTA */}
              <button
                onClick={() => setStep('profile')}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-black shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5"
              >
                <span>{product.isChatOnly ? 'Provide Identity Reference' : 'Provide Delivery Target'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          )}

          {/* STEP 2: PROFILE TARGET */}
          {step === 'profile' && (
            <div className="space-y-5" id="step-profile">
              <div className="text-center">
                <h3 className="font-bold text-base text-white">Where should we deliver the growth?</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Enter your Instagram username link or handle below. Do NOT enter passwords. Your profile must be public during deliveries.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                  Instagram Link or Username (Mandatory)
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                  <input
                    type="text"
                    required
                    placeholder="@username or https://instagram.com/profile"
                    value={instagramHandle}
                    onChange={(e) => {
                      setInstagramHandle(e.target.value);
                      setInstagramError('');
                    }}
                    className="w-full rounded-xl bg-bg-dark border border-white/10 pl-10 pr-4 py-3 text-sm font-sans font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>
                {instagramError && (
                  <p className="text-xs font-bold text-accent">{instagramError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleValidateProfile}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-black hover:opacity-95 shadow-lg shadow-primary/10 transition-all"
                >
                  Confirm Target
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FAKE CRYPTO/MERCHANT GATEWAY */}
          {step === 'payment' && (
            <div className="space-y-5" id="step-payment">
              <div className="text-center">
                <h3 className="font-bold text-base text-white">Select Secure Local Gateway</h3>
                <p className="text-xs text-white/50 mt-1">
                  Choose a sandbox method to finalize order. No real money required in frontend-only simulator.
                </p>
              </div>

              {/* Secure simulation choice list */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 border transition-all text-xs font-bold ${
                    selectedPaymentMethod === 'upi'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-white/5 bg-bg-dark text-white/70 hover:border-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Check className={`h-4 w-4 rounded-full ${selectedPaymentMethod === 'upi' ? 'bg-primary/20 text-primary p-0.5' : 'text-transparent'}`} />
                    <span>Instant UPI (Google Pay, PhonePe, Paytm QR)</span>
                  </span>
                  <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-primary">No Fees</span>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 border transition-all text-xs font-bold ${
                    selectedPaymentMethod === 'card'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-white/5 bg-bg-dark text-white/70 hover:border-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Check className={`h-4 w-4 rounded-full ${selectedPaymentMethod === 'card' ? 'bg-primary/20 text-primary p-0.5' : 'text-transparent'}`} />
                    <span>Credit / Debit Card (Visa, RuPay, MasterCard)</span>
                  </span>
                  <CreditCard className="h-4 w-4 text-white/40" />
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod('netbanking')}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 border transition-all text-xs font-bold ${
                    selectedPaymentMethod === 'netbanking'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-white/5 bg-bg-dark text-white/70 hover:border-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Check className={`h-4 w-4 rounded-full ${selectedPaymentMethod === 'netbanking' ? 'bg-primary/20 text-primary p-0.5' : 'text-transparent'}`} />
                    <span>Netbanking (HDFC, ICICI, SBI)</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                </button>
              </div>

              {/* Bank gateway simulation loading layer */}
              {isProcessingPayment ? (
                <div className="rounded-xl bg-bg-dark p-4 border border-white/5 flex flex-col items-center justify-center space-y-3 py-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-bold text-white tracking-wide">{paymentStatusMessage}</p>
                  <span className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Escrow protection active</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('profile')}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-[#00C853] py-3 text-sm font-bold text-black hover:opacity-95 transition-all shadow-lg shadow-primary/10"
                  >
                    Pay {formatINR(finalPrice)} Securely
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS WITH CONDITIONAL OPERATOR LINKS */}
          {step === 'success' && (
            product.isChatOnly ? (
              <div className="space-y-6 text-center" id="step-chat-only-success">
                
                {/* Massive Chat Sparkles icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                  <MessageSquare className="h-8 w-8 stroke-2" />
                </div>

                <div>
                  <h3 className="font-sans text-lg font-extrabold text-white">Operator Channels Selected</h3>
                  <p className="text-xs text-white/40 mt-1">Direct routing • Immediate assistance</p>
                  
                  <div className="mt-4 rounded-xl bg-bg-dark p-4 text-left border border-white/5 space-y-1.5 text-xs text-white/60">
                    <p>• <strong>Selected Support:</strong> <span className="text-white font-semibold">{product.title}</span></p>
                    <p>• <strong>Target Username/Profile:</strong> <span className="text-white hover:underline font-mono">{instagramHandle}</span></p>
                    <p>• <strong>Est. Connection Speed:</strong> <span className="text-primary font-bold">{product.deliveryTime}</span></p>
                  </div>
                </div>

                {/* ADVISORY BOX */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-primary text-left">
                  <strong>💬 Platform Channels Set:</strong> Below are the interaction channels configured for this service package. Pick your preferred platform to start chatting instantly with our direct-response team.
                </div>

                {/* DYNAMIC SELECTED BUTTONS */}
                <div className="grid gap-2">
                  {/* WhatsApp button */}
                  {product.whatsappLink && product.whatsappLink.trim() !== '' && (
                    <a
                      href={getWhatsAppMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-[#00C853]/15 border border-[#00C853]/20 px-4 py-3.5 font-sans text-xs font-bold text-[#00C853] hover:bg-[#00C853]/25 transition-all text-green-400"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}

                  {/* Instagram button */}
                  {product.instagramLink && product.instagramLink.trim() !== '' && (
                    <a
                      href={getInstagramMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-[#6200EA]/15 border border-[#6200EA]/20 px-4 py-3.5 font-sans text-xs font-bold text-[#B388FF] hover:bg-[#6200EA]/25 transition-all"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Chat on Instagram</span>
                    </a>
                  )}

                  {/* Messenger/Facebook button */}
                  {product.messengerLink && product.messengerLink.trim() !== '' && (
                    <a
                      href={getMessengerMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-[#0084FF]/15 border border-[#0084FF]/20 px-4 py-3.5 font-sans text-xs font-bold text-[#0084FF] hover:bg-[#0084FF]/25 transition-all text-blue-400"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat on Facebook Messenger</span>
                    </a>
                  )}

                  {/* Return to home button */}
                  <button
                    onClick={onClose}
                    className="mt-3 rounded-xl bg-white px-4 py-3 font-sans text-xs font-bold text-black hover:bg-white/95 transition-colors"
                  >
                    Done • Return to Dashboard
                  </button>
                </div>

              </div>
            ) : (
              <div className="space-y-6 text-center" id="step-success">
                
                {/* Massive confirmation icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
                  <CheckCircle className="h-10 w-10 stroke-2" />
                </div>

                <div>
                  <h3 className="font-sans text-lg font-extrabold text-white">Order Placed Successfully!</h3>
                  <p className="text-xs text-white/40 mt-1">Order Identifier: <span className="font-mono text-primary font-bold">{orderId}</span></p>
                  
                  <div className="mt-4 rounded-xl bg-bg-dark p-4 text-left border border-white/5 space-y-1.5 text-xs text-white/60">
                    <p>• <strong>Target Link:</strong> <span className="text-white hover:underline">{instagramHandle}</span></p>
                    <p>• <strong>Plan Purchased:</strong> <span className="text-white font-semibold">{product.title}</span></p>
                    <p>• <strong>Delivery Window:</strong> <span className="text-primary font-bold">{product.deliveryTime}</span></p>
                    <p>• <strong>Total Settled:</strong> <span className="text-white font-semibold">{formatINR(finalPrice)}</span></p>
                  </div>
                </div>

                {/* ACTION REQUIRED GUIDANCE */}
                <div className="rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5 p-4 text-xs leading-relaxed text-[#FFD700] text-left">
                  <strong>⚡ Delivery Optimization:</strong> To initiate instant delivery, share your transaction receipt and target username with our operations desk on one of the channels below.
                </div>

                {/* CONDITIONAL OPERATOR CONTACT PANEL */}
                <div className="grid gap-2">
                  
                  {/* ALWAYS offer WhatsApp if WhatsApp link is present or fall back */}
                  {(product.whatsappLink || !product.instagramLink) && (
                    <a
                      href={getWhatsAppMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-[#00C853]/15 border border-[#00C853]/20 px-4 py-3 font-sans text-xs font-bold text-[#00C853] hover:bg-[#00C853]/20 transition-all"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp Deliveries Desk</span>
                    </a>
                  )}

                  {/* Show Instagram link if the administrator entered it */}
                  {product.instagramLink && (
                    <a
                      href={getInstagramMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-[#6200EA]/15 border border-[#6200EA]/20 px-4 py-3 font-sans text-xs font-bold text-secondary-foreground hover:bg-[#6200EA]/20 transition-all text-[#B388FF]"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Verify on Instagram DM</span>
                    </a>
                  )}

                  {/* Show Messenger link if administrator entered it */}
                  {product['messengerLink'] && (
                    <a
                      href={getMessengerMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-accent/15 border border-accent/20 px-4 py-3 font-sans text-xs font-bold text-accent-foreground hover:bg-accent/20 transition-all text-accent"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ping via Messenger</span>
                    </a>
                  )}

                  {/* General Done Button */}
                  <button
                    onClick={onClose}
                    className="mt-3 rounded-xl bg-white px-4 py-3 font-sans text-xs font-bold text-black hover:bg-white/95 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>

              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}
