// 測試 Hero Post 查找功能的獨立腳本
const axios = require('axios');

async function testHeroPost() {
  try {
    console.log('測試 Hero Post 查找功能...');
    
    // 使用你的 Facebook 帳戶 ID 和 Access Token
    const accountId = '1751732735208'; // 替換為實際的帳戶 ID
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN; // 確保環境變量設置
    
    if (!accessToken) {
      console.error('請設置 FACEBOOK_ACCESS_TOKEN 環境變量');
      return;
    }
    
    // 構建 API URL
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const since = sevenDaysAgo.toISOString().split('T')[0];
    const until = today.toISOString().split('T')[0];
    
    const url = `https://graph.facebook.com/v21.0/act_${accountId}/insights?` +
      `level=ad&` +
      `fields=ad_name,ctr,outbound_clicks_ctr,actions,spend,clicks,impressions&` +
      `time_range={"since":"${since}","until":"${until}"}&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    console.log('API URL:', url.replace(accessToken, '***'));
    
    // 發送請求
    const response = await axios.get(url);
    const data = response.data;
    
    console.log('API 回應狀態:', response.status);
    console.log('找到廣告數據:', data.data.length, '筆');
    
    if (data.data.length > 0) {
      console.log('\n前5筆廣告數據樣本:');
      data.data.slice(0, 5).forEach((ad, index) => {
        console.log(`${index + 1}. 廣告名稱: ${ad.ad_name}`);
        console.log(`   CTR: ${ad.ctr}%`);
        console.log(`   曝光: ${ad.impressions}`);
        console.log(`   花費: $${ad.spend}`);
        console.log('');
      });
      
      // 篩選 Hero Post
      const heroPosts = data.data
        .filter(ad => ad.ad_name && ad.ad_name !== '(not set)')
        .filter(ad => parseInt(ad.impressions || '0') >= 500)
        .filter(ad => parseFloat(ad.ctr || '0') > 0)
        .sort((a, b) => parseFloat(b.ctr || '0') - parseFloat(a.ctr || '0'))
        .slice(0, 3);
      
      console.log('找到 Hero Post:', heroPosts.length, '筆');
      heroPosts.forEach((hero, index) => {
        console.log(`Hero Post ${index + 1}:`);
        console.log(`  名稱: ${hero.ad_name}`);
        console.log(`  CTR: ${hero.ctr}%`);
        console.log(`  曝光: ${hero.impressions}`);
        console.log(`  花費: $${hero.spend}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('測試失敗:', error.response?.data || error.message);
  }
}

testHeroPost();