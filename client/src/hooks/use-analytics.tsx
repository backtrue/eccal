import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '../lib/analytics';
import { trackMetaPageView } from '../lib/meta-pixel';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      trackPageView(location);
      trackMetaPageView();
      prevLocationRef.current = location;
    }
  }, [location]);
};