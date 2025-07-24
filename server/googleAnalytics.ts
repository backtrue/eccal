import { google } from 'googleapis';
import { storage } from './storage';
import { createSafeOAuth2Client, sanitizeGoogleApiResponse, safeGoogleApiCall } from './googleOAuthHelper';

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

      // Set up OAuth2 client with user's access token using safe helper
      const oauth2Client = createSafeOAuth2Client({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
        expiry_date: user.tokenExpiresAt,
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

      // Try different metric combinations based on GA4 setup
      let response;
      let metricsUsed = '';
      
      const metricSets = [
        {
          name: 'Standard GA4 Ecommerce',
          metrics: ['sessions', 'totalRevenue', 'ecommercePurchases', 'averagePurchaseRevenue']
        },
        {
          name: 'Purchase Event Based', 
          metrics: ['sessions', 'purchaseRevenue', 'purchases', 'itemRevenue']
        },
        {
          name: 'Enhanced Ecommerce Legacy',
          metrics: ['sessions', 'itemRevenue', 'itemPurchaseQuantity', 'averagePurchaseRevenue']
        },
        {
          name: 'Basic Conversion Tracking',
          metrics: ['sessions', 'conversions', 'eventValue', 'eventCount']
        }
      ];

      for (const metricSet of metricSets) {
        try {
          console.log(`Trying metric set: ${metricSet.name} - [${metricSet.metrics.join(', ')}]`);
          
          response = await safeGoogleApiCall(() => 
            analyticsData.properties.runReport({
              auth: oauth2Client,
              property: `properties/${propertyId}`,
              requestBody: {
                dateRanges: [dateRange],
                metrics: metricSet.metrics.map(name => ({ name })),
                dimensions: [],
              },
            })
          );
          
          metricsUsed = metricSet.name;
          console.log(`Success with metric set: ${metricSet.name}`);
          break;
          
        } catch (error) {
          console.log(`Failed with ${metricSet.name}:`, (error as any).message);
          console.log('Full error details:', JSON.stringify(error, null, 2));
          if (metricSet === metricSets[metricSets.length - 1]) {
            throw error; // Re-throw if this was the last attempt
          }
        }
      }

      if (!response) {
        throw new Error('No response received from GA4 API');
      }

      const rows = response.data.rows;
      if (!rows || rows.length === 0) {
        console.log('No data rows returned from GA4');
        // Return default values instead of null
        return {
          sessions: 0,
          totalRevenue: 0,
          ecommercePurchases: 0,
          averageOrderValue: 0,
          conversionRate: 0,
        };
      }

      const metrics = rows[0].metricValues;
      if (!metrics || metrics.length < 4) {
        console.log('Insufficient metrics returned from GA4');
        return {
          sessions: 0,
          totalRevenue: 0,
          ecommercePurchases: 0,
          averageOrderValue: 0,
          conversionRate: 0,
        };
      }

      const sessions = parseFloat(metrics[0].value || '0');
      const totalRevenue = parseFloat(metrics[1].value || '0');
      const ecommercePurchases = parseFloat(metrics[2].value || '0');
      // Calculate AOV from revenue and purchases if not directly available
      const averageOrderValue = metrics[3] ? 
        parseFloat(metrics[3].value || '0') : 
        (ecommercePurchases > 0 ? totalRevenue / ecommercePurchases : 0);

      // Calculate conversion rate: purchases / sessions
      const conversionRate = sessions > 0 ? (ecommercePurchases / sessions) * 100 : 0;

      console.log(`GA4 Data Retrieved for property ${propertyId} using ${metricsUsed}:`);
      console.log(`  Sessions: ${sessions}`);
      console.log(`  Revenue: ${totalRevenue}`);
      console.log(`  Purchases: ${ecommercePurchases}`);
      console.log(`  AOV: ${averageOrderValue}`);
      console.log(`  Conversion Rate: ${conversionRate}%`);
      console.log(`  Raw metrics values:`, metrics.map(m => m.value));

      const result: AnalyticsData = {
        sessions,
        totalRevenue,
        ecommercePurchases,
        averageOrderValue,
        conversionRate,
      };

      // Get GA resource name for Brevo integration
      let gaResourceName = '';
      try {
        const properties = await this.getUserAnalyticsProperties(userId);
        const selectedProperty = properties.find(p => p.id === propertyId);
        gaResourceName = selectedProperty ? `${selectedProperty.displayName} (${selectedProperty.accountName})` : '';
      } catch (error) {
        console.error('Error getting GA resource name for Brevo:', error);
      }

      // Save metrics to database
      await storage.saveUserMetrics({
        userId,
        averageOrderValue: averageOrderValue.toString(),
        conversionRate: (conversionRate / 100).toString(), // Store as decimal
        dataSource: 'google_analytics',
        gaResourceName,
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

      // Use safe OAuth2 client for token refresh
      const refreshClient = createSafeOAuth2Client({
        refresh_token: user.googleRefreshToken,
        expiry_date: user.tokenExpiresAt,
      });

      const { credentials } = await refreshClient.refreshAccessToken();
      
      if (credentials.access_token) {
        await storage.upsertUser({
          ...user,
          googleAccessToken: credentials.access_token,
          tokenExpiresAt: credentials.expiry_date ? 
            new Date(Math.min(credentials.expiry_date, 2147483647)) : // 32-bit safe max
            new Date(Date.now() + 3600000),
        });
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  async getUserAnalyticsProperties(userId: string): Promise<any[]> {
    console.log(`Fetching Analytics properties for user: ${userId}`);
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.googleAccessToken) {
        throw new Error('User not found or no access token');
      }

      // Try to refresh token first to ensure it's valid
      await this.refreshAccessToken(userId);
      
      // Get updated credentials after refresh
      const updatedUser = await storage.getUser(userId);
      
      // Use safe OAuth2 client for API calls
      const oauth2Client = createSafeOAuth2Client({
        access_token: updatedUser?.googleAccessToken,
        refresh_token: updatedUser?.googleRefreshToken,
        expiry_date: updatedUser?.tokenExpiresAt,
      });

      const analyticsAdmin = google.analyticsadmin('v1beta');
      
      // 取得所有帳戶 - 需要 analytics.manage.users.readonly 權限
      console.log('Attempting to list Analytics accounts...');
      const accountsResponse = await safeGoogleApiCall(() => 
        analyticsAdmin.accounts.list({
          auth: oauth2Client,
        })
      );

      const properties: any[] = [];
      
      if (accountsResponse.data.accounts) {
        console.log(`Found ${accountsResponse.data.accounts.length} accounts`);
        
        for (const account of accountsResponse.data.accounts) {
          if (account.name) {
            console.log(`Processing account: ${account.displayName} (${account.name})`);
            
            try {
              // List all properties for each account
              console.log(`Listing properties for account: ${account.name}`);
              const propertiesResponse = await safeGoogleApiCall(() =>
                analyticsAdmin.properties.list({
                  auth: oauth2Client,
                  filter: `parent:${account.name}`,
                })
              );

              if (propertiesResponse.data.properties) {
                const accountProperties = propertiesResponse.data.properties.map(prop => ({
                  id: prop.name?.split('/')[1], // Extract property ID
                  displayName: prop.displayName,
                  accountName: account.displayName,
                }));
                
                console.log(`Adding ${accountProperties.length} properties from ${account.displayName}`);
                properties.push(...accountProperties);
              }
            } catch (propError) {
              console.error(`Error fetching properties for account ${account.displayName}:`, propError);
            }
          }
        }
      } else {
        console.log('No accounts found in response');
      }

      console.log(`Total properties found: ${properties.length}`);
      return properties;
    } catch (error) {
      console.error('Error fetching Analytics properties:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's an authentication error
      if (error instanceof Error) {
        if (error.message.includes('invalid_grant') || error.message.includes('invalid_token')) {
          throw new Error('Authentication expired. Please logout and login again.');
        }
        if (error.message.includes('insufficient permissions')) {
          throw new Error('Insufficient permissions to access Google Analytics. Please ensure you have Analytics access.');
        }
      }
      
      throw error;
    }
  }
}

export const analyticsService = new GoogleAnalyticsService();