'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { CheckCircle2, ArrowRight, ArrowLeft, RotateCcw, Sparkles, User, Users, Gift, Briefcase, Heart, Moon, Sun, Snowflake, Droplets, Flame, Wind, Zap, Feather, Flower2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ALL_QUESTIONS = [
  {
    id: 'target',
    title: 'Pour qui cherchez-vous ce parfum ?',
    subtitle: 'Commençons par définir à qui se destine cette signature.',
    options: [
      { id: 'women', label: 'Pour Moi (Femme)', icon: <User className="w-8 h-8 stroke-[1.5]" />, description: 'Une fragrance féminine et mémorable.' },
      { id: 'men', label: 'Pour Moi (Homme)', icon: <User className="w-8 h-8 stroke-[1.5]" />, description: 'Une empreinte masculine et charismatique.' },
      { id: 'unisex', label: 'Mixte', icon: <Users className="w-8 h-8 stroke-[1.5]" />, description: 'Je préfère les parfums universels et audacieux.' },
      { id: 'gift', label: 'C\'est pour offrir', icon: <Gift className="w-8 h-8 stroke-[1.5]" />, description: 'Je cherche une valeur sûre pour un cadeau.' },
    ]
  },
  {
    id: 'gift_gender',
    title: 'À qui allez-vous l\'offrir ?',
    subtitle: 'Pour cibler parfaitement le cadeau.',
    options: [
      { id: 'women', label: 'À une Femme', icon: <User className="w-8 h-8 stroke-[1.5]" />, description: 'Cadeau Féminin' },
      { id: 'men', label: 'À un Homme', icon: <User className="w-8 h-8 stroke-[1.5]" />, description: 'Cadeau Masculin' },
      { id: 'unisex', label: 'Mixte / Couple', icon: <Users className="w-8 h-8 stroke-[1.5]" />, description: 'Cadeau Universel' },
    ]
  },
  {
    id: 'occasion',
    title: 'Pour quelle occasion principale ?',
    subtitle: 'Chaque moment a son propre langage olfactif.',
    options: [
      { id: 'work', label: 'Pour le Travail', icon: <Briefcase className="w-8 h-8 stroke-[1.5]" />, description: 'Élégant, propre et professionnel (idéal pour le bureau).' },
      { id: 'date', label: 'Pour un "Date"', icon: <Heart className="w-8 h-8 stroke-[1.5]" />, description: 'Intime, sensuel et magnétique (pour séduire de près).' },
      { id: 'night', label: 'Pour la Nuit', icon: <Moon className="w-8 h-8 stroke-[1.5]" />, description: 'Mystérieux, puissant et audacieux (pour se démarquer).' },
      { id: 'summer', label: 'Pour l\'Été', icon: <Sun className="w-8 h-8 stroke-[1.5]" />, description: 'Frais, pétillant et éclatant (idéal pour la chaleur).' },
      { id: 'winter', label: 'Pour l\'Hiver', icon: <Snowflake className="w-8 h-8 stroke-[1.5]" />, description: 'Chaud, épicé et enveloppant (réconfortant pour le froid).' },
    ]
  },
  {
    id: 'notes',
    title: 'Quel univers olfactif vous attire instinctivement ?',
    subtitle: 'L\'ingrédient secret qui fera tourner les têtes.',
    options: [
      { id: 'woisé', label: 'Boisé & Puissant', icon: <Flame className="w-8 h-8 stroke-[1.5]" />, description: 'Oud, Cèdre, Cuir, Patchouli (Racé et profond).' },
      { id: 'frais', label: 'Frais & Pétillant', icon: <Droplets className="w-8 h-8 stroke-[1.5]" />, description: 'Agrumes, Menthe, Notes Marines (Vif et énergisant).' },
      { id: 'floral', label: 'Floral & Délicat', icon: <Flower2 className="w-8 h-8 stroke-[1.5]" />, description: 'Rose, Jasmin, Fleur d\'oranger (Romantique et pur).' },
      { id: 'sucré', label: 'Sucré & Gourmand', icon: <Sparkles className="w-8 h-8 stroke-[1.5]" />, description: 'Vanille, Caramel, Fève Tonka (Addictif et sensuel).' },
    ]
  },
  {
    id: 'intensity',
    title: 'Quelle intensité recherchez-vous ?',
    subtitle: 'Le sillage est la trace que vous laissez derrière vous.',
    options: [
      { id: 'subtle', label: 'Subtile & Intime', icon: <Feather className="w-8 h-8 stroke-[1.5]" />, description: 'Un parfum de peau, délicat et discret.' },
      { id: 'balanced', label: 'Équilibrée', icon: <Wind className="w-8 h-8 stroke-[1.5]" />, description: 'Une belle présence remarquée, sans être entêtante.' },
      { id: 'intense', label: 'Intense & Extrême', icon: <Zap className="w-8 h-8 stroke-[1.5]" />, description: 'Un sillage "Bête de mode" qui remplit la pièce.' },
    ]
  }
];

export default function PerfumeQuiz({ products }: { products: Product[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';

  const activeQuestions = ALL_QUESTIONS.filter(q => {
    if (q.id === 'gift_gender' && answers.target !== 'gift') return false;
    return true;
  });

  const handleSelect = (questionId: string, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);
    
    // Recalculate active questions with the new answers
    const currentActiveQuestions = ALL_QUESTIONS.filter(q => {
      if (q.id === 'gift_gender' && newAnswers.target !== 'gift') return false;
      return true;
    });

    if (currentStep < currentActiveQuestions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 400);
    } else {
      analyzeResults(newAnswers);
    }
  };

  const analyzeResults = (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const scoredProducts = products.map(product => {
        let score = 0;
        
        const safeNotes = Array.isArray(product.notes) ? product.notes : [];
        const safeTags = Array.isArray(product.tags) ? product.tags : [];
        const notesStr = safeNotes.join(' ').toLowerCase();
        const season = product.perfectSeason?.toLowerCase() || '';
        
        // 1. Target Match (HARD WEIGHT)
        if (finalAnswers.target === 'unisex') {
          if (product.gender === 'unisex') score += 30;
          else score += 5; 
        } else if (finalAnswers.target === 'gift') {
          // If it's a gift, check the specific gift gender they selected
          if (finalAnswers.gift_gender === 'women' && product.gender === 'women') score += 40;
          else if (finalAnswers.gift_gender === 'men' && product.gender === 'men') score += 40;
          else if (finalAnswers.gift_gender === 'unisex' && product.gender === 'unisex') score += 40;
          else if (finalAnswers.gift_gender === 'unisex') score += 10;
          else score -= 100; // Wrong gender for the gift
          
          if (safeTags.includes('bestseller') || safeTags.includes('cadeau')) score += 20;
        } else {
          if (product.gender === finalAnswers.target) score += 40;
          else if (product.gender === 'unisex') score += 20;
          else score -= 100; // Wrong gender
        }

        // 3. Notes Match (THE MOST IMPORTANT +80 pts)
        // If they want woody, give massive points to woody perfumes
        let noteMatched = false;
        if (finalAnswers.notes === 'woisé' && (notesStr.includes('bois') || notesStr.includes('oud') || notesStr.includes('cèdre') || notesStr.includes('cuir') || notesStr.includes('santal'))) { score += 80; noteMatched = true; }
        if (finalAnswers.notes === 'frais' && (notesStr.includes('citron') || notesStr.includes('bergamote') || notesStr.includes('menthe') || notesStr.includes('aquatique') || notesStr.includes('pamplemousse'))) { score += 80; noteMatched = true; }
        if (finalAnswers.notes === 'floral' && (notesStr.includes('rose') || notesStr.includes('jasmin') || notesStr.includes('fleur') || notesStr.includes('muguet') || notesStr.includes('iris'))) { score += 80; noteMatched = true; }
        if (finalAnswers.notes === 'sucré' && (notesStr.includes('vanille') || notesStr.includes('caramel') || notesStr.includes('tonka') || notesStr.includes('praline') || notesStr.includes('miel') || notesStr.includes('gourmand'))) { score += 80; noteMatched = true; }
        
        // Penalize if it's the exact opposite
        if (finalAnswers.notes === 'woisé' && notesStr.includes('aquatique')) score -= 30;
        if (finalAnswers.notes === 'frais' && notesStr.includes('oud')) score -= 40;

        // 2. Occasion Match (Secondary +20 pts)
        if (finalAnswers.occasion === 'work' && (notesStr.includes('iris') || notesStr.includes('musc') || notesStr.includes('citron') || notesStr.includes('frais'))) score += 20;
        if (finalAnswers.occasion === 'date' && (notesStr.includes('vanille') || notesStr.includes('tonka') || notesStr.includes('cuir') || notesStr.includes('ambre'))) score += 20;
        if (finalAnswers.occasion === 'night' && (notesStr.includes('oud') || notesStr.includes('épice') || notesStr.includes('patchouli'))) score += 20;
        if (finalAnswers.occasion === 'summer' && (season.includes('été') || notesStr.includes('bergamote') || notesStr.includes('marin'))) score += 20;
        if (finalAnswers.occasion === 'winter' && (season.includes('hiver') || notesStr.includes('vanille') || notesStr.includes('ambre'))) score += 20;

        // 4. Intensity Match (+15 pts)
        if (finalAnswers.intensity === 'subtle' && (notesStr.includes('musc') || notesStr.includes('fleur') || notesStr.includes('thé'))) score += 15;
        if (finalAnswers.intensity === 'intense' && (notesStr.includes('oud') || notesStr.includes('cuir') || notesStr.includes('parfum') || notesStr.includes('extrait') || safeTags.includes('intense'))) score += 15;

        // Bestsellers tie-breaker
        if (safeTags.includes('bestseller') || safeTags.includes('bestsellers')) score += 5;

        // Introduce a slight random factor (0 to 15 points) so that ties or close matches are shuffled.
        // This ensures the user gets different perfumes if they run the quiz again with the same answers!
        score += Math.random() * 15;

        // Ensure we only show perfumes that AT LEAST partially match the note or occasion if score is positive
        return { product, score };
      });

      // Filter out products with very bad scores
      const validProducts = scoredProducts.filter(p => p.score > 0);

      // Sort by score
      validProducts.sort((a, b) => b.score - a.score);
      
      // Take the top 12 best matching perfumes
      let topCandidates = validProducts.slice(0, 12);
      
      // Shuffle them completely so the top 4 are always different
      topCandidates = topCandidates.sort(() => Math.random() - 0.5);

      // Select the first 4 from the shuffled best candidates
      setResults(topCandidates.slice(0, 4).map(s => s.product));
      setIsAnalyzing(false);
      setCurrentStep(activeQuestions.length);
    }, 2500);
  };

  const restart = () => {
    setAnswers({});
    setResults([]);
    setCurrentStep(0);
  };

  return (
    <div className="max-w-[800px] mx-auto w-full px-6">
      <div className="text-center mb-10">
        <h1 className="heading-font text-4xl md:text-5xl text-[#1A1A1A] mb-4">Diagnostic Olfactif</h1>
        <p className="text-[#6B6B6B] text-[15px] max-w-lg mx-auto">
          Répondez à ces questions rapides pour découvrir les parfums qui correspondent parfaitement à votre ADN.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#e0ddd4] overflow-hidden min-h-[500px] flex flex-col relative">
        
        {/* Progress Bar */}
        {currentStep < activeQuestions.length && !isAnalyzing && (
          <div className="h-1.5 w-full bg-[#f8fafc]">
            <motion.div 
              className="h-full bg-[#0ea5e9]"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / activeQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            
            {currentStep < activeQuestions.length && !isAnalyzing && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="text-center mb-10">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#0ea5e9] mb-3 block">
                    Question {currentStep + 1} sur {activeQuestions.length}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
                    {activeQuestions[currentStep].title}
                  </h2>
                  <p className="text-[#6B6B6B] text-[14px]">
                    {activeQuestions[currentStep].subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeQuestions[currentStep].options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(activeQuestions[currentStep].id, option.id)}
                      className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${
                        answers[activeQuestions[currentStep].id] === option.id
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/5'
                          : 'border-[#e0ddd4] hover:border-[#1A1A1A] bg-white'
                      }`}
                    >
                      <div className={`mb-2 transition-colors ${
                        answers[activeQuestions[currentStep].id] === option.id ? 'text-[#0ea5e9]' : 'text-[#1A1A1A]'
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <div className={`font-bold text-[15px] mb-1 ${
                          answers[activeQuestions[currentStep].id] === option.id ? 'text-[#0ea5e9]' : 'text-[#1A1A1A]'
                        }`}>
                          {option.label}
                        </div>
                        <div className="text-[#6B6B6B] text-[12px] leading-relaxed">
                          {option.description}
                        </div>
                      </div>
                      
                      {answers[activeQuestions[currentStep].id] === option.id && (
                        <div className="absolute top-4 right-4 text-[#0ea5e9]">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="mt-8 flex items-center gap-2 text-[#9A9A9A] hover:text-[#1A1A1A] text-[12px] font-bold uppercase tracking-wider transition-colors mx-auto"
                  >
                    <ArrowLeft size={14} /> Question précédente
                  </button>
                )}
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-[#0ea5e9]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#0ea5e9] rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0ea5e9]" size={32} />
                </div>
                <h3 className="heading-font text-3xl text-[#1A1A1A] mb-3">Création de votre profil olfactif...</h3>
                <p className="text-[#6B6B6B] text-[15px]">Nous croisons vos réponses avec notre catalogue de parfums.</p>
              </motion.div>
            )}

            {currentStep === activeQuestions.length && !isAnalyzing && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="text-center mb-10">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
                    Match Parfait Trouvé
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3">
                    Voici votre Signature Olfactive
                  </h2>
                  <p className="text-[#6B6B6B] text-[15px]">
                    Basé sur vos goûts, voici les {results.length} parfums qui vous correspondent le mieux.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                  {results.map((product, index) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={`/${locale}/shop`} className="btn-blue px-8 py-4 rounded-xl text-[12px] flex items-center justify-center gap-2">
                    Voir tout le catalogue <ArrowRight size={16} />
                  </Link>
                  <button onClick={restart} className="btn-outline-blue px-8 py-4 rounded-xl text-[12px] flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> Refaire le test
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
