const https = require('https');

const host = 'api.indexnow.org';
const key = '2456e4c76b9745da859cd63b7e616c68';
const keyLocation = `https://nayparfum.ma/${key}.txt`;
const urlList = [
  'https://nayparfum.ma',
  'https://nayparfum.ma/fr/blog/difference-testeur-original'
];

const postData = JSON.stringify({
  host: 'nayparfum.ma',
  key: key,
  keyLocation: keyLocation,
  urlList: urlList
});

const options = {
  hostname: host,
  path: '/IndexNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log('✅ Successfully submitted URLs to Bing IndexNow!');
    } else {
      console.log(`❌ Failed to submit to IndexNow. Status code: ${res.statusCode}`);
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
