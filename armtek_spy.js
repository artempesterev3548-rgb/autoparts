const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await ctx.newPage();

  const apiCalls = [];

  // Перехватываем все XHR / fetch запросы
  page.on('request', req => {
    const url = req.url();
    const type = req.resourceType();
    if (['xhr', 'fetch'].includes(type) && !url.includes('yandex') && !url.includes('google')) {
      apiCalls.push({ method: req.method(), url, type });
    }
  });

  page.on('response', async resp => {
    const url = resp.url();
    if (['xhr', 'fetch'].includes(resp.request().resourceType())) {
      try {
        const body = await resp.text();
        if (body.startsWith('{') || body.startsWith('[')) {
          console.log('=== API RESPONSE ===');
          console.log('URL:', url);
          console.log('BODY:', body.substring(0, 800));
          console.log();
        }
      } catch(e) {}
    }
  });

  const slug = 'nakladki-tormstd-bez-zaklwva19192-1700mm-420x200-8x15-80bpw-eco-plus-2-19-192-1700-00-1541-8-beral-2';
  console.log('Opening product page...');
  await page.goto(`https://armtek.ru/product/${slug}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('\n=== ALL API CALLS ===');
  apiCalls.forEach(c => console.log(c.method, c.url));

  await browser.close();
})();
