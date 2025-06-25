import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupGoogleAuth, requireAuth } from "./googleAuth";
import { analyticsService } from "./googleAnalytics";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google OAuth authentication
  setupGoogleAuth(app);

  // API routes for Google Analytics data
  app.get('/api/analytics/properties', requireAuth, async (req: any, res) => {
    try {
      const properties = await analyticsService.getUserAnalyticsProperties(req.user.id);
      res.json(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ error: 'Failed to fetch Analytics properties' });
    }
  });

  app.post('/api/analytics/data', requireAuth, async (req: any, res) => {
    try {
      const { propertyId } = req.body;
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      const data = await analyticsService.getEcommerceData(req.user.id, propertyId);
      // Always return data, even if it's zero values
      res.json(data || {
        sessions: 0,
        totalRevenue: 0,
        ecommercePurchases: 0,
        averageOrderValue: 0,
        conversionRate: 0,
      });
    } catch (error) {
      console.error('Error fetching Analytics data:', error);
      res.status(500).json({ error: 'Failed to fetch Analytics data' });
    }
  });

  // Get user's saved metrics
  app.get('/api/user/metrics', requireAuth, async (req: any, res) => {
    try {
      const metrics = await storage.getLatestUserMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      res.status(500).json({ error: 'Failed to fetch user metrics' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', requireAuth, async (req: any, res) => {
    try {
      req.logout((err: any) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
