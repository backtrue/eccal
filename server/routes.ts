import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupGoogleAuth, requireAuth } from "./googleAuth";
import { analyticsService } from "./googleAnalytics";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { brevoService } from "./brevoService";

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

  // Sync existing users to Brevo - one-time sync command
  app.post("/api/sync-brevo", async (req, res) => {
    try {
      console.log('開始同步現有用戶到 Brevo...');
      
      // 獲取所有現有用戶
      const allUsers = await db.select().from(users);
      console.log(`找到 ${allUsers.length} 個用戶`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of allUsers) {
        if (user.email) {
          try {
            console.log(`同步用戶: ${user.email}`);
            
            // 獲取用戶最新的 GA 資源名稱
            const latestMetrics = await storage.getLatestUserMetrics(user.id);
            const gaResourceName = latestMetrics?.gaResourceName || '';
            
            await brevoService.addContactToList({
              email: user.email,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              gaResourceName: gaResourceName,
            });
            
            successCount++;
            console.log(`✓ 成功同步: ${user.email}`);
          } catch (error: any) {
            errorCount++;
            console.error(`✗ 同步失敗 ${user.email}:`, error.message);
          }
          
          // 避免 API 限制，每個請求間隔 100ms
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      const result = {
        success: true,
        message: '同步完成',
        totalUsers: allUsers.length,
        successCount,
        errorCount
      };
      
      console.log('同步結果:', result);
      res.json(result);
      
    } catch (error: any) {
      console.error('同步過程中發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
