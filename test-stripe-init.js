// Test script to initialize Stripe products
const fetch = require('node-fetch');

async function initStripeProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/stripe/init-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We'll need to authenticate first, but for now let's test without auth
      },
      body: JSON.stringify({})
    });

    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

initStripeProducts();