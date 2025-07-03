import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [cookieCheck, setCookieCheck] = useState<any>({});
  const [authCheck, setAuthCheck] = useState<any>({});

  const checkCookies = async () => {
    try {
      const response = await fetch('/api/auth/check-cookie');
      const data = await response.json();
      setCookieCheck(data);
    } catch (error) {
      setCookieCheck({ error: String(error) });
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setAuthCheck({ success: true, user: data });
      } else {
        const errorData = await response.json();
        setAuthCheck({ success: false, error: errorData });
      }
    } catch (error) {
      setAuthCheck({ success: false, error: String(error) });
    }
  };

  const setTestJWT = async () => {
    try {
      const response = await fetch('/api/auth/test-jwt');
      const data = await response.json();
      alert(`Test JWT set: ${data.message}`);
      // 重新檢查
      checkCookies();
      checkAuth();
    } catch (error) {
      alert(`Error: ${String(error)}`);
    }
  };

  useEffect(() => {
    // 收集 URL 和頁面資訊
    const urlParams = new URLSearchParams(window.location.search);
    setDebugInfo({
      currentURL: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hasAuthSuccess: urlParams.has('auth_success'),
      authSuccessValue: urlParams.get('auth_success'),
      allParams: Object.fromEntries(urlParams.entries())
    });

    // 初始檢查
    checkCookies();
    checkAuth();
  }, []);

  const addAuthSuccess = () => {
    const newURL = window.location.pathname + '?auth_success=1';
    window.history.pushState({}, '', newURL);
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid gap-6">
        {/* URL 資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>URL Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Current URL:</strong> {debugInfo.currentURL}</div>
              <div><strong>Pathname:</strong> {debugInfo.pathname}</div>
              <div><strong>Search:</strong> {debugInfo.search}</div>
              <div><strong>Has auth_success:</strong> {debugInfo.hasAuthSuccess ? 'Yes' : 'No'}</div>
              <div><strong>auth_success value:</strong> {debugInfo.authSuccessValue || 'None'}</div>
              <div><strong>All params:</strong> {JSON.stringify(debugInfo.allParams, null, 2)}</div>
            </div>
            <Button onClick={addAuthSuccess} className="mt-4">
              Add ?auth_success=1
            </Button>
          </CardContent>
        </Card>

        {/* Cookie 檢查 */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie Check</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs">
              {JSON.stringify(cookieCheck, null, 2)}
            </pre>
            <Button onClick={checkCookies} className="mt-4">
              Refresh Cookie Check
            </Button>
          </CardContent>
        </Card>

        {/* 認證檢查 */}
        <Card>
          <CardHeader>
            <CardTitle>Auth Check</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs">
              {JSON.stringify(authCheck, null, 2)}
            </pre>
            <Button onClick={checkAuth} className="mt-4">
              Refresh Auth Check
            </Button>
          </CardContent>
        </Card>

        {/* 測試工具 */}
        <Card>
          <CardHeader>
            <CardTitle>Test Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-x-4">
              <Button onClick={setTestJWT}>
                Set Test JWT
              </Button>
              <Button onClick={() => window.location.href = '/api/auth/google'}>
                Google Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}