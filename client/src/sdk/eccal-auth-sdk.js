/**
 * Eccal Account Center Authentication SDK
 * 用於外部網站接入帳號中心的 JavaScript SDK
 */

class EccalAuthSDK {
  constructor(config = {}) {
    this.accountCenterUrl = config.accountCenterUrl || 'https://eccal.thinkwithblack.com';
    this.clientOrigin = config.clientOrigin || window.location.origin;
    this.tokenKey = config.tokenKey || 'eccal_auth_token';
    this.userKey = config.userKey || 'eccal_user_data';
    this.debug = config.debug || false;
    
    // 自動初始化
    this.init();
  }

  /**
   * 初始化 SDK
   */
  init() {
    this.log('Eccal Auth SDK initialized');
    
    // 檢查 URL 參數中是否有 token（SSO 回調後）
    this.handleSSOCallback();
  }

  /**
   * 日誌輸出
   */
  log(message, ...args) {
    if (this.debug) {
      console.log(`[EccalAuth] ${message}`, ...args);
    }
  }

  /**
   * 處理 SSO 回調
   */
  handleSSOCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('user_id');
    
    if (token && userId) {
      this.log('SSO callback detected, storing token');
      this.setToken(token);
      
      // 清除 URL 中的 token 參數
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // 觸發登入成功事件
      this.triggerEvent('login_success', { token, userId });
    }
  }

  /**
   * 檢查用戶是否已登入
   */
  isLoggedIn() {
    const token = this.getToken();
    return token !== null;
  }

  /**
   * 獲取儲存的 Token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * 設置 Token
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * 清除 Token
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * 重定向到帳號中心登入
   */
  login(returnTo = window.location.href) {
    const loginUrl = new URL(`${this.accountCenterUrl}/api/sso/login`);
    loginUrl.searchParams.set('returnTo', returnTo);
    loginUrl.searchParams.set('origin', this.clientOrigin);
    
    this.log('Redirecting to login:', loginUrl.toString());
    window.location.href = loginUrl.toString();
  }

  /**
   * 登出
   */
  async logout(returnTo = window.location.origin) {
    try {
      const response = await fetch(`${this.accountCenterUrl}/api/sso/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnTo,
          origin: this.clientOrigin
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        this.clearToken();
        this.triggerEvent('logout_success');
        this.log('Logout successful');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      this.log('Logout error:', error);
      throw error;
    }
  }

  /**
   * 驗證 Token 有效性
   */
  async verifyToken(token = null) {
    const tokenToVerify = token || this.getToken();
    
    if (!tokenToVerify) {
      return { valid: false, error: 'No token provided' };
    }

    try {
      const response = await fetch(`${this.accountCenterUrl}/api/sso/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.valid) {
        this.log('Token verification successful');
        localStorage.setItem(this.userKey, JSON.stringify(result.user));
      } else {
        this.log('Token verification failed:', result.error);
        this.clearToken();
      }

      return result;
    } catch (error) {
      this.log('Token verification error:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * 獲取用戶資料
   */
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${this.accountCenterUrl}/api/account-center/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        this.log('User profile fetched successfully');
        return userData;
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      this.log('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶會員資訊
   */
  async getMembershipInfo(userId) {
    try {
      const response = await fetch(`${this.accountCenterUrl}/api/account-center/membership/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const membershipData = await response.json();
        this.log('Membership info fetched successfully');
        return membershipData;
      } else {
        throw new Error('Failed to fetch membership info');
      }
    } catch (error) {
      this.log('Get membership info error:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶點數資訊
   */
  async getCreditsInfo(userId) {
    try {
      const response = await fetch(`${this.accountCenterUrl}/api/account-center/credits/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const creditsData = await response.json();
        this.log('Credits info fetched successfully');
        return creditsData;
      } else {
        throw new Error('Failed to fetch credits info');
      }
    } catch (error) {
      this.log('Get credits info error:', error);
      throw error;
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken() {
    try {
      const response = await fetch(`${this.accountCenterUrl}/api/sso/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        this.setToken(result.token);
        this.log('Token refreshed successfully');
        return result.token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      this.log('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * 獲取快取的用戶資料
   */
  getCachedUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * 事件處理
   */
  triggerEvent(eventName, data = {}) {
    const event = new CustomEvent(`eccal_auth_${eventName}`, {
      detail: data
    });
    window.dispatchEvent(event);
  }

  /**
   * 監聽事件
   */
  on(eventName, callback) {
    window.addEventListener(`eccal_auth_${eventName}`, callback);
  }

  /**
   * 移除事件監聽
   */
  off(eventName, callback) {
    window.removeEventListener(`eccal_auth_${eventName}`, callback);
  }

  /**
   * 健康檢查
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.accountCenterUrl}/api/account-center/health`);
      const result = await response.json();
      this.log('Health check result:', result);
      return result;
    } catch (error) {
      this.log('Health check error:', error);
      throw error;
    }
  }

  /**
   * 完整的認證流程
   */
  async authenticate() {
    // 1. 檢查是否已有 token
    const token = this.getToken();
    if (!token) {
      this.log('No token found, user needs to login');
      return { authenticated: false, reason: 'no_token' };
    }

    // 2. 驗證 token 有效性
    const verification = await this.verifyToken(token);
    if (!verification.valid) {
      this.log('Token invalid, user needs to login');
      return { authenticated: false, reason: 'invalid_token' };
    }

    // 3. 獲取用戶完整資料
    try {
      const userProfile = await this.getUserProfile(verification.user.id);
      this.log('Authentication successful');
      return {
        authenticated: true,
        user: userProfile,
        token: token
      };
    } catch (error) {
      this.log('Failed to fetch user profile:', error);
      return { authenticated: false, reason: 'profile_fetch_failed' };
    }
  }
}

// 使用範例
/*
// 1. 初始化 SDK
const eccalAuth = new EccalAuthSDK({
  accountCenterUrl: 'https://eccal.thinkwithblack.com',
  clientOrigin: window.location.origin,
  debug: true
});

// 2. 監聽認證事件
eccalAuth.on('login_success', (event) => {
  console.log('User logged in:', event.detail);
  // 重新載入頁面或更新 UI
});

eccalAuth.on('logout_success', (event) => {
  console.log('User logged out');
  // 重新載入頁面或更新 UI
});

// 3. 檢查認證狀態
eccalAuth.authenticate().then(result => {
  if (result.authenticated) {
    console.log('User is authenticated:', result.user);
    // 顯示用戶資訊
  } else {
    console.log('User not authenticated:', result.reason);
    // 顯示登入按鈕
  }
});

// 4. 登入/登出
document.getElementById('login-btn').addEventListener('click', () => {
  eccalAuth.login();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  eccalAuth.logout();
});
*/

// 如果是 CommonJS 環境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EccalAuthSDK;
}

// 如果是 ES6 模組環境
if (typeof window !== 'undefined') {
  window.EccalAuthSDK = EccalAuthSDK;
}