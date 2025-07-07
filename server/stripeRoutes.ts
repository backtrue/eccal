import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { requireJWTAuth } from "./jwtAuth";

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function setupStripeRoutes(app: Express) {
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
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
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
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Create subscription for recurring payments
  app.post("/api/stripe/create-subscription", requireJWTAuth, async (req, res) => {
    try {
      const { priceId } = req.body;
      const userId = req.user.id;

      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
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
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

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
    // Find user by customer ID
    const user = await storage.getUser(customerId);
    if (!user) {
      console.error('No user found for customer ID:', customerId);
      return;
    }

    // Update subscription info
    await storage.updateUserStripeInfo(user.id, customerId, subscriptionId, 'active');
    
    // Extend Pro membership
    await storage.upgradeToPro(user.id, 30); // Monthly renewal
    
    console.log(`Successfully processed subscription payment for user ${user.id}`);
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

// Handle subscription changes
async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer;
  
  try {
    // Find user by customer ID
    const user = await storage.getUser(customerId);
    if (!user) {
      console.error('No user found for customer ID:', customerId);
      return;
    }

    // Update subscription status
    await storage.updateUserStripeInfo(user.id, customerId, subscription.id, subscription.status);
    
    console.log(`Updated subscription status for user ${user.id}: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}