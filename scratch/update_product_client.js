const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/[locale]/product/[slug]/ProductClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Import translations
if (!content.includes('import { translations, Locale }')) {
  content = content.replace(
    "import ReactMarkdown from 'react-markdown';",
    "import ReactMarkdown from 'react-markdown';\nimport { translations, Locale } from './translations';"
  );
}

// 2. Setup dictionary
if (!content.includes('const t = translations')) {
  content = content.replace(
    "const locale = pathname?.split('/')[1] || 'fr';",
    "const locale = (pathname?.split('/')[1] || 'fr') as Locale;\n  const t = translations[locale] || translations.fr;"
  );
}

// 3. Replacements

const replacements = [
  // Breadcrumb
  [/>Accueil<\/Link>/g, '>{t.breadcrumb.home}</Link>'],
  [/>Boutique<\/Link>/g, '>{t.breadcrumb.shop}</Link>'],

  // Info
  [/TESTEUR 100% AUTHENTIQUE/g, '{t.info.authentic}'],
  [/avis vérifiés<\/a>/g, '{t.info.verifiedReviews}</a>'],
  [/Économisez \{Math\.round/g, '{t.info.save} {Math.round'],
  // Taxes incluses
  [/Taxes incluses\. \/ \{currentSize\.label\} \(Testeur\)/g, '{currentSize.label} {t.info.tester}'],
  [/Rupture de stock/g, '{t.info.outOfStock}'],

  // Trust
  [/>Paiement à la livraison sécurisé<\/span>/g, '>{t.trust.cod}</span>'],
  [/>Testeur 100% Original Authentique<\/span>/g, '>{t.trust.original}</span>'],

  // Selector
  [/>Sélectionnez la Contenance<\/div>/g, '>{t.selector.selectSize}</div>'],

  // Actions
  [/> Ajouté avec succès !/g, '> {t.actions.addSuccess}'],
  [/>Ajouter au panier — /g, '>{t.actions.addToCart} — '],
  [/> Ajouté<\/>/g, '> {t.actions.added}</>'],
  [/> Ajouter<\/>/g, '> {t.actions.add}</>'],

  // Perks
  [/label="100% Authentique"/g, 'label={t.perks.authLabel}'],
  [/sublabel="Garanti"/g, 'sublabel={t.perks.authSub}'],
  [/label="Livraison Express"/g, 'label={t.perks.expressLabel}'],
  [/sublabel="Partout au Maroc"/g, 'sublabel={t.perks.expressSub}'],
  [/label="Paiement Sécurisé"/g, 'label={t.perks.secureLabel}'],
  [/sublabel="À la livraison"/g, 'sublabel={t.perks.secureSub}'],
  [/label="Retour Simple"/g, 'label={t.perks.returnLabel}'],
  [/sublabel="Sous 14 jours"/g, 'sublabel={t.perks.returnSub}'],

  // Support
  [/>Besoin de conseils \?<\/p>/g, '>{t.support.title}</p>'],
  [/>Notre équipe de passionnés est à votre écoute 7j\/7\.<\/p>/g, '>{t.support.desc}</p>'],

  // Description
  [/>\s*L'Histoire du Parfum\s*<\/h2>/g, '>{t.description.history}</h2>'],
  [/> La Composition/g, '> {t.description.compositionTitle}'],
  [/>\s*Pyramide Olfactive\s*<\/h2>/g, '>{t.description.pyramid}</h2>'],
  [/title: 'Notes de Tête'/g, "title: t.description.topNotes"],
  [/desc: 'L\\'envolée olfactive \(0-15 min\)'/g, "desc: t.description.topDesc"],
  [/title: 'Notes de Cœur'/g, "title: t.description.heartNotes"],
  [/desc: 'La personnalité \(15min-4h\)'/g, "desc: t.description.heartDesc"],
  [/title: 'Notes de Fond'/g, "title: t.description.baseNotes"],
  [/desc: 'Le sillage mémorable \(4h\+\)'/g, "desc: t.description.baseDesc"],

  // Essence
  [/>\s*L'Essence du Produit\s*<\/h2>/g, '>{t.essence.title}</h2>'],
  [/>Concentration<\/span>/g, '>{t.essence.concentration}</span>'],
  [/>Eau de Parfum<\/span>/g, '>{t.essence.edp}</span>'],
  [/>Genre<\/span>/g, '>{t.essence.gender}</span>'],
  [/>Famille<\/span>/g, '>{t.essence.family}</span>'],
  [/>Saison Idéale<\/span>/g, '>{t.essence.season}</span>'],
  [/'Femme' : product\.gender === 'men' \? 'Homme' : 'Unisexe'/g, "t.genderMap.women : product.gender === 'men' ? t.genderMap.men : t.genderMap.unisex"],
  [/'Toutes Saisons'/g, "t.essence.allSeasons"],

  // Why choose
  [/>\s*Pourquoi choisir \{product\.name\} \?\s*<\/h2>/g, '>{t.whyChoose.title} {product.name} ?</h2>'],
  [/>\s*Une fragrance captivante, mystique et charismatique\. Conçue avec des ingrédients de la plus haute qualité, cette composition assure une tenue exceptionnelle et un sillage remarquable qui vous accompagnera tout au long de la journée avec élégance et assurance\.\s*<\/p>/g, '>{t.whyChoose.desc}</p>'],
  [/>Qualité supérieure et longue tenue<\/span>/g, '>{t.whyChoose.bullet1}</span>'],
  [/>Testeur 100% authentique de la maison \{product\.brandLabel\}<\/span>/g, '>{t.whyChoose.bullet2} {product.brandLabel}</span>'],

  // When to wear
  [/>Quand le porter \?<\/h3>/g, '>{t.whenToWear.title}</h3>'],
  [/>\s*Idéal en toute occasion\. Grâce à sa composition riche et parfaitement équilibrée, cette fragrance s'adapte à tous les styles et ambiances, devenant votre véritable signature olfactive\.\s*<\/p>/g, '>{t.whenToWear.desc}</p>'],

  // Reviews
  [/>\s*Avis Clients\s*<\/span>/g, '>{t.reviews.title}</span>'],
  [/>\s*\{product\.reviewCount\} avis\s*<\/h2>/g, '>{product.reviewCount} {t.reviews.count}</h2>'],
  [/>sur 5<\/div>/g, '>{t.reviews.outOf5}</div>'],
  [/>\s*Laisser un avis\s*<\/button>/g, '>{t.reviews.leaveReview}</button>'],
  [/>\s*Aucun avis pour ce parfum pour le moment\.\s*<\/p>/g, '>{t.reviews.noReviews}</p>'],
  [/> Achat vérifié\s*<\/span>/g, '> {t.reviews.verified}</span>'],
  
  // Review Auth
  [/>Connexion<\/h3>/g, '>{t.reviews.loginTitle}</h3>'],
  [/>Connectez-vous pour laisser un avis sur ce parfum\.<\/p>/g, '>{t.reviews.loginDesc}</p>'],
  [/placeholder="Adresse e-mail"/g, 'placeholder={t.reviews.email}'],
  [/placeholder="Mot de passe"/g, 'placeholder={t.reviews.password}'],
  [/>Se Connecter<\/button>/g, '>{t.reviews.loginBtn}</button>'],
  [/>Connexion\.\.\.<\/button>/g, '>{t.reviews.loginLoading}</button>'],
  [/>\s*Nouveau client \?/g, '> {t.reviews.newCustomer}'],
  [/>Créer un compte<\/button>/g, '>{t.reviews.createAccount}</button>'],
  
  [/>Créer un compte<\/h3>/g, '>{t.reviews.signupTitle}</h3>'],
  [/>Rejoignez-nous pour partager votre expérience\.<\/p>/g, '>{t.reviews.signupDesc}</p>'],
  [/placeholder="Nom complet"/g, 'placeholder={t.reviews.fullName}'],
  [/>S'inscrire<\/button>/g, '>{t.reviews.signupBtn}</button>'],
  [/>Inscription\.\.\.<\/button>/g, '>{t.reviews.signupLoading}</button>'],
  [/>\s*Déjà un compte \?/g, '> {t.reviews.alreadyAccount}'],
  [/>Se connecter<\/button>/g, '>{t.reviews.loginLink}</button>'],

  // Leave Review form
  [/>Laisser un avis<\/h3>/g, '>{t.reviews.reviewTitle}</h3>'],
  [/>Votre Nom<\/label>/g, '>{t.reviews.nameLabel}</label>'],
  [/placeholder="Ex: Salma B\."/g, 'placeholder={t.reviews.namePlace}'],
  [/>Ville<\/label>/g, '>{t.reviews.cityLabel}</label>'],
  [/placeholder="Ex: Casablanca"/g, 'placeholder={t.reviews.cityPlace}'],
  [/>Note globale<\/label>/g, '>{t.reviews.ratingLabel}</label>'],
  [/>Titre de l'avis<\/label>/g, '>{t.reviews.reviewTitleLabel}</label>'],
  [/placeholder="Ex: Magnifique !"/g, 'placeholder={t.reviews.reviewTitlePlace}'],
  [/>Votre avis<\/label>/g, '>{t.reviews.reviewLabel}</label>'],
  [/placeholder="Partagez votre expérience avec ce parfum\.\.\."/g, 'placeholder={t.reviews.reviewPlace}'],
  [/>Annuler<\/button>/g, '>{t.reviews.cancel}</button>'],
  [/>Publier<\/button>/g, '>{t.reviews.publish}</button>'],
  [/>Envoi\.\.\.<\/button>/g, '>{t.reviews.publishing}</button>'],
  [/Erreur lors de l'envoi de l'avis\./g, '"+t.reviews.error+"'],

  // Related
  [/>\s*Vous aimerez aussi\s*<\/span>/g, '>{t.related.title}</span>'],
  [/>\s*Dans la même collection\s*<\/h2>/g, '>{t.related.subtitle}</h2>'],

  // Sticky
  [/>Paiement à la livraison<\/div>/g, '>{t.sticky.cod}</div>']
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

// Also fix the error string concat
content = content.replace(/"\+t\.reviews\.error\+"/g, 't.reviews.error');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
