async function testIndividual() {
  console.log('--- TEST COMPTES INDIVIDUELS STRICTS ---');

  // Test 1: Login Ayoub
  const resAyoub = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ayoub@nayparfum.ma', password: 'nouamane2024' }),
  });
  const dataAyoub = await resAyoub.json();
  console.log('Connexion Ayoub:', resAyoub.status, dataAyoub.user?.name, '(ID:', dataAyoub.user?.id, ')');

  // Test 2: Login Nouamane
  const resNouamane = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nouamane@nayparfum.ma', password: 'nouamane2024' }),
  });
  const dataNouamane = await resNouamane.json();
  console.log('Connexion Nouamane:', resNouamane.status, dataNouamane.user?.name, '(ID:', dataNouamane.user?.id, ')');

  // Verify Login Page doesn't have "Basculer" or shared profile cards
  const loginRes = await fetch('http://localhost:3000/admin/login');
  const loginHtml = await loginRes.text();
  console.log('Page Login contient "Basculer" ?', loginHtml.includes('Basculer') || loginHtml.includes('basculer'));
  console.log('Page Login contient "Connexion Compte Personnel" ?', loginHtml.includes('Connexion Compte Personnel'));
}

testIndividual();
