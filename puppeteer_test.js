const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('https://nouamane-fr.vercel.app/fr/account', { waitUntil: 'networkidle2' });

  console.log("Page loaded. Clicking Google button...");
  
  // Find the button with text "Google"
  const [button] = await page.$x("//button[contains(., 'Google')]");
  if (button) {
    await button.click();
    console.log("Clicked Google button. Waiting for 3 seconds...");
    await new Promise(r => setTimeout(r, 3000));
  } else {
    console.log("Google button not found!");
  }

  await browser.close();
})();
