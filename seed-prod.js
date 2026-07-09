const http = require('http');
const https = require('https');

async function seedProd() {
  const baseUrl = 'https://nouamane-fr.vercel.app';
  
  console.log('1. Logging in...');
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'nouamane2024' })
  });
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Login status:', loginRes.status);
  
  if (!cookies) {
    console.error('Failed to get cookies!');
    return;
  }
  
  console.log('2. Seeding config (POST)...');
  const confRes = await fetch(`${baseUrl}/api/admin/seed-config`, {
    method: 'POST',
    headers: { 'Cookie': cookies }
  });
  console.log('Config:', await confRes.text());
  
  console.log('3. Seeding reviews (POST)...');
  const revRes = await fetch(`${baseUrl}/api/admin/seed-reviews`, {
    method: 'POST',
    headers: { 'Cookie': cookies }
  });
  console.log('Reviews:', await revRes.text());
  
  console.log('Done!');
}

seedProd().catch(console.error);
