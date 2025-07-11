// Define the fbq function globally
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: (...args: any[]) => void;
    _fbq_initialized?: boolean;
  }
}

// Initialize Meta Pixel
export const initMetaPixel = () => {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;

  if (!pixelId) {
    return; // Silent skip if no pixel ID
  }

  // Prevent duplicate initialization
  if (window._fbq_initialized) {
    return;
  }

  // Initialize fbq function
  if (!window.fbq) {
    const fbq: any = function(...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue.push(args);
      }
    };
    
    if (!window._fbq) {
      window._fbq = fbq;
    }
    
    window.fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [] as any[];
  }

  // Load the Meta Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  // Initialize the pixel
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  
  // Mark as initialized
  window._fbq_initialized = true;

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.head.appendChild(noscript);
};

// Track page views
export const trackMetaPageView = () => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  window.fbq('track', 'PageView');
};

// Track custom events
export const trackMetaEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  if (parameters) {
    window.fbq('track', eventName, parameters);
  } else {
    window.fbq('track', eventName);
  }
};

// Track specific events for the calculator
export const trackCalculatorUsage = (data: {
  targetRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  monthlyAdBudget: number;
  dailyAdBudget: number;
}) => {
  trackMetaEvent('Lead', {
    content_name: 'Ad Budget Calculator',
    content_category: 'Calculator Tool',
    value: data.monthlyAdBudget,
    currency: 'TWD'
  });
  
  trackMetaEvent('CompleteRegistration', {
    content_name: 'Budget Calculation Completed',
    value: data.targetRevenue,
    currency: 'TWD'
  });
};