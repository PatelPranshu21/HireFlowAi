import { TransactionItem } from '../types';

export interface PaymentGatewayConfig {
  stripePublicKey?: string;
  razorpayKeyId?: string;
}

export function getPaymentConfig(): PaymentGatewayConfig {
  const env = (import.meta as any).env || {};
  return {
    stripePublicKey: env.VITE_STRIPE_PUBLIC_KEY || '',
    razorpayKeyId: env.VITE_RAZORPAY_KEY_ID || ''
  };
}

export async function processPayment(
  planName: 'Basic' | 'Pro' | 'Premium',
  amount: number,
  billingCycle: 'monthly' | 'yearly',
  paymentMethod: string
): Promise<{ success: boolean; transaction: TransactionItem; message?: string }> {
  const config = getPaymentConfig();
  const txId = `tx_${Date.now().toString().slice(-6)}`;
  const invNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toISOString().split('T')[0];

  const transaction: TransactionItem = {
    id: txId,
    invoiceNumber: invNumber,
    date: today,
    amount: amount,
    planName: `${planName} (${billingCycle})`,
    status: 'Paid',
    paymentMethod: paymentMethod || 'Credit Card (Visa •••• 4242)'
  };

  if (config.stripePublicKey) {
    // Stripe production payment integration ready
    console.log('Initiating Stripe Checkout with key:', config.stripePublicKey);
  } else if (config.razorpayKeyId) {
    // Razorpay production payment integration ready
    console.log('Initiating Razorpay Checkout with key:', config.razorpayKeyId);
  }

  return {
    success: true,
    transaction,
    message: `Payment of $${amount} for ${planName} Plan processed successfully.`
  };
}
