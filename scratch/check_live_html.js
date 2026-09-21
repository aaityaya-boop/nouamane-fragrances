async function checkHtml() {
  const res = await fetch('https://nayparfum.ma/admin/login');
  const text = await res.text();
  console.log('HTML snippet:');
  console.log(text.slice(0, 1000));
  const hasAyoub = text.includes('Ayoub') || text.includes('ayoub');
  const hasWorkspace = text.includes('Workspace') || text.includes('workspace');
  const hasAccèsRestreint = text.includes('Accès restreint');
  console.log('hasAyoub:', hasAyoub, 'hasWorkspace:', hasWorkspace, 'hasAccèsRestreint:', hasAccèsRestreint);
}

checkHtml();
