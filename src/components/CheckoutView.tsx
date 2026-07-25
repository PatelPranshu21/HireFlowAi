import React, { useState } from 'react';
import { UserProfile, NavigationTab, TransactionItem } from '../types';
import { CreditCard, ShieldCheck, Lock, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Zap, Sparkles } from 'lucide-react';

interface CheckoutViewProps {
  user: UserProfile;
  selectedPlan: {
    name: 'Basic' | 'Pro' | 'Premium';
    price: number;
    billingCycle: 'monthly' | 'yearly';
  };
  onPaymentSuccess: (planName: 'Basic' | 'Pro' | 'Premium', transaction: TransactionItem) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  user,
  selectedPlan,
  onPaymentSuccess,
  onNavigate
}) => {
  const paymentMode = (import.meta as any).env?.VITE_PAYMENT_MODE || 'test';
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user.name || 'Alex Morgan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardName('Test Mode User');
    setPaymentError(null);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!cardNumber || !cardExpiry || !cardCvc) {
      setPaymentError('Please fill in card details or click "Auto-fill Test Card Credentials".');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);

      const transaction: TransactionItem = {
        id: `tx_${Math.random().toString(36).substring(2, 9)}`,
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        amount: selectedPlan.price,
        planName: selectedPlan.name,
        status: 'Paid',
        paymentMethod: `Visa ending in ${cardNumber.slice(-4) || '4242'}`
      };

      setTimeout(() => {
        onPaymentSuccess(selectedPlan.name, transaction);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9FAFB] py-12 px-4 md:px-8 flex flex-col items-center relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Back Button */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-8 relative z-10">
        <button 
          onClick={() => onNavigate('pricing')}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing Plans
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Payment Mode: <strong>{paymentMode.toUpperCase()} MODE</strong></span>
        </div>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Form */}
        <div className="md:col-span-7 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-geist text-white">Secure Checkout</h2>
            <p className="text-xs text-white/50">Complete your subscription to unlock HireFlow AI tools immediately.</p>
          </div>

          {/* Test Mode Banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-300">Development Test Mode Active</p>
              <p className="text-white/60">No real charges will occur. Merchant account credentials will be read dynamically from environment variables in production.</p>
              <button 
                type="button"
                onClick={handleFillTestCard}
                className="mt-2 text-[11px] font-mono font-bold text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                Auto-fill Test Card Credentials (4242) →
              </button>
            </div>
          </div>

          {paymentDone ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
              <p className="text-xs text-white/60">Activating your <strong>{selectedPlan.name}</strong> subscription and redirecting to Dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-white/60 uppercase mb-1.5">Cardholder Name</label>
                <input 
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-white/60 uppercase mb-1.5">Card Number</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors pl-10"
                  />
                  <CreditCard className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-white/60 uppercase mb-1.5">Expiry Date</label>
                  <input 
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-white/60 uppercase mb-1.5">CVC / CVV</label>
                  <input 
                    type="password"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {paymentError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ${selectedPlan.price} & Activate {selectedPlan.name}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-geist">Order Summary</h3>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-white">{selectedPlan.name} Subscription</p>
                  <p className="text-[11px] font-mono text-white/40">Billed {selectedPlan.billingCycle}</p>
                </div>
                <span className="text-xl font-bold font-geist text-white">${selectedPlan.price}</span>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${selectedPlan.price}.00</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Taxes & Fees</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10 text-sm">
                  <span>Total Due Today</span>
                  <span className="text-blue-400">${selectedPlan.price}.00</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/50">
              <p className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Instant access to all features
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                Encrypted 256-bit test transaction
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-white/30 text-center">
            HireFlow AI Test Mode Architecture • No live card charged
          </div>
        </div>
      </div>
    </div>
  );
};
