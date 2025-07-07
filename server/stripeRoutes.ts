import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { requireJWTAuth } from "./jwtAuth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

console.log('Initializing Stripe with secret key starting with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function setupStripeRoutes(app: Express) {
  // Initialize Stripe products and prices (admin only)
  app.post("/api/stripe/init-products", async (req, res) => {
    try {
      // Create monthly subscription product
      const monthlyProduct = await stripe.products.create({
        name: '報數據 Pro 月訂閱',
        description: '專業電商廣告分析平台 - 月訂閱',
        metadata: {
          type: 'monthly_subscription'
        }
      });

      // Create monthly price (JPY 2,000)
      const monthlyPrice = await stripe.prices.create({
        unit_amount: 2000,
        currency: 'jpy',
        recurring: {
          interval: 'month'
        },
        product: monthlyProduct.id,
        metadata: {
          type: 'monthly_pro'
        }
      });

      // Create lifetime product
      const lifetimeProduct = await stripe.products.create({
        name: '報數據 Pro 終身訂閱',
        description: '專業電商廣告分析平台 - 終身使用',
        metadata: {
          type: 'lifetime_subscription'
        }
      });

      // Create lifetime price (JPY 17,250)
      const lifetimePrice = await stripe.prices.create({
        unit_amount: 17250,
        currency: 'jpy',
        product: lifetimeProduct.id,
        metadata: {
          type: 'lifetime_pro'
        }
      });

      res.json({
        success: true,
        products: {
          monthly: {
            product: monthlyProduct.id,
            price: monthlyPrice.id
          },
          lifetime: {
            product: lifetimeProduct.id,
            price: lifetimePrice.id
          }
        }
      });
    } catch (error: any) {
      console.error('Error initializing Stripe products:', error);
      res.status(500).json({ 
        error: "Error initializing products: " + (error.message || 'Unknown error')
      });
    }
  });

  // Create payment intent for one-time payments
  app.post("/api/stripe/create-payment-intent", requireJWTAuth, async (req, res) => {
    try {
      const { amount, paymentType, currency = 'usd' } = req.body;
      const userId = req.user.id;

      if (!amount || !paymentType) {
        return res.status(400).json({ error: "Amount and payment type are required" });
      }

      // Get or create Stripe customer
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }

      // Create payment intent
      // Note: JPY doesn't need to be multiplied by 100 as it's already the smallest unit
      const finalAmount = currency === 'jpy' ? Math.round(amount) : Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: currency,
        customer: customerId,
        metadata: {
          userId: userId,
          paymentType: paymentType,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      
      // More detailed error logging
      console.error("Error details:", {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        stack: error.stack
      });
      
      res.status(500).json({ 
        error: "Error creating payment intent: " + (error.message || 'Unknown error'),
        details: error.type || 'server_error'
      });
    }
  });

  // Create subscription for recurring payments
  app.post("/api/stripe/create-subscription", requireJWTAuth, async (req, res) => {
    try {
      const { priceId, planType } = req.body;
      const userId = req.user.id;

      if (!priceId || !planType) {
        return res.status(400).json({ error: "Price ID and plan type are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }

      // Create subscription
      const subscriptionData: any = {
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId,
          planType: planType,
        },
      };

      // For lifetime plans, we don't need recurring billing
      if (planType === 'lifetime') {
        delete subscriptionData.payment_settings;
        subscriptionData.payment_behavior = 'default_incomplete';
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      // Store subscription ID in user record
      await storage.updateUserSubscription(userId, subscription.id, 'active');

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        error: "Error creating subscription: " + error.message 
      });
    }
  });

  // Webhook to handle payment events
  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('Missing stripe signature');
    }

    let event;

    try {
      // You'll need to set STRIPE_WEBHOOK_SECRET in your environment
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await handleSubscriptionPaymentSuccess(event.data.object);
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionChange(event.data.object);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook event:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

  // Get user's payment history
  app.get("/api/stripe/payments", requireJWTAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const payments = await storage.getUserStripePayments(userId);
      res.json(payments);
    } catch (error: any) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Get subscription status
  app.get("/api/stripe/subscription-status", requireJWTAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeSubscriptionId) {
        return res.json({ hasSubscription: false });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      res.json({
        hasSubscription: true,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ error: "Failed to fetch subscription status" });
    }
  });
}

// Handle successful one-time payment
async function handlePaymentSuccess(paymentIntent: any) {
  const userId = paymentIntent.metadata?.userId;
  const paymentType = paymentIntent.metadata?.paymentType;
  
  if (!userId) {
    console.error('No userId in payment intent metadata');
    return;
  }

  try {
    // Record the payment
    await storage.createStripePayment({
      userId: userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentType: paymentType || 'unknown',
      description: `${paymentType} payment`,
    });

    // Upgrade user to Pro based on payment type
    if (paymentType === 'monthly') {
      // Monthly subscription: 30 days
      await storage.upgradeToPro(userId, 30);
    } else if (paymentType === 'lifetime') {
      // Lifetime: 10 years (effectively permanent)
      await storage.upgradeToPro(userId, 365 * 10);
    }

    console.log(`Successfully processed ${paymentType} payment for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle successful subscription payment
async function handleSubscriptionPaymentSuccess(invoice: any) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  
  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata:', subscriptionId);
      return;
    }

    // Update user subscription status
    await storage.updateUserSubscription(userId, subscriptionId, 'active');
    
    console.log(`Subscription payment processed for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

// Handle subscription changes
async function handleSubscriptionChange(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata:', subscription.id);
      return;
    }

    // Update subscription status
    await storage.updateUserSubscription(userId, subscription.id, subscription.status);
    
    // If subscription is canceled or past_due, downgrade user
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      const [user] = await db.update(users).set({
        membershipLevel: 'free',
        membershipExpires: null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId)).returning();
      
      console.log(`User ${userId} downgraded to free due to subscription status: ${subscription.status}`);
    }
    
    console.log(`Updated subscription status for user ${userId}: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}