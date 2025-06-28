import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupGoogleAuth, requireAuth } from "./googleAuth";
import { analyticsService } from "./googleAnalytics";
import { storage } from "./storage";
import { db } from "./db";
import { users as usersTable, userMetrics } from "@shared/schema";
import { eq } from "drizzle-orm";
import { brevoService } from "./brevoService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google OAuth authentication
  setupGoogleAuth(app);

  // Protected route - Get user info with caching
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Set cache headers to reduce frequent requests
      res.set({
        'Cache-Control': 'private, max-age=300', // 5分鐘快取
        'ETag': `"user-${user.id}-${Date.now()}"`,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Analytics routes
  app.get('/api/analytics/properties', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const properties = await analyticsService.getUserAnalyticsProperties(userId);
      res.json(properties || []);
    } catch (error) {
      console.error('Error fetching analytics properties:', error);
      res.status(500).json({ message: 'Failed to fetch analytics properties' });
    }
  });

  app.post('/api/analytics/data', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { propertyId } = req.body;
      
      if (!propertyId) {
        return res.status(400).json({ message: 'Property ID is required' });
      }

      const data = await analyticsService.getEcommerceData(userId, propertyId);
      
      if (!data) {
        return res.status(404).json({ message: 'No data found for the selected property' });
      }

      // Save metrics to database
      await storage.saveUserMetrics({
        userId,
        dataSource: 'ga4_api',
        gaResourceName: propertyId.toString(),
        averageOrderValue: data.averageOrderValue.toString(),
        conversionRate: data.conversionRate.toString(),
        periodStart: new Date(),
        periodEnd: new Date()
      });

      res.json(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  // User metrics route
  app.get('/api/user/metrics', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const metrics = await storage.getLatestUserMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      res.status(500).json({ message: 'Failed to fetch user metrics' });
    }
  });

  // User statistics route
  app.get('/api/user/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Get total calculations (from user_metrics table)
      const allMetrics = await db
        .select()
        .from(userMetrics)
        .where(eq(userMetrics.userId, userId));
      
      const stats = {
        totalCalculations: allMetrics.length,
        lastCalculation: allMetrics.length > 0 ? allMetrics[allMetrics.length - 1].createdAt : null,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  // User referrals route
  app.get('/api/user/referrals', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const referrals = await storage.getReferralsByUser(userId);
      res.json(referrals);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      res.status(500).json({ message: 'Failed to fetch referrals' });
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
      const allUsers = await db.select().from(usersTable);
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
      const userId = req.user.claims?.sub || req.user.id;
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
      const userId = req.user.claims?.sub || req.user.id;
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
        type: "spent",
        amount,
        source: "calculator",
        description: description || "Calculator usage"
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
      const userId = req.user.claims?.sub || req.user.id;
      const referralCode = await storage.createReferralCode(userId);
      res.json({ referralCode });
    } catch (error) {
      console.error("Error creating referral code:", error);
      res.status(500).json({ message: "Failed to create referral code" });
    }
  });

  app.get('/api/referrals', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
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

  // Get referral statistics for progress tracking
  app.get('/api/referral/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const referrals = await storage.getReferralsByUser(userId);
      
      const totalReferrals = referrals.length;
      const creditsFromReferrals = referrals.reduce((total, referral, index) => {
        // First 3 referrals get 100 points each, rest get 50
        return total + (index < 3 ? 100 : 50);
      }, 0);
      
      const progressToProMembership = Math.min(creditsFromReferrals / 350, 1); // 350 credits = 1 month Pro
      const referralsNeededForPro = Math.max(0, 4 - totalReferrals); // Need 4 referrals for 350 credits (3×100 + 1×50)
      
      res.json({
        totalReferrals,
        creditsFromReferrals,
        progressToProMembership,
        referralsNeededForPro,
        nextReferralValue: totalReferrals < 3 ? 100 : 50
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
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
      const userId = req.user.claims?.sub || req.user.id;
      const status = await storage.checkMembershipStatus(userId);
      res.json(status);
    } catch (error) {
      console.error('Error checking membership status:', error);
      res.status(500).json({ error: 'Failed to check membership status' });
    }
  });

  app.post('/api/membership/upgrade-to-pro', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
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
        type: "spent",
        amount: upgradePrice,
        source: "membership",
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

  // Campaign Planner usage tracking
  app.get('/api/campaign-planner/usage', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      const membershipStatus = await storage.checkMembershipStatus(userId);
      
      const usage = user?.campaignPlannerUsage || 0;
      const limit = membershipStatus.level === 'pro' ? -1 : 3; // -1 means unlimited for Pro
      const canUse = membershipStatus.level === 'pro' || usage < limit;
      
      res.json({
        usage,
        limit,
        canUse,
        membershipStatus
      });
    } catch (error) {
      console.error('Error fetching campaign planner usage:', error);
      res.status(500).json({ message: 'Failed to fetch usage data' });
    }
  });

  app.post('/api/campaign-planner/record-usage', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      console.log('Recording usage for user:', userId);
      
      const membershipStatus = await storage.checkMembershipStatus(userId);
      console.log('User membership status:', membershipStatus);
      
      // Only record usage for non-Pro users (free users only)
      if (membershipStatus.level === 'free') {
        console.log('Recording usage for free user');
        const updatedUser = await storage.incrementCampaignPlannerUsage(userId);
        console.log('Usage recorded, new count:', updatedUser.campaignPlannerUsage);
      } else {
        console.log('Skipping usage recording for Pro user');
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error recording campaign planner usage:', error);
      res.status(500).json({ message: 'Failed to record usage', error: error.message });
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

  // Test referral system endpoint
  app.post('/api/admin/test-referral', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { testEmail } = req.body;
      
      if (!testEmail) {
        return res.status(400).json({ message: "Test email required" });
      }

      // Create referral code for current user
      const referralCode = await storage.createReferralCode(userId);
      
      // Create a test user
      const testUserId = `test_${Date.now()}`;
      const testUser = await storage.upsertUser({
        id: testUserId,
        email: testEmail,
        firstName: "Test",
        lastName: "User",
      });

      // Initialize credits for test user
      await storage.createUserCredits(testUserId);

      // Process the referral
      const referral = await storage.processReferral(referralCode, testUserId);
      
      res.json({
        success: true,
        referralCode,
        testUser: testUser.email,
        referral,
        message: "Test referral processed successfully"
      });
    } catch (error) {
      console.error("Error testing referral:", error);
      res.status(500).json({ message: "Failed to test referral" });
    }
  });

  // Public test endpoint for user count
  app.get('/api/public/user-count', async (req, res) => {
    try {
      const allUsers = await db.select().from(usersTable);
      const usersWithEmail = allUsers.filter(user => user.email);
      
      res.json({
        totalUsers: allUsers.length,
        usersWithEmail: usersWithEmail.length,
        message: 'Brevo sync endpoints working'
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all users for Brevo sync (public endpoint for easy access)
  app.get('/api/users/all', async (req, res) => {
    try {
      const allUsers = await db.select().from(usersTable);
      const userData = allUsers.map(user => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }));
      
      res.json(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Simple Brevo sync data endpoint (returns JSON instead of files to avoid routing issues)
  app.get('/api/brevo-export', async (req, res) => {
    try {
      const allUsers = await db.select().from(usersTable);
      const usersWithEmail = allUsers.filter(user => user.email);

      const brevoData = usersWithEmail.map(user => ({
        email: user.email,
        attributes: {
          FIRSTNAME: user.firstName || '',
          LASTNAME: user.lastName || '',
          GA_RESOURCE: user.gaResourceName || user.firstName || ''
        },
        listIds: [15],
        signupDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ''
      }));

      const csvData = [
        'EMAIL,FIRSTNAME,LASTNAME,GA_RESOURCE_NAME,SIGNUP_DATE',
        ...brevoData.map(user => 
          `"${user.email}","${user.attributes.FIRSTNAME}","${user.attributes.LASTNAME}","${user.attributes.GA_RESOURCE}","${user.signupDate}"`
        )
      ].join('\n');

      const bashScript = `#!/bin/bash
# Brevo 批量同步腳本 - 生成時間: ${new Date().toISOString()}
# 總用戶數: ${usersWithEmail.length}

echo "開始同步 ${usersWithEmail.length} 個用戶到 Brevo 名單 #15..."

${brevoData.map((user, index) => `
# 用戶 ${index + 1}: ${user.email}
curl -X POST "https://api.brevo.com/v3/contacts" \\
  -H "accept: application/json" \\
  -H "api-key: YOUR_BREVO_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify({ email: user.email, attributes: user.attributes, listIds: user.listIds })}'
echo "已添加: ${user.email}"
sleep 0.5
`).join('')}

echo "同步完成！"`;

      res.json({
        summary: {
          totalUsers: allUsers.length,
          usersWithEmail: usersWithEmail.length,
          generatedAt: new Date().toISOString()
        },
        csvData,
        bashScript,
        webhookData: brevoData,
        instructions: {
          csv: '複製 csvData 內容到 .csv 檔案，手動上傳到 Brevo',
          bash: '複製 bashScript 內容到 .sh 檔案，替換 YOUR_BREVO_API_KEY 後執行',
          webhook: '使用 webhookData 配置 Zapier/Make.com 自動化'
        }
      });
    } catch (error) {
      console.error('Brevo export error:', error);
      res.status(500).json({ 
        message: 'Failed to generate Brevo export data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Alternative Brevo sync methods (public access for easier use)
  app.get('/api/public/export-users-csv', async (req: any, res) => {
    try {
      const allUsers = await db.select().from(usersTable);

      const csvHeader = 'EMAIL,FIRSTNAME,LASTNAME,GA_RESOURCE_NAME,SIGNUP_DATE\n';
      const csvRows = allUsers.filter(user => user.email).map(user => {
        const email = user.email || '';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const gaResourceName = user.firstName || '';
        const signupDate = user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '';
        
        return `"${email}","${firstName}","${lastName}","${gaResourceName}","${signupDate}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="brevo-contacts.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error('Error generating CSV export:', error);
      res.status(500).json({ message: 'Failed to generate CSV export' });
    }
  });

  app.get('/api/public/brevo-sync-script', async (req: any, res) => {
    try {
      const allUsers = await db.select().from(usersTable);
      const usersWithEmail = allUsers.filter(user => user.email);

      const curlCommands = usersWithEmail.map((user, index) => {
        const payload = {
          email: user.email,
          attributes: {
            FIRSTNAME: user.firstName || '',
            LASTNAME: user.lastName || ''
          },
          listIds: [15]
        };
        
        return `# Contact ${index + 1}: ${user.email}
curl -X POST "https://api.brevo.com/v3/contacts" \\
  -H "accept: application/json" \\
  -H "api-key: YOUR_BREVO_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify(payload)}'
echo "Added: ${user.email}"
sleep 0.5  # Rate limiting
`;
      });
      
      const scriptContent = `#!/bin/bash
# Brevo Bulk Contact Import Script
# Generated: ${new Date().toISOString()}
# Total contacts: ${usersWithEmail.length}

echo "Starting Brevo bulk import..."
echo "Please replace YOUR_BREVO_API_KEY with your actual API key"
echo ""

${curlCommands.join('\n')}

echo "Bulk import completed!"`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="brevo-bulk-import.sh"');
      res.send(scriptContent);
    } catch (error) {
      console.error('Error generating sync script:', error);
      res.status(500).json({ message: 'Failed to generate sync script' });
    }
  });

  app.get('/api/public/brevo-webhook-data', async (req: any, res) => {
    try {
      const allUsers = await db.select().from(usersTable);
      const usersWithEmail = allUsers.filter(user => user.email);

      const webhookData = usersWithEmail.map(user => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        signupDate: user.createdAt,
        listId: 15,
        attributes: {
          FIRSTNAME: user.firstName || '',
          LASTNAME: user.lastName || ''
        }
      }));
      
      res.json({
        success: true,
        totalContacts: webhookData.length,
        data: webhookData,
        instructions: {
          zapier: "Use this JSON data in Zapier webhook trigger to bulk import to Brevo",
          make: "Use this JSON data in Make.com HTTP module to bulk import to Brevo",
          manual: "Use individual contact objects to manually add to Brevo via API"
        }
      });
    } catch (error) {
      console.error('Error generating webhook data:', error);
      res.status(500).json({ message: 'Failed to generate webhook data' });
    }
  });

  // ===== Saved Projects API =====
  
  // Save a new project
  app.post('/api/projects', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { projectName, projectType, projectData, calculationResult } = req.body;
      
      console.log('Saving project for user:', userId, 'Project name:', projectName);
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      
      if (!projectName || !projectType || !projectData) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const project = await storage.saveProject(userId, projectName, projectType, projectData, calculationResult);
      res.json(project);
    } catch (error) {
      console.error('Error saving project:', error);
      res.status(500).json({ message: 'Failed to save project' });
    }
  });

  // Get user's projects
  app.get('/api/projects', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  // Get a specific project
  app.get('/api/projects/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const projectId = req.params.id;
      const project = await storage.getProject(projectId, userId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  // Update a project
  app.put('/api/projects/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const projectId = req.params.id;
      const updates = req.body;
      
      const project = await storage.updateProject(projectId, userId, updates);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  // Delete a project
  app.delete('/api/projects/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const projectId = req.params.id;
      
      const success = await storage.deleteProject(projectId, userId);
      if (!success) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
