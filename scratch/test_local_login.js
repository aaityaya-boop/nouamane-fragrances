async function testLocalLogin() {
  console.log('--- TEST LOCAL LOGIN ---');
  
  const res1 = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ayoub@nayparfum.ma', password: 'nouamane2024' }),
  });
  const d1 = await res1.json();
  console.log('Login Ayoub with nouamane2024:', res1.status, d1);

  const res2 = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nouamane@nayparfum.ma', password: 'NayParfum2026!' }),
  });
  const d2 = await res2.json();
  console.log('Login Nouamane with NayParfum2026!:', res2.status, d2);
}

testLocalLogin();
