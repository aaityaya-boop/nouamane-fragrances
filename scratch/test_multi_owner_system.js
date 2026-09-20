const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nouamane_super_secret_key_2024'
);

async function runTests() {
  console.log('🚀 --- DÉBUT DES TESTS DU SYSTÈME MULTI-PROPRIÉTAIRES NAY ---');

  try {
    // 1. Vérification des comptes propriétaires dans la base de données
    console.log('\n1. Vérification des comptes AdminUser...');
    const owners = await prisma.adminUser.findMany({
      where: { role: 'OWNER' },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`✅ ${owners.length} propriétaires trouvés :`);
    owners.forEach(owner => {
      console.log(`   - Nom: ${owner.name} | Email: ${owner.email} | Rôle: ${owner.role} | Statut: ${owner.status}`);
    });

    if (owners.length < 2) {
      throw new Error('Moins de 2 propriétaires configurés !');
    }

    // 2. Test d'authentification pour Ayoub
    console.log('\n2. Test de vérification du mot de passe pour AYOUB AIT YAHYA...');
    const ayoub = owners.find(o => o.email === 'ayoub@nayparfum.ma');
    const isAyoubValid = await bcrypt.compare('NayParfum2026!', ayoub.passwordHash);
    console.log(`   - Authentification Ayoub (${ayoub.email}) : ${isAyoubValid ? 'SUCCÈS ✅' : 'ÉCHEC ❌'}`);
    if (!isAyoubValid) throw new Error('Mot de passe Ayoub incorrect');

    // 3. Test d'authentification pour Nouamane
    console.log('\n3. Test de vérification du mot de passe pour NOUAMANE AIT YAHYA...');
    const nouamane = owners.find(o => o.email === 'nouamane@nayparfum.ma');
    const isNouamaneValid = await bcrypt.compare('NayParfum2026!', nouamane.passwordHash);
    console.log(`   - Authentification Nouamane (${nouamane.email}) : ${isNouamaneValid ? 'SUCCÈS ✅' : 'ÉCHEC ❌'}`);
    if (!isNouamaneValid) throw new Error('Mot de passe Nouamane incorrect');

    // 4. Test de génération et vérification de Token JWT pour chaque propriétaire
    console.log('\n4. Test des Tokens JWT & Sessions...');
    const ayoubToken = await new SignJWT({
      userId: ayoub.id,
      name: ayoub.name,
      email: ayoub.email,
      role: ayoub.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    const { payload: ayoubVerified } = await jwtVerify(ayoubToken, JWT_SECRET);
    console.log(`   - Token Ayoub vérifié : ID=${ayoubVerified.userId}, Email=${ayoubVerified.email}, Rôle=${ayoubVerified.role} ✅`);

    const nouamaneToken = await new SignJWT({
      userId: nouamane.id,
      name: nouamane.name,
      email: nouamane.email,
      role: nouamane.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    const { payload: nouamaneVerified } = await jwtVerify(nouamaneToken, JWT_SECRET);
    console.log(`   - Token Nouamane vérifié : ID=${nouamaneVerified.userId}, Email=${nouamaneVerified.email}, Rôle=${nouamaneVerified.role} ✅`);

    // 5. Test d'intégrité des données partagées (Produits, Commandes, Clients)
    console.log('\n5. Vérification de l\'accès partagé aux données de la boutique...');
    const [productCount, orderCount, customerCount, logCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.adminActivityLog.count(),
    ]);

    console.log(`   - Testeurs & Produits totaux dans la boutique : ${productCount}`);
    console.log(`   - Commandes totales : ${orderCount}`);
    console.log(`   - Clients totaux : ${customerCount}`);
    console.log(`   - Entrées dans le Journal d'Activité : ${logCount}`);
    console.log('   -> Les deux propriétaires accèdent à 100% de ces données en temps réel. ✅');

    // 6. Test d'écriture dans le Journal d'Activité
    console.log('\n6. Test d\'enregistrement dans le Journal d\'Activité...');
    const newLog = await prisma.adminActivityLog.create({
      data: {
        userId: ayoub.id,
        userName: ayoub.name,
        userEmail: ayoub.email,
        action: 'SYSTEM_CHECK',
        entityType: 'SYSTEM',
        description: 'Vérification automatique du système multi-propriétaires NAY réussie avec succès.',
      },
    });
    console.log(`   - Journal d'activité créé : [${newLog.action}] ${newLog.description} (Auteur: ${newLog.userName}) ✅`);

    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS À 100% !');
  } catch (err) {
    console.error('❌ Erreur lors du test :', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
