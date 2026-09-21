async function verifyAll() {
  console.log('--- VÉRIFICATION DES 2 PROFILS ADMIN ---');
  
  const loginRes = await fetch('http://localhost:3000/admin/login');
  console.log('Login page status:', loginRes.status);
  const loginHtml = await loginRes.text();
  console.log('- Contient AYOUB AIT YAHYA ?', loginHtml.includes('AYOUB AIT YAHYA'));
  console.log('- Contient NOUAMANE AIT YAHYA ?', loginHtml.includes('NOUAMANE AIT YAHYA'));
  console.log('- Contient "Qui se connecte ?" ?', loginHtml.includes('Qui se connecte'));

  const profilesApi = await fetch('http://localhost:3000/api/admin/auth/profiles');
  const profilesData = await profilesApi.json();
  console.log('Profiles API:', profilesData);
}

verifyAll();
