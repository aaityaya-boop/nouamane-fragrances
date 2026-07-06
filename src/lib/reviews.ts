/**
 * Static seed reviews from Moroccan customers.
 * These correspond to the designer perfumes in PRODUCTS.
 */

export type StaticReview = {
  id: number;
  productSlug: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
};

export const REVIEWS: StaticReview[] = [
  /* ---- Valentino Born in Roma Donna ---- */
  {
    id: 1, productSlug: 'valentino-born-in-roma-donna', author: 'Salma B.', city: 'Casablanca',
    rating: 5, title: 'Mon parfum signature',
    comment: 'Un floral moderne et audacieux. Je reçois constamment des compliments — le sillage est incroyable et le flacon Rockstud est magnifique sur ma coiffeuse. Merci Nouamane pour l\'authenticité garantie et la livraison en 24h à Casa.',
    createdAt: '2025-01-20', verified: true,
  },
  {
    id: 2, productSlug: 'valentino-born-in-roma-donna', author: 'Meryem K.', city: 'Rabat',
    rating: 4, title: 'Très féminin',
    comment: 'Le jasmin sambac est magnifique, et la vanille bourbon donne beaucoup de caractère. Je regrette juste que la tenue soit un peu courte (6-7h).',
    createdAt: '2025-01-05', verified: true,
  },
  {
    id: 3, productSlug: 'valentino-born-in-roma-donna', author: 'Nadia H.', city: 'Marrakech',
    rating: 5, title: 'Coup de cœur absolu',
    comment: 'Un parfum qui a du caractère sans être vulgaire. Parfait pour le bureau et pour les soirées. Le rapport qualité-prix est excellent chez Nouamane.',
    createdAt: '2024-12-15', verified: true,
  },

  /* ---- Valentino Born in Roma Uomo ---- */
  {
    id: 4, productSlug: 'valentino-born-in-roma-uomo', author: 'Youssef R.', city: 'Casablanca',
    rating: 5, title: 'Le meilleur Valentino homme',
    comment: 'Sillage puissant, tenue de 10h+ sur ma peau. Le gingembre et l\'iris noir en font un parfum unique et sophistiqué. Idéal pour les hivers marocains.',
    createdAt: '2025-01-22', verified: true,
  },
  {
    id: 5, productSlug: 'valentino-born-in-roma-uomo', author: 'Karim T.', city: 'Tangier',
    rating: 5, title: 'Élégant et masculin',
    comment: 'J\'ai reçu tellement de compliments depuis que je le porte. Un investissement qui vaut chaque dirham. Livraison rapide et emballage soigné.',
    createdAt: '2024-12-28', verified: true,
  },
  {
    id: 6, productSlug: 'valentino-born-in-roma-uomo', author: 'Hamza E.', city: 'Fès',
    rating: 4, title: 'Un boisé sophistiqué',
    comment: 'Très classe, se démarque des parfums standards. Le flacon vert camouflage est un must-have pour la collection.',
    createdAt: '2024-11-30', verified: true,
  },

  /* ---- Valentino Voce Viva ---- */
  {
    id: 7, productSlug: 'valentino-voce-viva', author: 'Ines M.', city: 'Rabat',
    rating: 5, title: 'Lumineux et solaire',
    comment: 'Parfait pour le printemps et l\'été marocain. L\'iris crémeux est divin. Merci Lady Gaga et Valentino !',
    createdAt: '2025-02-10', verified: true,
  },
  {
    id: 8, productSlug: 'valentino-voce-viva', author: 'Sofia N.', city: 'Marrakech',
    rating: 5, title: 'Fresh et féminin',
    comment: 'L\'orange sanguine donne une énergie incroyable. Je l\'utilise tous les jours au bureau. Excellent choix pour la vie active.',
    createdAt: '2025-01-18', verified: true,
  },

  /* ---- Valentino Uomo Intense ---- */
  {
    id: 9, productSlug: 'valentino-uomo-intense', author: 'Omar B.', city: 'Casablanca',
    rating: 5, title: 'Séducteur inégalé',
    comment: 'Un cuir absolument sublime. La vanille absolue en fond de composition rend ce parfum irrésistible pour les soirées. Un must pour tout homme.',
    createdAt: '2025-01-14', verified: true,
  },
  {
    id: 10, productSlug: 'valentino-uomo-intense', author: 'Rachid K.', city: 'Oujda',
    rating: 5, title: 'Puissant et raffiné',
    comment: 'Un parfum d\'exception. La qualité est là, on sent immédiatement qu\'il s\'agit d\'un grand parfum. Livraison au top depuis Nouamane.',
    createdAt: '2024-12-20', verified: true,
  },

  /* ---- Valentino Donna Rosa Verde ---- */
  {
    id: 11, productSlug: 'valentino-donna-rosa-verde', author: 'Zineb A.', city: 'Fès',
    rating: 5, title: 'Une rose comme jamais',
    comment: 'La touche verte est une révélation. Frais, élégant, parfait pour l\'été marocain. Je reçois plein de compliments.',
    createdAt: '2025-02-15', verified: true,
  },

  /* ---- Valentino Uomo Coral Fantasy ---- */
  {
    id: 12, productSlug: 'valentino-uomo-coral-fantasy', author: 'Anas Y.', city: 'Agadir',
    rating: 4, title: 'Parfait pour la plage',
    comment: 'Fraîcheur méditerranéenne assumée. Le pamplemousse est très bien fait. Idéal pour Agadir et les journées d\'été.',
    createdAt: '2025-01-08', verified: true,
  },

  /* ---- YSL Libre EDP ---- */
  {
    id: 13, productSlug: 'ysl-libre-edp', author: 'Amina S.', city: 'Casablanca',
    rating: 5, title: 'La fleur d\'oranger marocaine !',
    comment: 'Fierté nationale : YSL utilise la fleur d\'oranger de Meknès. Le résultat est somptueux, féminin et libre. Mon parfum préféré depuis 2 ans, je le rachète chez Nouamane à chaque fois.',
    createdAt: '2025-01-25', verified: true,
  },
  {
    id: 14, productSlug: 'ysl-libre-edp', author: 'Fatima Z.', city: 'Marrakech',
    rating: 5, title: 'Sillage divin',
    comment: 'La lavande et la vanille se mélangent parfaitement. Un parfum sophistiqué qui dure toute la journée.',
    createdAt: '2024-12-30', verified: true,
  },
  {
    id: 15, productSlug: 'ysl-libre-edp', author: 'Leïla M.', city: 'Rabat',
    rating: 5, title: 'Élégance intemporelle',
    comment: 'Parfait pour le travail et les soirées. Le flacon doré est magnifique. J\'ai eu peur des contrefaçons ailleurs, mais chez Nouamane c\'est 100% authentique.',
    createdAt: '2024-12-15', verified: true,
  },

  /* ---- YSL Black Opium ---- */
  {
    id: 16, productSlug: 'ysl-black-opium', author: 'Sara O.', city: 'Tangier',
    rating: 5, title: 'Addictif',
    comment: 'Le café + vanille est une signature unique. Puissant, sensuel, parfait pour les soirées d\'hiver. Un incontournable.',
    createdAt: '2025-01-30', verified: true,
  },
  {
    id: 17, productSlug: 'ysl-black-opium', author: 'Hanane B.', city: 'Casablanca',
    rating: 5, title: 'Ma signature depuis 3 ans',
    comment: 'Impossible de m\'en passer. Chaque nouvelle version est mieux que la précédente. Livraison en 24h au top.',
    createdAt: '2024-11-20', verified: true,
  },

  /* ---- YSL Mon Paris ---- */
  {
    id: 18, productSlug: 'ysl-mon-paris', author: 'Yasmine H.', city: 'Marrakech',
    rating: 5, title: 'Fruity et sexy',
    comment: 'Framboise + patchouli = magique. Un parfum qui donne envie de tomber amoureuse. Parfait pour un premier rendez-vous.',
    createdAt: '2025-01-12', verified: true,
  },

  /* ---- YSL Y EDP ---- */
  {
    id: 19, productSlug: 'ysl-y-edp', author: 'Mehdi A.', city: 'Casablanca',
    rating: 5, title: 'Puissant et frais',
    comment: 'Un mélange rare de fraîcheur et de longévité. La sauge est parfaitement dosée. Le parfum idéal pour le bureau et le sport.',
    createdAt: '2025-01-18', verified: true,
  },
  {
    id: 20, productSlug: 'ysl-y-edp', author: 'Adnane K.', city: 'Rabat',
    rating: 5, title: 'Le parfum de ma vie',
    comment: 'Cela fait 3 ans que je le porte. Mes collègues et mes amis me reconnaissent à son sillage. Un investissement rentable.',
    createdAt: '2024-12-05', verified: true,
  },

  /* ---- YSL MYSLF ---- */
  {
    id: 21, productSlug: 'ysl-myslf', author: 'Ismail R.', city: 'Fès',
    rating: 5, title: 'Nouveau chef-d\'œuvre YSL',
    comment: 'Le premier parfum masculin avec autant de sensibilité. Le miroir doré est magnifique. Un parfum qui définit une nouvelle masculinité.',
    createdAt: '2025-02-08', verified: true,
  },
  {
    id: 22, productSlug: 'ysl-myslf', author: 'Bilal T.', city: 'Casablanca',
    rating: 5, title: 'Sophistiqué et unique',
    comment: 'Sort des sentiers battus. La fleur d\'oranger sur homme, c\'est audacieux et magnifique. Le sillage est excellent.',
    createdAt: '2025-01-28', verified: true,
  },

  /* ---- YSL L'Homme ---- */
  {
    id: 23, productSlug: 'ysl-lhomme', author: 'Nabil E.', city: 'Marrakech',
    rating: 5, title: 'Classe intemporelle',
    comment: 'L\'élégance à la française. Ni trop puissant ni trop discret. Parfait pour l\'homme d\'affaires.',
    createdAt: '2025-01-11', verified: true,
  },

  /* ---- Armani Stronger With You ---- */
  {
    id: 24, productSlug: 'armani-stronger-with-you', author: 'Hassan L.', city: 'Casablanca',
    rating: 5, title: 'Le parfum qui m\'a fait sortir avec ma femme',
    comment: 'Cardamome + vanille = magique. Compliments garantis. Sillage sensuel et longévité de 8-10h. Rapport qualité-prix imbattable, surtout avec la promo actuelle chez Nouamane !',
    createdAt: '2025-02-01', verified: true,
  },
  {
    id: 25, productSlug: 'armani-stronger-with-you', author: 'Ayoub M.', city: 'Rabat',
    rating: 5, title: 'Un classique moderne',
    comment: 'Le meilleur parfum masculin de sa catégorie. Sucré sans être écœurant. Parfait pour un rendez-vous. Livraison en 24h impeccable.',
    createdAt: '2025-01-15', verified: true,
  },
  {
    id: 26, productSlug: 'armani-stronger-with-you', author: 'Mounir A.', city: 'Meknès',
    rating: 5, title: 'Impossible de résister',
    comment: 'Ma femme adore. C\'est devenu ma signature. La châtaigne glacée est vraiment reconnaissable. Un must dans toute collection.',
    createdAt: '2024-12-22', verified: true,
  },

  /* ---- Armani Stronger With You Intensely ---- */
  {
    id: 27, productSlug: 'armani-stronger-with-you-intensely', author: 'Zakaria B.', city: 'Casablanca',
    rating: 5, title: 'La version ultime',
    comment: 'Plus riche, plus profond que l\'original. La vanille pure est divine. Parfait pour les soirées d\'hiver.',
    createdAt: '2025-01-20', verified: true,
  },
  {
    id: 28, productSlug: 'armani-stronger-with-you-intensely', author: 'Walid H.', city: 'Tangier',
    rating: 5, title: 'Sensuel et enveloppant',
    comment: 'Un cocon olfactif. Le jasmin sambac apporte une note florale inattendue et sublime. Excellent choix pour un mariage.',
    createdAt: '2024-12-10', verified: true,
  },

  /* ---- Armani Sì ---- */
  {
    id: 29, productSlug: 'armani-si-edp', author: 'Rania K.', city: 'Casablanca',
    rating: 5, title: 'L\'élégance italienne',
    comment: 'Le cassis noir en tête est envoûtant. Un parfum de femme accomplie. Parfait pour toutes occasions.',
    createdAt: '2025-01-25', verified: true,
  },
  {
    id: 30, productSlug: 'armani-si-edp', author: 'Chaimae A.', city: 'Fès',
    rating: 5, title: 'Ma signature parfaite',
    comment: 'Sophistiqué, féminin, sensuel. Impossible de s\'en lasser. Le flacon noir laqué est un objet d\'art.',
    createdAt: '2025-01-02', verified: true,
  },

  /* ---- Armani Acqua di Giò Profumo ---- */
  {
    id: 31, productSlug: 'armani-acqua-di-gio-profumo', author: 'Reda M.', city: 'Agadir',
    rating: 5, title: 'La Méditerranée dans un flacon',
    comment: 'Habitant Agadir, ce parfum est parfait — il sent la mer, les rochers, l\'encens. Le meilleur Acqua di Giò à mes yeux.',
    createdAt: '2025-02-12', verified: true,
  },
  {
    id: 32, productSlug: 'armani-acqua-di-gio-profumo', author: 'Tarik B.', city: 'Rabat',
    rating: 5, title: 'Classe intemporelle',
    comment: 'L\'encens et le patchouli donnent une profondeur que je n\'attendais pas d\'un parfum "aquatique". Une révélation.',
    createdAt: '2025-01-10', verified: true,
  },

  /* ---- Armani Code Homme ---- */
  {
    id: 33, productSlug: 'armani-code-homme', author: 'Yassine A.', city: 'Casablanca',
    rating: 4, title: 'Un classique séducteur',
    comment: 'Le tabac et le cuir sont parfaits pour le soir. Un parfum d\'ambiance nocturne, très sensuel.',
    createdAt: '2024-12-28', verified: true,
  },

  /* ---- Armani My Way ---- */
  {
    id: 34, productSlug: 'armani-my-way-edp', author: 'Salima N.', city: 'Marrakech',
    rating: 5, title: 'Voyage sensoriel',
    comment: 'Un floral blanc lumineux et solaire. La vanille de Madagascar apporte une gourmandise subtile. Parfum de voyage par excellence.',
    createdAt: '2025-02-20', verified: true,
  },
  {
    id: 35, productSlug: 'armani-my-way-edp', author: 'Imane B.', city: 'Rabat',
    rating: 5, title: 'Ma nouvelle signature 2025',
    comment: 'Je l\'ai découvert grâce aux produits authentiques par Nouamane, et j\'ai craqué. La tubéreuse est divine.',
    createdAt: '2025-02-14', verified: true,
  },
];

export const getReviewsForProduct = (slug: string) =>
  REVIEWS.filter((r) => r.productSlug === slug);
