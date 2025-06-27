import { storage } from "./storage";

export class AlternativeSyncService {
  
  // 方案1: 生成CSV匯出檔案
  async generateCSVExport(): Promise<string> {
    try {
      const users = await this.getAllUsers();
      
      const csvHeader = 'EMAIL,FIRSTNAME,LASTNAME,GA_RESOURCE_NAME,SIGNUP_DATE\n';
      const csvRows = users.map(user => {
        const email = user.email || '';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const gaResourceName = user.gaResourceName || '';
        const signupDate = user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '';
        
        return `"${email}","${firstName}","${lastName}","${gaResourceName}","${signupDate}"`;
      }).join('\n');
      
      return csvHeader + csvRows;
    } catch (error) {
      console.error('Error generating CSV export:', error);
      throw error;
    }
  }

  // 方案2: 生成Webhook數據 (可用Zapier或Make.com連接)
  async generateWebhookPayload(): Promise<any[]> {
    try {
      const users = await this.getAllUsers();
      
      return users.map(user => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gaResourceName: user.gaResourceName,
        signupDate: user.createdAt,
        listId: 15, // Brevo list #15
        attributes: {
          FIRSTNAME: user.gaResourceName || user.firstName,
          LASTNAME: user.lastName
        }
      }));
    } catch (error) {
      console.error('Error generating webhook payload:', error);
      throw error;
    }
  }

  // 方案3: 批次同步腳本 (可定期執行)
  async generateSyncScript(): Promise<string> {
    try {
      const users = await this.getAllUsers();
      
      const curlCommands = users.map(user => {
        const payload = {
          email: user.email,
          attributes: {
            FIRSTNAME: user.gaResourceName || user.firstName,
            LASTNAME: user.lastName
          },
          listIds: [15]
        };
        
        return `curl -X POST "https://api.brevo.com/v3/contacts" \\
  -H "accept: application/json" \\
  -H "api-key: YOUR_BREVO_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify(payload)}'`;
      });
      
      return curlCommands.join('\n\n');
    } catch (error) {
      console.error('Error generating sync script:', error);
      throw error;
    }
  }

  private async getAllUsers() {
    // 從數據庫獲取所有用戶
    // 這裡需要實現實際的數據庫查詢
    // 暫時返回空數組，實際實現時需要查詢users表
    return [];
  }
}

export const alternativeSyncService = new AlternativeSyncService();