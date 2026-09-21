async function testLocal() {
  const res = await fetch('http://localhost:3000/admin/login');
  const text = await res.text();
  console.log('Local status:', res.status);
  console.log('has Ayoub:', text.includes('Ayoub') || text.includes('ayoub'));
  console.log('has Nouamane:', text.includes('Nouamane') || text.includes('nouamane'));
  console.log('has Espace Propriétaires:', text.includes('Espace Propriétaires'));
}

testLocal();
