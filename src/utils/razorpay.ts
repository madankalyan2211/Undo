import { PlusTier } from '../types';

export interface PricingPlan {
  id: PlusTier;
  name: string;
  priceDisplay: string;
  originalPriceDisplay?: string; // e.g. "₹99", "₹299", "₹1,999"
  amountPaise: number; // e.g. 14900 = ₹149.00
  interval: string;
  tagline: string;
  popular?: boolean;
  savings?: string;
  features: string[];
  trialDays: number;
  trialPriceDisplay: string; // e.g. "₹2", "₹7", "₹40"
  trialOriginalPriceDisplay?: string;
  trialAmountPaise: number;  // fraction/percentage of total
  trialTagline: string;
}

export const RAZORPAY_CONFIG = {
  KEY_ID: 'rzp_test_TTFUFI3RB7tAX2',
  APP_NAME: 'Undo Plus',
  APP_DESCRIPTION: 'Unlock Sensory Rituals, Ambient Soundscapes & ASMR Keyboard',
  THEME_COLOR: '#FBBF24',
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Basic',
    priceDisplay: '₹0',
    amountPaise: 0,
    interval: 'forever',
    tagline: 'Basic sanctuary with essential features',
    features: [
      'Up to 5 thoughts in fading at a time',
      'Up to 10 thoughts in kept permanent vault',
      'Classic Dust particulate release ritual only',
      'Standard silent ambient & basic typing sounds',
    ],
    trialDays: 0,
    trialPriceDisplay: '₹0',
    trialAmountPaise: 0,
    trialTagline: 'Free forever with 5 fading & 10 kept limit',
  },
  {
    id: 'weekly',
    name: 'Weekly Pass',
    priceDisplay: '₹49',
    originalPriceDisplay: '₹99',
    amountPaise: 4900,
    interval: 'per week',
    tagline: '7-day full access to all sensory tools',
    savings: '50% OFF',
    features: [
      'Unlimited thoughts in fading & kept timeline',
      '7-day unrestricted access to all 5 release rituals',
      'Studio ambient soundscapes (432Hz Zen, Rain, Breeze)',
      'Tactile & Typewriter ASMR keyboard sound packs',
    ],
    trialDays: 3,
    trialPriceDisplay: '₹2',
    trialOriginalPriceDisplay: '₹49',
    trialAmountPaise: 200,
    trialTagline: '⚡ Try 3 Days for just ₹2 (5% of plan)',
  },
  {
    id: 'monthly',
    name: 'Monthly Zen',
    priceDisplay: '₹149',
    originalPriceDisplay: '₹299',
    amountPaise: 14900,
    interval: 'per month',
    tagline: '₹37/wk · Most flexible choice',
    popular: true,
    savings: '★ BEST CHOICE',
    features: [
      'Unlimited thoughts & lifetime memory archiving',
      'Continuous monthly access to all 5 sensory rituals',
      'All 6 ASMR keyboard notes & studio soundscapes',
      'Stealth Calculator disguise & Duress Panic Wipe',
      'AI Mindful Cognitive Reframer & custom OLED themes',
    ],
    trialDays: 3,
    trialPriceDisplay: '₹7',
    trialOriginalPriceDisplay: '₹149',
    trialAmountPaise: 700,
    trialTagline: '⚡ Try 3 Days for just ₹7 (5% of plan)',
  },
  {
    id: 'annual',
    name: 'Annual VIP',
    priceDisplay: '₹799',
    originalPriceDisplay: '₹1,999',
    amountPaise: 79900,
    interval: 'per year',
    tagline: '₹66/mo · Billed annually',
    savings: '60% OFF',
    features: [
      'Unlimited thoughts with VIP priority cloud sync',
      'Full 1-year unlimited VIP access (Only ₹66/month)',
      'Save 60% over regular annual billing',
      'All premium rituals, soundscapes, ASMR packs & luxury themes',
      'Complete Stealth Math Lock & AI Reframer suite',
      'Priority access to all upcoming 2026 rituals & sound packs',
    ],
    trialDays: 3,
    trialPriceDisplay: '₹40',
    trialOriginalPriceDisplay: '₹799',
    trialAmountPaise: 4000,
    trialTagline: '⚡ Try 3 Days for just ₹40 (5% of plan)',
  },
];

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openWebRazorpayCheckout(
  plan: PricingPlan,
  isTrial: boolean = false,
  onSuccess: (paymentId: string, plan: PricingPlan, isTrial: boolean) => void,
  onError?: (errMsg: string) => void,
  onDismiss?: () => void
) {
  const loaded = await loadRazorpayScript();

  if (!loaded || typeof (window as any).Razorpay === 'undefined') {
    const fallbackTestId = 'pay_test_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    onSuccess(fallbackTestId, plan, isTrial);
    return;
  }

  const finalAmountPaise = isTrial ? plan.trialAmountPaise : plan.amountPaise;
  const finalTitle = isTrial ? `3-Day Trial: ${plan.name}` : plan.name;

  const options = {
    key: RAZORPAY_CONFIG.KEY_ID,
    amount: finalAmountPaise,
    currency: 'INR',
    name: RAZORPAY_CONFIG.APP_NAME,
    description: `${finalTitle} - ${RAZORPAY_CONFIG.APP_DESCRIPTION}`,
    image: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    theme: {
      color: RAZORPAY_CONFIG.THEME_COLOR,
      backdrop_color: '#000000',
    },
    prefill: {
      name: 'Mindful Writer',
      email: 'writer@undo.app',
      contact: '9876543210',
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
    handler: (response: any) => {
      onSuccess(response.razorpay_payment_id || 'pay_test_verified', plan, isTrial);
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      if (onError) {
        onError(response.error?.description || 'Payment was not completed.');
      }
    });
    rzp.open();
  } catch (err: any) {
    if (onError) {
      onError(err.message || 'Failed to initialize Razorpay checkout');
    }
  }
}
