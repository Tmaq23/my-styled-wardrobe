// Stripe payment integration
const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export async function createPaymentIntent(amount: number, currency = 'gbp', metadata: Record<string, string> = {}): Promise<PaymentIntent> {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: (amount * 100).toString(), // Convert to pence
        currency,
        'metadata[type]': metadata['type'] || 'purchase',
        'metadata[user_id]': metadata['userId'] || '',
        'metadata[item_id]': metadata['itemId'] || '',
        description: metadata['description'] || '',
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stripe API error:', errorText);
      throw new Error(`Stripe API error: ${response.status}`);
    }
    
    const paymentIntent = await response.json();
    
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to pounds
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    };
    
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw error;
  }
}

export async function createSubscription(customerId: string, priceId: string, metadata: Record<string, string> = {}) {
  try {
    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        customer: customerId,
        'items[0][price]': priceId,
        'metadata[user_id]': metadata['userId'] || '',
        'metadata[tier]': metadata['tier'] || 'premium'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Stripe subscription error: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw new Error('Subscription creation failed');
  }
}

// Stripe price IDs (you'd set these up in your Stripe dashboard)
export const STRIPE_PRICES = {
  premium_monthly: 'price_premium_monthly_gbp', // Replace with actual Stripe price ID
  premium_yearly: 'price_premium_yearly_gbp',
  stylist_pro_monthly: 'price_stylist_pro_monthly_gbp',
  stylist_pro_yearly: 'price_stylist_pro_yearly_gbp'
};
