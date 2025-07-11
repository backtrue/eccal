#!/usr/bin/env node
/**
 * 完整的 API 測試腳本
 * 測試所有 Account Center 和 SSO 端點
 */

import https from 'https';
import http from 'http';

// 測試配置
const API_BASE = 'http://localhost:5000';
const TEST_ORIGIN = 'https://audai.thinkwithblack.com';

// 測試結果追蹤
let testResults = [];
let testToken = null;
let testUserId = null;

// HTTP 請求輔助函數
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': TEST_ORIGIN,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 測試輔助函數
function logTest(name, success, details) {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${name}: ${details}`);
  testResults.push({ name, success, details });
}

// 測試函數
async function testHealthCheck() {
  console.log('\n🏥 測試健康檢查端點');
  try {
    const response = await makeRequest('GET', '/api/account-center/health');
    
    if (response.statusCode === 200 && response.data.status === 'healthy') {
      logTest('健康檢查', true, `狀態正常 (${response.data.version})`);
    } else {
      logTest('健康檢查', false, `狀態碼: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('健康檢查', false, `錯誤: ${error.message}`);
  }
}

async function testGoogleSSO() {
  console.log('\n🔑 測試 Google SSO 認證');
  try {
    const testUser = {
      email: 'apitest@example.com',
      name: 'API Test User',
      picture: 'https://example.com/avatar.jpg',
      service: 'audai'
    };

    const response = await makeRequest('POST', '/api/auth/google-sso', testUser);
    
    if (response.statusCode === 200 && response.data.success) {
      testToken = response.data.token;
      testUserId = response.data.user.id;
      logTest('Google SSO 認證', true, `用戶 ID: ${testUserId.substring(0, 8)}...`);
      logTest('JWT Token 生成', true, `Token 長度: ${testToken.length}`);
      logTest('新用戶點數', true, `獲得 ${response.data.user.credits} 點數`);
    } else {
      logTest('Google SSO 認證', false, `失敗: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    logTest('Google SSO 認證', false, `錯誤: ${error.message}`);
  }
}

async function testUserData() {
  console.log('\n👤 測試用戶資料端點');
  if (!testToken || !testUserId) {
    logTest('用戶資料測試', false, '需要先完成 Google SSO 認證');
    return;
  }

  try {
    const response = await makeRequest('GET', `/api/account-center/user/${testUserId}`, null, {
      'Authorization': `Bearer ${testToken}`
    });
    
    if (response.statusCode === 200 && response.data.email) {
      logTest('用戶資料查詢', true, `Email: ${response.data.email}`);
      logTest('用戶資料完整性', true, `包含 ${Object.keys(response.data).length} 個欄位`);
    } else {
      logTest('用戶資料查詢', false, `狀態碼: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('用戶資料查詢', false, `錯誤: ${error.message}`);
  }
}

async function testCredits() {
  console.log('\n💰 測試點數系統端點');
  if (!testToken || !testUserId) {
    logTest('點數系統測試', false, '需要先完成 Google SSO 認證');
    return;
  }

  try {
    const response = await makeRequest('GET', `/api/account-center/credits/${testUserId}`, null, {
      'Authorization': `Bearer ${testToken}`
    });
    
    if (response.statusCode === 200 && typeof response.data.balance === 'number') {
      logTest('點數查詢', true, `餘額: ${response.data.balance} 點`);
      logTest('點數記錄', true, `總獲得: ${response.data.earned}, 總花費: ${response.data.spent}`);
    } else {
      logTest('點數查詢', false, `狀態碼: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('點數查詢', false, `錯誤: ${error.message}`);
  }
}

async function testMembership() {
  console.log('\n🎫 測試會員資料端點');
  if (!testToken || !testUserId) {
    logTest('會員資料測試', false, '需要先完成 Google SSO 認證');
    return;
  }

  try {
    const response = await makeRequest('GET', `/api/account-center/membership/${testUserId}`, null, {
      'Authorization': `Bearer ${testToken}`
    });
    
    if (response.statusCode === 200 && response.data.level) {
      logTest('會員資料查詢', true, `級別: ${response.data.level}`);
      logTest('會員功能清單', true, `功能數量: ${response.data.features?.length || 0}`);
    } else {
      logTest('會員資料查詢', false, `狀態碼: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('會員資料查詢', false, `錯誤: ${error.message}`);
  }
}

async function testTokenVerification() {
  console.log('\n🔒 測試 Token 驗證端點');
  if (!testToken) {
    logTest('Token 驗證測試', false, '需要先完成 Google SSO 認證');
    return;
  }

  try {
    const response = await makeRequest('POST', '/api/sso/verify-token', {
      token: testToken
    });
    
    if (response.statusCode === 200 && response.data.valid) {
      logTest('Token 驗證', true, `用戶: ${response.data.user.email}`);
    } else {
      logTest('Token 驗證', false, `狀態碼: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Token 驗證', false, `錯誤: ${error.message}`);
  }
}

async function testCORS() {
  console.log('\n🌐 測試 CORS 設定');
  try {
    const response = await makeRequest('OPTIONS', '/api/account-center/health', null, {
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Authorization'
    });
    
    if (response.statusCode === 200) {
      logTest('CORS 預檢請求', true, '允許跨域請求');
    } else {
      logTest('CORS 預檢請求', false, `狀態碼: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('CORS 預檢請求', false, `錯誤: ${error.message}`);
  }
}

// 主測試函數
async function runAllTests() {
  console.log('🚀 開始 API 完整性測試');
  console.log(`🎯 目標: ${API_BASE}`);
  console.log(`🌐 來源: ${TEST_ORIGIN}`);
  console.log('=' * 50);

  // 按順序執行測試
  await testHealthCheck();
  await testGoogleSSO();
  await testUserData();
  await testCredits();
  await testMembership();
  await testTokenVerification();
  await testCORS();

  // 測試結果總結
  console.log('\n📊 測試結果總結');
  console.log('=' * 50);
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`總測試數: ${totalTests}`);
  console.log(`✅ 通過: ${passedTests}`);
  console.log(`❌ 失敗: ${failedTests}`);
  console.log(`📈 通過率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log('\n❌ 失敗的測試:');
    testResults.filter(r => !r.success).forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n🎉 API 測試完成！');
  
  // 為 AudAI 提供的整合狀態
  if (passedTests >= 6) {
    console.log('\n✅ 系統已準備就緒供 AudAI 整合');
    console.log('📋 下一步：參考 AUDAI_INTEGRATION_GUIDE.md 進行整合');
  } else {
    console.log('\n⚠️  系統尚未完全準備就緒，請檢查失敗的測試');
  }
}

// 執行測試
runAllTests().catch(console.error);