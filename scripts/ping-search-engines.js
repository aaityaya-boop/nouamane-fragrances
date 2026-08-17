const https = require('https');

const SITEMAP_URL = 'https://nayparfum.ma/sitemap.xml';

const searchEngines = [
  {
    name: 'Google',
    url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  },
  {
    name: 'Bing',
    url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  }
];

console.log('Pinging search engines with sitemap:', SITEMAP_URL);

searchEngines.forEach(engine => {
  https.get(engine.url, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Successfully pinged ${engine.name}`);
    } else {
      console.error(`❌ Failed to ping ${engine.name}. Status code: ${res.statusCode}`);
    }
  }).on('error', (e) => {
    console.error(`❌ Error pinging ${engine.name}:`, e.message);
  });
});
