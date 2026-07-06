const dictionaries = {
  fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'fr' | 'en' | 'ar') => {
  return dictionaries[locale]?.() ?? dictionaries.fr();
};
