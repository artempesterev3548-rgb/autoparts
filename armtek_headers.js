const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  page.on('request', req => {
    if (req.url().includes('/auth-microservice/v1/guest')) {
      console.log('=== AUTH REQUEST HEADERS ===');
      console.log(JSON.stringify(req.headers(), null, 2));
      console.log('POST BODY:', req.postData());
    }
  });

  page.on('response', async resp => {
    if (resp.url().includes('/auth-microservice/v1/guest')) {
      console.log('=== AUTH RESPONSE ===');
      console.log('Status:', resp.status());
      const body = await resp.text();
      console.log('Body:', body.substring(0, 300));
    }
  });

  await page.goto('https://armtek.ru/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(4000);
  await browser.close();
})();
