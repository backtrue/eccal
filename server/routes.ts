import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupGoogleAuth, requireAuth } from "./googleAuth";
import { analyticsService } from "./googleAnalytics";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { brevoService } from "./brevoService";

export async function registerRoutes(app: Express): Promise<Server> {
  // 完全停用 Google OAuth - 這是 401 錯誤的根源
  // setupGoogleAuth(app);

  // 完全停用所有需要認證的路由，註解掉所有 API 路由
  /*
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

  // Credit system routes
  app.get('/api/credits', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const credits = await storage.getUserCredits(userId);
      const transactions = await storage.getCreditTransactions(userId);
      
      res.json({
        credits: credits || { balance: 0, totalEarned: 0, totalSpent: 0 },
        transactions
      });
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  app.post('/api/credits/spend', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, description } = req.body;
      
      const credits = await storage.getUserCredits(userId);
      if (!credits || credits.balance < amount) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      
      // Update credits
      await storage.updateUserCredits(
        userId,
        credits.balance - amount,
        credits.totalEarned,
        credits.totalSpent + amount
      );
      
      // Add transaction
      await storage.addCreditTransaction({
        userId,
        type: "spend",
        amount,
        source: "calculation",
        description: description || "Calculator usage",
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error spending credits:", error);
      res.status(500).json({ message: "Failed to spend credits" });
    }
  });

  // Referral system routes
  app.get('/api/referral/code', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const referralCode = await storage.createReferralCode(userId);
      res.json({ referralCode });
    } catch (error) {
      console.error("Error creating referral code:", error);
      res.status(500).json({ message: "Failed to create referral code" });
    }
  });

  app.get('/api/referrals', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const referrals = await storage.getReferralsByUser(userId);
      
      // Get referred user details
      const referralsWithUsers = await Promise.all(
        referrals.map(async (referral) => {
          const referredUser = await storage.getUser(referral.referredUserId);
          return {
            ...referral,
            referredUser: referredUser ? {
              id: referredUser.id,
              firstName: referredUser.firstName,
              lastName: referredUser.lastName,
              email: referredUser.email
            } : null
          };
        })
      );
      
      res.json(referralsWithUsers);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post('/api/referral/process', async (req, res) => {
    try {
      const { referralCode, userId } = req.body;
      
      if (!referralCode || !userId) {
        return res.status(400).json({ message: "Missing referralCode or userId" });
      }
      
      const referral = await storage.processReferral(referralCode, userId);
      res.json({ success: !!referral, referral });
    } catch (error) {
      console.error("Error processing referral:", error);
      res.status(500).json({ message: "Failed to process referral" });
    }
  });

  // Membership routes
  app.get('/api/membership/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const status = await storage.checkMembershipStatus(userId);
      res.json(status);
    } catch (error) {
      console.error('Error checking membership status:', error);
      res.status(500).json({ error: 'Failed to check membership status' });
    }
  });

  app.post('/api/membership/upgrade-to-pro', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { durationDays = 30 } = req.body;
      const upgradePrice = 350;
      
      // Check if user has enough credits
      const credits = await storage.getUserCredits(userId);
      if (!credits || credits.balance < upgradePrice) {
        return res.status(400).json({ 
          error: 'Insufficient credits', 
          required: upgradePrice,
          current: credits?.balance || 0 
        });
      }
      
      // Deduct credits
      await storage.updateUserCredits(
        userId, 
        credits.balance - upgradePrice,
        credits.totalEarned,
        credits.totalSpent + upgradePrice
      );
      
      // Add transaction record
      await storage.addCreditTransaction({
        userId,
        type: "spend",
        amount: upgradePrice,
        source: "upgrade",
        description: `Upgrade to Pro for ${durationDays} days`
      });
      
      // Upgrade user to Pro
      const updatedUser = await storage.upgradeToPro(userId, durationDays);
      
      res.json({ 
        success: true, 
        message: `Successfully upgraded to Pro for ${durationDays} days`,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error upgrading to Pro:', error);
      res.status(500).json({ error: 'Failed to upgrade to Pro' });
    }
  });

  // Admin route to add credits to all users
  app.post('/api/admin/credits/add-all', async (req, res) => {
    try {
      const { amount, description } = req.body;
      
      if (!amount || !description) {
        return res.status(400).json({ message: "Missing amount or description" });
      }
      
      const updatedCount = await storage.addCreditsToAllUsers(amount, description);
      res.json({ 
        success: true, 
        message: `Added ${amount} credits to ${updatedCount} users`,
        updatedCount 
      });
    } catch (error) {
      console.error("Error adding credits to all users:", error);
      res.status(500).json({ message: "Failed to add credits" });
    }
  });

  */

  // 簡化的路由，只保留基本功能
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', maintenance: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
