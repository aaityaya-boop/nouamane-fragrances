const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', error => {
    errors.push('PAGE_ERROR: ' + error.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('CONSOLE_ERROR: ' + msg.text());
    }
  });

  console.log('Navigating to product page...');
  await page.goto('https://nouamane-fr.vercel.app/fr/product/dolce-gabbana-devotion-intense-eau-de-parfum-tester', { waitUntil: 'networkidle2' });

  console.log('Errors on load:');
  console.log(errors);

  console.log('Clicking the logo (Home link)...');
  try {
    // The logo link is inside the Header, which has an href="/fr"
    await page.click('a[href="/fr"]');
    console.log('Clicked logo successfully.');
  } catch (err) {
    console.log('Error clicking logo:', err);
  }

  // Wait a bit to see if navigation occurs or errors happen
  await new Promise(r => setTimeout(r, 3000));

  console.log('Errors after click:');
  console.log(errors);

  console.log('Current URL after click:', page.url());

  await browser.close();
})();
