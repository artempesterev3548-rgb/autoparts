const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await ctx.newPage();

  const apiCalls = [];

  page.on('request', req => {
    const url = req.url();
    if (url.includes('/rest/') && !url.includes('banner') && !url.includes('yandex')) {
      apiCalls.push({
        method: req.method(),
        url,
        body: req.postData() || ''
      });
    }
  });

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('/rest/') && !url.includes('banner') && !url.includes('yandex')) {
      try {
        const body = await resp.text();
        if (body.startsWith('{') || body.startsWith('[')) {
          const req = resp.request();
          console.log('=== API ===');
          console.log('METHOD:', req.method());
          console.log('URL:', url);
          if (req.postData()) console.log('REQUEST BODY:', req.postData().substring(0, 300));
          console.log('RESPONSE:', body.substring(0, 600));
          console.log();
        }
      } catch(e) {}
    }
  });

  const slug = 'nakladki-tormstd-bez-zaklwva19192-1700mm-420x200-8x15-80bpw-eco-plus-2-19-192-1700-00-1541-8-beral-2';
  await page.goto(`https://armtek.ru/product/${slug}`, { 
    waitUntil: 'domcontentloaded', 
    timeout: 15000 
  });
  await page.waitForTimeout(5000);
  await browser.close();
})();
