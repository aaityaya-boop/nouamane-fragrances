async function testProd() {
  console.log('Testing live production API: https://nayparfum.ma/api/admin/login');
  
  try {
    const res1 = await fetch('https://nayparfum.ma/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ayoub@nayparfum.ma', password: 'NayParfum2026!' }),
    });
    console.log('Status NayParfum2026!:', res1.status);
    const data1 = await res1.json();
    console.log('Response 1:', data1);

    const res2 = await fetch('https://nayparfum.ma/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ayoub@nayparfum.ma', password: 'nouamane2024' }),
    });
    console.log('Status nouamane2024:', res2.status);
    const data2 = await res2.json();
    console.log('Response 2:', data2);

    const res3 = await fetch('https://nayparfum.ma/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'nouamane2024' }),
    });
    console.log('Status admin/nouamane2024:', res3.status);
    const data3 = await res3.json();
    console.log('Response 3:', data3);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testProd();
