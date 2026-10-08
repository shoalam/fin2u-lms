'use client';

import React, { useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface StripeFormProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  courseSlug: string;
  onSuccess?: () => void;
}

function CheckoutForm({ orderId, orderNumber, amount, currency, courseSlug }: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const siteUrl = window.location.origin;
    const returnUrl = `${siteUrl}/checkout/success?orderId=${orderId}&slug=${encodeURIComponent(
      courseSlug
    )}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // If stripe.confirmPayment returns an error, it did not redirect
    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message || 'Payment failed. Please check your card details.');
      } else {
        setErrorMessage(error.message || 'An unexpected error occurred during payment.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Payment Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit SSL Encrypted Payment</span>
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Powered by Stripe</span>
        </span>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ff447e] to-[#e0336b] hover:from-[#ff3070] hover:to-[#cc285b] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#ff447e]/30 hover:shadow-xl hover:shadow-[#ff447e]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Securing Payment & Enrolling...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>
              Pay {currency.toUpperCase()} {amount.toFixed(2)} & Start Learning
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </form>
  );
}

interface StripeElementsCheckoutProps {
  publishableKey: string;
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  courseSlug: string;
}

// Cache Stripe instance per publishableKey to avoid re-initializing
const stripePromiseCache = new Map<string, any>();

function getStripePromise(key: string) {
  if (!stripePromiseCache.has(key)) {
    stripePromiseCache.set(key, loadStripe(key));
  }
  return stripePromiseCache.get(key);
}

export default function StripeElementsCheckout({
  publishableKey,
  clientSecret,
  orderId,
  orderNumber,
  amount,
  currency,
  courseSlug,
}: StripeElementsCheckoutProps) {
  const stripePromise = getStripePromise(publishableKey);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#ff447e',
        colorBackground: '#ffffff',
        colorText: '#041c53',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        orderId={orderId}
        orderNumber={orderNumber}
        amount={amount}
        currency={currency}
        courseSlug={courseSlug}
      />
    </Elements>
  );
}
