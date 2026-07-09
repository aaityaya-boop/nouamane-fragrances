'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import {
  Star,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight as Chev,
  Package,
  Gift,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatMAD, Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { usePreferences } from '@/context/PreferencesContext';

/* ============================================================
   PRODUCT DETAIL PAGE
   Left: Gallery · Right: Info · Below: Reviews · Related
   ============================================================ */

export default function ProductClient({
  product,
  relatedProducts,
  initialReviews,
}: {
  product: Product;
  relatedProducts: Product[];
  initialReviews: any[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.length > 1 ? product.sizes[1].label : product.sizes[0].label
  ); // Default to middle size if available, else first size
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'ingredients' | 'shipping'>(
    'description'
  );
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';

  const [reviews, setReviews] = useState(initialReviews);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    author: '',
    city: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const { customer, setCustomer } = useAuth();
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewAuthStep, setReviewAuthStep] = useState<'login' | 'signup' | 'review'>('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);

  const { addRecentlyViewed } = usePreferences();

  useEffect(() => {
    // Track browsing activity via cookies (recently viewed memory)
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  useEffect(() => {
    if (customer) {
      setReviewAuthStep('review');
      setReviewFormData(prev => ({ ...prev, author: customer.name }));
    }
  }, [customer]);

  const handleReviewAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);
    try {
      const res = await fetch(`/api/auth/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
      } else {
        setAuthError(data.error || 'Erreur lors de la connexion');
      }
    } catch (error) {
      setAuthError('Erreur de connexion au serveur');
    } finally {
      setLoadingAuth(false);
    }
  };

  const currentSize = product.sizes.find((s) => s.label === selectedSize)!;
  const currentPrice = currentSize.price;

  const handleAddToCart = () => {
    const finalSize = selectedSize;
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: currentPrice,
        images: product.images,
      },
      quantity,
      finalSize
    );
    
    // Facebook Pixel Tracking
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        value: currentPrice * quantity,
        currency: 'MAD'
      });
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewFormData)
      });
      if (res.ok) {
        const newReview = {
          id: Date.now(),
          ...reviewFormData,
          createdAt: new Date().toISOString(),
          verified: false
        };
        setReviews([newReview, ...reviews]);
        setIsReviewModalOpen(false);
        setReviewFormData({ author: '', city: '', rating: 5, title: '', comment: '' });
      } else {
        alert("Erreur lors de l'envoi de l'avis.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de l'avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
    return {
      star,
      count,
      percent: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen">
      <Header />

      {/* BREADCRUMB */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-28 lg:pt-32 pb-4">
        <nav className="flex items-center gap-2 text-[11px] text-[#9A9A9A]">
          <Link href={`/${locale}`} className="hover:text-[#0ea5e9]">Accueil</Link>
          <Chev size={12} />
          <Link href={`/${locale}/shop`} className="hover:text-[#0ea5e9]">Boutique</Link>
          <Chev size={12} />
          <Link
            href={`/${locale}/shop/${product.gender}`}
            className="hover:text-[#0ea5e9]"
          >
            {product.subcategoryLabel}
          </Link>
          <Chev size={12} />
          <span className="text-[#1A1A1A]">{product.name}</span>
        </nav>
      </div>

      {/* ====== SPLIT PRODUCT DETAIL ====== */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* -------- IMAGE GALLERY -------- */}
          <div>
            <div className="relative aspect-[4/5] bg-transparent rounded-2xl overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {/* Arrows */}
              <button
                onClick={() =>
                  setSelectedImage(
                    (selectedImage - 1 + product.images.length) %
                      product.images.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border border-[#e0ddd4]/85 hover:bg-white border border-[#e0ddd4] rounded-full flex items-center justify-center shadow-sm text-[#1A1A1A]"
                aria-label="Image précédente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setSelectedImage((selectedImage + 1) % product.images.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border border-[#e0ddd4]/85 hover:bg-white border border-[#e0ddd4] rounded-full flex items-center justify-center shadow-sm text-[#1A1A1A]"
                aria-label="Image suivante"
              >
                <ChevronRight size={18} />
              </button>

              {/* Wishlist */}
              <button
                className="absolute top-5 right-5 w-11 h-11 bg-white border border-[#e0ddd4]/85 hover:bg-white border border-[#e0ddd4] rounded-full flex items-center justify-center text-[#1A1A1A] shadow-sm"
                aria-label="Ajouter aux favoris"
              >
                <Heart size={16} strokeWidth={1.6} />
              </button>

              <span className="absolute top-5 left-5 text-[9px] font-bold tracking-[0.2em] uppercase bg-[#f8fafc] text-white px-3 py-1.5 rounded-full">
                {product.brandLabel}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="mt-5 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === i
                      ? 'border-[#0ea5e9]'
                      : 'border-transparent hover:border-[#e0ddd4]'
                  }`}
                >
                  <div className="relative w-full h-full bg-transparent">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* -------- INFO -------- */}
          <div>
            <Link
              href={`/${locale}/brands/${product.brand}`}
              className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9] hover:text-[#7e22ce]"
            >
              {product.brandLabel} · TESTEUR 100% AUTHENTIQUE
            </Link>

            <h1 className="heading-font text-4xl lg:text-5xl xl:text-6xl mt-3 tracking-wide leading-none">
              {product.name}
            </h1>

            <div className="mt-3 italic text-[15px] text-[#6B6B6B]">
              {product.tagline}
            </div>

            {/* Rating */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(product.rating)
                        ? 'text-[#0ea5e9] fill-[#0ea5e9]'
                        : 'text-[#e0ddd4] fill-[#e0ddd4]'
                    }
                  />
                ))}
              </div>
                <span className="text-[13px] font-bold text-[#1A1A1A] mr-1">
                  {product.rating.toFixed(1)}
                </span>
              <a
                href="#reviews"
                className="text-[13px] text-[#9A9A9A] underline hover:text-[#0ea5e9]"
              >
                {product.reviewCount} avis vérifiés
              </a>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-[#1A1A1A]">
                {formatMAD(currentPrice)}
              </span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <span className="text-[15px] text-[#9A9A9A] line-through decoration-[#0ea5e9]/40 font-medium">
                  {formatMAD(product.originalPrice)}
                </span>
              )}
              <span className="text-[13px] text-[#9A9A9A]">
                / {currentSize.label} (Testeur)
              </span>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]">
                  Contenance
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size.label)}
                    className={`px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase rounded-full transition-all ${
                      selectedSize === size.label
                        ? 'bg-[#f8fafc] text-white'
                        : 'border border-[#e0ddd4] text-[#6B6B6B] hover:border-[#0ea5e9] hover:text-[#0ea5e9]'
                    }`}
                  >
                    {size.label} · {formatMAD(size.price)}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY + ADD */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-[#e0ddd4] rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#9A9A9A] hover:text-[#1A1A1A]"
                  aria-label="Diminuer"
                >
                  <Minus size={14} />
                </button>
                <div className="px-5 text-sm font-mono text-[#1A1A1A] border-x border-[#e0ddd4]">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center text-[#9A9A9A] hover:text-[#1A1A1A]"
                  aria-label="Augmenter"
                >
                  <Plus size={14} />
                </button>
              </div>

              {product.inStock !== false ? (
                <button
                  onClick={handleAddToCart}
                  className={`btn-blue flex-1 py-4 text-[11px] rounded-full flex items-center justify-center gap-2 transition-all ${
                    isAdded ? '!bg-green-600 hover:!bg-green-700' : ''
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} /> Ajouté !
                    </>
                  ) : (
                    <>Ajouter — {formatMAD(currentPrice * quantity)}</>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="bg-[#eeece5] text-[#9A9A9A] flex-1 py-4 text-[11px] rounded-full flex items-center justify-center gap-2 uppercase tracking-widest font-semibold cursor-not-allowed"
                >
                  Rupture de stock
                </button>
              )}
            </div>

            {/* SHIPPING PERKS */}
            <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-[#e0ddd4]">
              <PerkItem icon={<Truck size={18} />} label="Livraison partout au Maroc avec 35Dh" />
              <PerkItem icon={<RotateCcw size={18} />} label="Retour sous 14 jours" />
              <PerkItem icon={<ShieldCheck size={18} />} label="Paiement sécurisé" />
            </div>

            <div className="mt-4 p-4 bg-[#f8fafc] rounded-lg border border-[#e0ddd4] flex gap-4 items-center">
              <div className="text-[#0ea5e9]">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1A1A1A] mb-0.5">Service client réactif</p>
                <p className="text-[12px] text-[#6B6B6B]">Une équipe à votre écoute 7j/7 pour vous conseiller.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TABS: DESCRIPTION / NOTES / INGREDIENTS / SHIPPING ====== */}
      <section className="border-y border-[#e0ddd4] bg-white border border-[#e0ddd4]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-[#e0ddd4] mb-10">
            {[
              { key: 'description', label: 'Description' },
              { key: 'notes', label: 'Notes olfactives' },
              { key: 'ingredients', label: 'Ingrédients' },
              { key: 'shipping', label: 'Livraison & Retours' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() =>
                  setActiveTab(t.key as 'description' | 'notes' | 'ingredients' | 'shipping')
                }
                className={`pb-4 text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors relative ${
                  activeTab === t.key
                    ? 'text-[#0ea5e9]'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {t.label}
                {activeTab === t.key && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#0ea5e9]" />
                )}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div>
                <p className="text-[16px] text-[#1A1A1A]/85 leading-[1.8]">
                  {product.longDescription}
                </p>
                <p className="mt-4 text-[13px] text-[#9A9A9A]">
                  <span className="font-semibold text-[#0ea5e9]">Maison :</span>{' '}
                  {product.brandLabel} · Sortie le{' '}
                  <span suppressHydrationWarning>
                    {new Date(product.releaseDate).toLocaleDateString('fr-MA', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="grid sm:grid-cols-3 gap-8">
                {[
                  { title: 'Notes de tête', items: product.notes.top },
                  { title: 'Notes de cœur', items: product.notes.heart },
                  { title: 'Notes de fond', items: product.notes.base },
                ].map((n) => (
                  <div key={n.title}>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0ea5e9] mb-3">
                      {n.title}
                    </div>
                    <ul className="space-y-2">
                      {n.items.map((item) => (
                        <li
                          key={item}
                          className="heading-font text-lg text-[#1A1A1A]/85"
                        >
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <p className="text-[13px] text-[#6B6B6B] leading-[1.9]">
                  {product.ingredients}
                </p>
                <p className="text-[12px] text-[#9A9A9A] mt-6">
                  Conforme aux normes IFRA. Fabriqué au Maroc. Ne pas ingérer.
                  Éviter le contact avec les yeux.
                </p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6 text-[14px] text-[#6B6B6B] leading-[1.8]">
                <div>
                  <div className="font-semibold text-[#1A1A1A] mb-2">
                    Livraison au Maroc
                  </div>
                  <p>
                    Livraison partout au Maroc avec 35Dh pour toute commande. Nos
                    parfums sont expédiés depuis notre atelier à Fès sous 24
                    heures ouvrées. Délai de livraison estimé : 1-3 jours ouvrés.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A1A] mb-2">
                    Paiement à la livraison
                  </div>
                  <p>
                    Vous pouvez régler en espèces directement au livreur lors de
                    la réception de votre commande.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A1A] mb-2">
                    Retours & Échanges
                  </div>
                  <p>
                    Retours acceptés sous 14 jours pour les produits non ouverts
                    et dans leur emballage d&apos;origine. Contactez-nous par
                    WhatsApp au +212 5 35 63 42 18 pour organiser le retour.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====== REVIEWS ====== */}
      <section id="reviews" className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[320px_1fr] gap-12">
          {/* Rating Summary */}
          <div className="lg:sticky lg:top-28 self-start">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
              Avis Clients
            </span>
            <h2 className="heading-font text-3xl lg:text-4xl mt-2 tracking-wide">
              {product.reviewCount} avis
            </h2>

            <div className="flex items-center gap-3 mt-6">
              <div className="heading-font text-5xl text-[#1A1A1A] mb-2">
                {product.rating.toFixed(1)}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(product.rating)
                          ? 'text-[#0ea5e9] fill-[#0ea5e9]'
                          : 'text-[#e0ddd4] fill-[#e0ddd4]'
                      }
                    />
                  ))}
                </div>
                <div className="text-[11px] text-[#9A9A9A] mt-1">sur 5</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-8 space-y-2">
              {ratingBreakdown.map((r) => (
                <div key={r.star} className="flex items-center gap-3">
                  <span className="text-[11px] text-[#6B6B6B] w-4">{r.star}</span>
                  <Star size={12} className="text-[#0ea5e9] fill-[#0ea5e9]" />
                  <div className="flex-1 h-1.5 bg-[#eeece5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0ea5e9]"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#9A9A9A] w-6 text-right">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => setIsReviewModalOpen(true)} className="btn-outline-blue w-full mt-8 py-3 text-[11px] rounded-full">
              Laisser un avis
            </button>
          </div>

          {/* Reviews list */}
          <div>
            {reviews.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-[#9A9A9A] text-sm">
                  Aucun avis pour ce parfum pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="pb-10 border-b border-[#e0ddd4] last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-transparent flex items-center justify-center heading-font text-[#0ea5e9]">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[14px] text-[#1A1A1A]">
                              {review.author}
                            </div>
                            <div className="text-[11px] text-[#9A9A9A]">
                              <span suppressHydrationWarning>
                                {review.city} · {new Date(review.createdAt).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < review.rating
                                    ? 'text-[#0ea5e9] fill-[#0ea5e9]'
                                    : 'text-[#e0ddd4] fill-[#e0ddd4]'
                                }
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-green-600 flex items-center gap-1">
                              <Check size={11} /> Achat vérifié
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <h4 className="heading-font text-xl mt-4 text-[#1A1A1A]">
                      {review.title}
                    </h4>
                    <p className="mt-2 text-[14px] text-[#6B6B6B] leading-[1.8]">
                      {review.comment}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====== RELATED ====== */}
      {relatedProducts.length > 0 && (
        <section className="bg-transparent border-t border-[#e0ddd4]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
                Vous aimerez aussi
              </span>
              <h2 className="heading-font text-3xl lg:text-4xl mt-2 tracking-wide">
                Dans la même collection
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} showRating={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== REVIEW MODAL ====== */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 p-6 lg:p-8 max-h-[90vh] overflow-y-auto">
            
            {reviewAuthStep === 'login' && !customer && (
              <div className="text-center py-4">
                <h3 className="heading-font text-2xl mb-2">Connexion</h3>
                <p className="text-[#6B6B6B] text-[13px] mb-6">Connectez-vous pour laisser un avis sur ce parfum.</p>
                
                {authError && <div className="bg-red-50 text-red-600 text-[12px] p-2 rounded mb-4">{authError}</div>}

                <form className="space-y-4" onSubmit={(e) => handleReviewAuth(e, 'login')}>
                  <div>
                    <input required type="email" placeholder="Adresse e-mail" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                  </div>
                  <div>
                    <input required type="password" placeholder="Mot de passe" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                  </div>
                  <button type="submit" disabled={loadingAuth} className="w-full btn-blue py-3 rounded-full text-[12px] mt-4 font-bold tracking-wider disabled:opacity-70">
                    {loadingAuth ? 'Connexion...' : 'Se Connecter'}
                  </button>
                </form>
                <div className="mt-6 text-[12px] text-[#6B6B6B]">
                  Nouveau client ? <button onClick={() => {setReviewAuthStep('signup'); setAuthError('');}} className="text-[#0ea5e9] font-bold underline">Créer un compte</button>
                </div>
              </div>
            )}

            {reviewAuthStep === 'signup' && !customer && (
              <div className="text-center py-4">
                <h3 className="heading-font text-2xl mb-2">Créer un compte</h3>
                <p className="text-[#6B6B6B] text-[13px] mb-6">Rejoignez-nous pour partager votre expérience.</p>
                
                {authError && <div className="bg-red-50 text-red-600 text-[12px] p-2 rounded mb-4">{authError}</div>}

                <form className="space-y-4" onSubmit={(e) => handleReviewAuth(e, 'register')}>
                  <div>
                    <input required type="text" placeholder="Nom complet" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                  </div>
                  <div>
                    <input required type="email" placeholder="Adresse e-mail" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                  </div>
                  <div>
                    <input required type="password" placeholder="Mot de passe" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                  </div>
                  <button type="submit" disabled={loadingAuth} className="w-full btn-blue py-3 rounded-full text-[12px] mt-4 font-bold tracking-wider disabled:opacity-70">
                    {loadingAuth ? 'Inscription...' : "S'inscrire"}
                  </button>
                </form>
                <div className="mt-6 text-[12px] text-[#6B6B6B]">
                  Déjà un compte ? <button onClick={() => {setReviewAuthStep('login'); setAuthError('');}} className="text-[#0ea5e9] font-bold underline">Se connecter</button>
                </div>
              </div>
            )}

            {(reviewAuthStep === 'review' || customer) && (
              <>
                <h3 className="heading-font text-2xl mb-6">Laisser un avis</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-1">Votre Nom</label>
                      <input required type="text" value={reviewFormData.author} onChange={e => setReviewFormData({...reviewFormData, author: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-2 text-[13px] focus:outline-none focus:border-[#0ea5e9]" placeholder="Ex: Salma B." />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-1">Ville</label>
                      <input required type="text" value={reviewFormData.city} onChange={e => setReviewFormData({...reviewFormData, city: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-2 text-[13px] focus:outline-none focus:border-[#0ea5e9]" placeholder="Ex: Casablanca" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Note globale</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setReviewFormData({...reviewFormData, rating: star})}>
                          <Star size={24} className={star <= reviewFormData.rating ? 'text-[#0ea5e9] fill-[#0ea5e9]' : 'text-[#e0ddd4] fill-[#e0ddd4]'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-1">Titre de l'avis</label>
                    <input required type="text" value={reviewFormData.title} onChange={e => setReviewFormData({...reviewFormData, title: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-2 text-[13px] focus:outline-none focus:border-[#0ea5e9]" placeholder="Ex: Magnifique !" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-1">Votre avis</label>
                    <textarea required rows={4} value={reviewFormData.comment} onChange={e => setReviewFormData({...reviewFormData, comment: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-2 text-[13px] focus:outline-none focus:border-[#0ea5e9] resize-none" placeholder="Partagez votre expérience avec ce parfum..."></textarea>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 btn-outline-blue py-3 text-[11px] rounded-full">Annuler</button>
                    <button type="submit" disabled={isSubmittingReview} className="flex-1 btn-blue py-3 text-[11px] rounded-full disabled:opacity-50">
                      {isSubmittingReview ? 'Envoi...' : 'Publier'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
    </div>
  );
}

function PerkItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex text-[#0ea5e9] mb-1.5">{icon}</div>
      <div className="text-[10px] text-[#6B6B6B] leading-tight">{label}</div>
    </div>
  );
}
