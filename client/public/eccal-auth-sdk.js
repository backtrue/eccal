/**
 * Eccal Auth SDK - 外部網站認證整合
 * 版本: 1.0.0
 * 用於與 Eccal 帳號中心進行 SSO 認證整合
 */

class EccalAuth {
    constructor(options) {
        this.baseUrl = options.baseUrl || 'https://eccal.thinkwithblack.com';
        this.siteName = options.siteName || 'External Site';
        this.onLogin = options.onLogin || (() => {});
        this.onLogout = options.onLogout || (() => {});
        this.onError = options.onError || ((error) => console.error('Eccal Auth Error:', error));
        
        // 內部狀態
        this.user = null;
        this.token = null;
        this.tokenKey = 'eccal_auth_token';
        this.userKey = 'eccal_auth_user';
        
        // 初始化
        this.init();
    }

    /**
     * 初始化 SDK
     */
    async init() {
        // 檢查 URL 參數中是否有認證回調
        const urlParams = new URLSearchParams(window.location.search);
        const authSuccess = urlParams.get('auth_success');
        const token = urlParams.get('token');
        
        if (authSuccess === 'true' && token) {
            // 處理認證成功回調
            await this.handleAuthCallback(token);
            // 清理 URL 參數
            this.cleanupUrl();
        } else {
            // 檢查本地存儲的認證狀態
            this.loadStoredAuth();
        }
    }

    /**
     * 處理認證回調
     */
    async handleAuthCallback(token) {
        try {
            this.token = token;
            localStorage.setItem(this.tokenKey, token);
            
            // 驗證 token 並獲取用戶資訊
            const user = await this.verifyToken(token);
            if (user) {
                this.user = user;
                localStorage.setItem(this.userKey, JSON.stringify(user));
                this.onLogin(user);
            }
        } catch (error) {
            this.onError(error);
        }
    }

    /**
     * 清理 URL 參數
     */
    cleanupUrl() {
        const url = new URL(window.location);
        url.searchParams.delete('auth_success');
        url.searchParams.delete('token');
        url.searchParams.delete('error');
        window.history.replaceState({}, document.title, url.toString());
    }

    /**
     * 載入本地存儲的認證資訊
     */
    loadStoredAuth() {
        const storedToken = localStorage.getItem(this.tokenKey);
        const storedUser = localStorage.getItem(this.userKey);
        
        if (storedToken && storedUser) {
            this.token = storedToken;
            try {
                this.user = JSON.parse(storedUser);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                this.clearStoredAuth();
            }
        }
    }

    /**
     * 清除本地存儲的認證資訊
     */
    clearStoredAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.token = null;
        this.user = null;
    }

    /**
     * 檢查用戶是否已認證
     */
    async checkAuth() {
        if (!this.token) {
            return null;
        }

        try {
            const user = await this.verifyToken(this.token);
            if (user) {
                this.user = user;
                localStorage.setItem(this.userKey, JSON.stringify(user));
                return user;
            } else {
                this.clearStoredAuth();
                return null;
            }
        } catch (error) {
            this.clearStoredAuth();
            return null;
        }
    }

    /**
     * 驗證 token 有效性
     */
    async verifyToken(token) {
        console.log('Verifying token with:', {
            baseUrl: this.baseUrl,
            origin: window.location.origin,
            token: token ? 'present' : 'missing'
        });
        
        try {
            const response = await fetch(`${this.baseUrl}/api/sso/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                credentials: 'include',
                body: JSON.stringify({ token })
            });

            console.log('Token verification response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token verification failed:', errorText);
                throw new Error(`Token verification failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.valid ? data.user : null;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    /**
     * 執行登入
     */
    login() {
        const currentUrl = window.location.href;
        const origin = window.location.origin;
        
        // 構建登入 URL
        const loginUrl = `${this.baseUrl}/api/sso/login?` +
            `returnTo=${encodeURIComponent(currentUrl)}&` +
            `origin=${encodeURIComponent(origin)}&` +
            `siteName=${encodeURIComponent(this.siteName)}`;
        
        // 重定向到登入頁面
        window.location.href = loginUrl;
    }

    /**
     * 執行登出
     */
    async logout() {
        try {
            if (this.token) {
                // 調用後端登出 API
                await fetch(`${this.baseUrl}/api/sso/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // 無論 API 調用是否成功，都清除本地認證資訊
            this.clearStoredAuth();
            this.onLogout();
        }
    }

    /**
     * 獲取當前用戶資訊
     */
    getUser() {
        return this.user;
    }

    /**
     * 獲取當前 token
     */
    getToken() {
        return this.token;
    }

    /**
     * 檢查用戶是否已登入
     */
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    /**
     * 獲取用戶詳細資訊
     */
    async getUserDetails(userId) {
        if (!this.token) {
            throw new Error('User not authenticated');
        }

        console.log('Fetching user details:', {
            userId,
            baseUrl: this.baseUrl,
            origin: window.location.origin
        });

        try {
            const response = await fetch(`${this.baseUrl}/api/account-center/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Origin': window.location.origin
                },
                credentials: 'include'
            });

            console.log('User details response:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('User details request failed:', errorText);
                throw new Error(`Failed to fetch user details: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('User details request error:', error);
            throw error;
        }
    }

    /**
     * 獲取用戶會員資訊
     */
    async getMembershipInfo(userId) {
        if (!this.token) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/account-center/membership/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch membership info');
            }
        } catch (error) {
            throw new Error('Membership info request failed: ' + error.message);
        }
    }

    /**
     * 獲取用戶點數資訊
     */
    async getCreditsInfo(userId) {
        if (!this.token) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/account-center/credits/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch credits info');
            }
        } catch (error) {
            throw new Error('Credits info request failed: ' + error.message);
        }
    }

    /**
     * 刷新 token
     */
    async refreshToken() {
        if (!this.token) {
            throw new Error('No token to refresh');
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/sso/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                localStorage.setItem(this.tokenKey, this.token);
                return this.token;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            this.clearStoredAuth();
            throw new Error('Token refresh request failed: ' + error.message);
        }
    }

    /**
     * 執行需要認證的 API 請求
     */
    async authenticatedRequest(url, options = {}) {
        if (!this.token) {
            throw new Error('User not authenticated');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, mergedOptions);
            
            if (response.status === 401) {
                // Token 可能已過期，嘗試刷新
                try {
                    await this.refreshToken();
                    // 重新發送請求
                    mergedOptions.headers.Authorization = `Bearer ${this.token}`;
                    return await fetch(url, mergedOptions);
                } catch (refreshError) {
                    // 刷新失敗，清除認證狀態
                    this.clearStoredAuth();
                    this.onLogout();
                    throw new Error('Authentication expired');
                }
            }

            return response;
        } catch (error) {
            throw new Error('Authenticated request failed: ' + error.message);
        }
    }

    /**
     * 監聽認證狀態變化
     */
    onAuthStateChange(callback) {
        // 監聽 storage 事件以同步多個分頁的認證狀態
        window.addEventListener('storage', (event) => {
            if (event.key === this.tokenKey || event.key === this.userKey) {
                this.loadStoredAuth();
                callback(this.user);
            }
        });
    }

    /**
     * 獲取系統健康狀態
     */
    async getSystemHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/api/account-center/health`);
            return await response.json();
        } catch (error) {
            throw new Error('Health check failed: ' + error.message);
        }
    }
}

// 全域暴露 EccalAuth 類別
window.EccalAuth = EccalAuth;

// 支援 AMD/CommonJS 模組系統
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EccalAuth;
} else if (typeof define === 'function' && define.amd) {
    define([], function() {
        return EccalAuth;
    });
}