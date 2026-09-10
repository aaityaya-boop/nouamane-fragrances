export interface OlfactiveFamilyGroup {
  group: string;
  options: string[];
}

export const OLFACTIVE_FAMILIES: OlfactiveFamilyGroup[] = [
  { 
    group: 'Ambré & Oriental', 
    options: [
      'Ambré', 
      'Ambré Épicé', 
      'Ambré Boisé', 
      'Ambré Vanillé', 
      'Ambré Floral', 
      'Ambré Fougère', 
      'Ambré Boisé Gourmand', 
      'Ambré Fruité', 
      'Oriental', 
      'Oriental Boisé', 
      'Oriental Floral', 
      'Oriental Épicé'
    ] 
  },
  { 
    group: 'Boisé', 
    options: [
      'Boisé', 
      'Boisé Aromatique', 
      'Boisé Épicé', 
      'Boisé Floral', 
      'Boisé Floral Musqué', 
      'Boisé Épicé (Frais)', 
      'Aromatique Aquatique Boisé'
    ] 
  },
  { 
    group: 'Floral', 
    options: [
      'Floral', 
      'Floral Blanc', 
      'Floral Fruité', 
      'Floral Gourmand', 
      'Floral Poudré', 
      'Floral Aquatique', 
      'Floral Aldéhydé', 
      'Floral Pétillant', 
      'Floral Boisé', 
      'Floral Boisé Musqué', 
      'Ambré Floral Fruité', 
      'Chypré Floral', 
      'Floral Fruité Gourmand'
    ] 
  },
  { 
    group: 'Aromatique & Frais', 
    options: [
      'Aromatique', 
      'Aromatique Fougère', 
      'Aromatique Boisé', 
      'Aromatique Vert', 
      'Aromatique Fruité', 
      'Aromatique Boisé Épicé', 
      'Hespéridé', 
      'Hespéridé Aromatique', 
      'Frais'
    ] 
  },
  { 
    group: 'Chypré & Cuir', 
    options: [
      'Chypré', 
      'Chypré Fruité', 
      'Chypré Oriental', 
      'Cuir', 
      'Cuir Floral Solaire'
    ] 
  },
  { 
    group: 'Gourmand & Spécial', 
    options: [
      'Gourmand', 
      'Floral Gourmand Marin', 
      'Signature'
    ] 
  },
];

export const ALL_OLFACTIVE_OPTIONS = OLFACTIVE_FAMILIES.flatMap(g => g.options);

export function getBaseSubcategoryFromFamily(family: string, fallback: string = 'floral'): string {
  if (!family) return fallback;
  const f = family.toLowerCase();
  if (f.includes('floral')) return 'floral';
  if (f.includes('boisé') || f.includes('boise') || f.includes('cuir') || f.includes('chypré') || f.includes('chypre')) return 'woody';
  if (f.includes('ambré') || f.includes('ambre') || f.includes('oriental') || f.includes('vanill')) return 'oriental';
  if (f.includes('hespérid') || f.includes('hesperid') || f.includes('frais') || f.includes('aquatique')) return 'fresh';
  if (f.includes('aromatique') || f.includes('fougère') || f.includes('fougere')) return 'aromatic';
  if (f.includes('gourmand') || f.includes('signature')) return 'signature';
  return fallback;
}
