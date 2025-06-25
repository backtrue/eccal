import { google } from 'googleapis';
import { storage } from './storage';

export interface AnalyticsData {
  averageOrderValue: number;
  conversionRate: number;
  totalRevenue: number;
  ecommercePurchases: number;
  sessions: number;
}

export class GoogleAnalyticsService {
  private analytics;

  constructor() {
    this.analytics = google.analytics('v3');
  }

  async getEcommerceData(userId: string, propertyId: string): Promise<AnalyticsData | null> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.googleAccessToken) {
        throw new Error('User not found or no access token');
      }

      // Set up OAuth2 client with user's access token
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      // Use Google Analytics Data API (GA4)
      const analyticsData = google.analyticsdata('v1beta');
      
      // Calculate dates for last 28 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 28);

      const dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      // Get e-commerce metrics from GA4
      const response = await analyticsData.properties.runReport({
        auth: oauth2Client,
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [dateRange],
          metrics: [
            { name: 'sessions' },
            { name: 'purchaseRevenue' }, // Total revenue from purchases
            { name: 'purchases' }, // Number of purchase events
            { name: 'averagePurchaseRevenue' }, // Average order value
          ],
          dimensions: [],
        },
      });

      const rows = response.data.rows;
      if (!rows || rows.length === 0) {
        return null;
      }

      const metrics = rows[0].metricValues;
      if (!metrics || metrics.length < 4) {
        return null;
      }

      const sessions = parseFloat(metrics[0].value || '0');
      const totalRevenue = parseFloat(metrics[1].value || '0');
      const ecommercePurchases = parseFloat(metrics[2].value || '0');
      const averageOrderValue = parseFloat(metrics[3].value || '0');

      // Calculate conversion rate: purchases / sessions
      const conversionRate = sessions > 0 ? (ecommercePurchases / sessions) * 100 : 0;

      const result: AnalyticsData = {
        sessions,
        totalRevenue,
        ecommercePurchases,
        averageOrderValue,
        conversionRate,
      };

      // Save metrics to database
      await storage.saveUserMetrics({
        userId,
        averageOrderValue: averageOrderValue.toString(),
        conversionRate: (conversionRate / 100).toString(), // Store as decimal
        dataSource: 'google_analytics',
        periodStart: startDate,
        periodEnd: endDate,
        rawData: result,
      });

      return result;
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      
      // If token is expired, try to refresh
      if (error instanceof Error && error.message.includes('invalid_grant')) {
        await this.refreshAccessToken(userId);
        // Retry once with refreshed token
        return this.getEcommerceData(userId, propertyId);
      }
      
      throw error;
    }
  }

  private async refreshAccessToken(userId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.googleRefreshToken) {
        throw new Error('No refresh token available');
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (credentials.access_token) {
        await storage.upsertUser({
          ...user,
          googleAccessToken: credentials.access_token,
          tokenExpiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
        });
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  async getUserAnalyticsProperties(userId: string): Promise<any[]> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.googleAccessToken) {
        throw new Error('User not found or no access token');
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const analyticsAdmin = google.analyticsadmin('v1beta');
      
      // List all accounts accessible to the user
      const accountsResponse = await analyticsAdmin.accounts.list({
        auth: oauth2Client,
      });

      const properties: any[] = [];
      
      if (accountsResponse.data.accounts) {
        for (const account of accountsResponse.data.accounts) {
          if (account.name) {
            // List properties for each account
            const propertiesResponse = await analyticsAdmin.properties.list({
              auth: oauth2Client,
              filter: `parent:${account.name}`,
            });

            if (propertiesResponse.data.properties) {
              properties.push(...propertiesResponse.data.properties.map(prop => ({
                id: prop.name?.split('/')[1], // Extract property ID
                displayName: prop.displayName,
                accountName: account.displayName,
              })));
            }
          }
        }
      }

      return properties;
    } catch (error) {
      console.error('Error fetching Analytics properties:', error);
      throw error;
    }
  }
}

export const analyticsService = new GoogleAnalyticsService();