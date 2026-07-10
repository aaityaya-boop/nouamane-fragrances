const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to product page...');
  await page.goto('https://nouamane-fr.vercel.app/fr/product/dolce-gabbana-devotion-intense-eau-de-parfum-tester', { waitUntil: 'networkidle2' });

  console.log('Waiting for logo to be visible...');
  await page.waitForSelector('a[href="/fr"]');
  
  console.log('Current URL:', page.url());
  console.log('Clicking logo...');
  
  await Promise.all([
    page.click('a[href="/fr"]'),
    page.waitForNavigation({ timeout: 5000 }).catch(() => console.log('Navigation timed out'))
  ]);

  console.log('New URL:', page.url());

  const isChanged = page.url() !== 'https://nouamane-fr.vercel.app/fr/product/dolce-gabbana-devotion-intense-eau-de-parfum-tester';
  console.log('Did navigation succeed?', isChanged);

  await browser.close();
})();
