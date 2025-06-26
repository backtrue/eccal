import { Wrench, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

function MaintenancePage() {
  useEffect(() => {
    // 強制清除所有緩存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // 清除 localStorage 和 sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.log('Storage clear failed:', e);
    }
    
    // 設置 meta 標籤防止緩存
    const metaTags = [
      { name: 'cache-control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'pragma', content: 'no-cache' },
      { name: 'expires', content: '0' }
    ];
    
    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            系統維修中
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            我們正在進行系統升級維護，為您提供更好的服務體驗。
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <span className="font-medium">明日 8:00 恢復服務</span>
          </div>
          <p className="text-sm text-gray-500">
            感謝您的耐心等候，造成不便敬請見諒。
          </p>
          <div className="mt-4 text-xs text-gray-400">
            緩存已清除 - 刷新時間: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return <MaintenancePage />;
}

export default App;