const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to product page...');
  await page.goto('http://localhost:3000/fr/product/dolce-gabbana-devotion-intense-eau-de-parfum-tester', { waitUntil: 'domcontentloaded' });

  console.log('Waiting for related product link...');
  const linkSelector = 'a[href*="/product/"]';
  await page.waitForSelector(linkSelector);
  
  const links = await page.$$(linkSelector);
  let targetLink = null;
  for (const link of links) {
    const href = await page.evaluate(el => el.getAttribute('href'), link);
    if (href && href.includes('dolce-gabbana-king')) {
      targetLink = link;
      break;
    }
  }

  if (targetLink) {
    console.log('Clicking related product link...');
    await targetLink.click();
    console.log('Clicked. Waiting 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
    console.log('Current URL after click:', page.url());
  } else {
    console.log('Could not find target link.');
  }

  await browser.close();
})();
