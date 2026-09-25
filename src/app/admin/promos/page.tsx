'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Ticket,
  Plus,
  Trash2,
  Tag,
  Loader2,
  Sparkles,
  Search,
  Check,
  Percent,
  Coins,
  Globe,
  Layers,
  FolderTree,
  Calendar,
  Eye,
  X,
  Copy,
  CheckCircle2,
  AlertCircle,
  Filter,
  CheckSquare,
  Square,
  Power,
  Package,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Gift,
  Flame,
  Crown,
  ShoppingBag,
  Truck,
  Zap,
  ArrowRight,
  TrendingUp,
  BadgePercent,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface ProductItem {
  id: number;
  slug: string;
  name: string;
  brandLabel?: string;
  brandId?: string;
  subcategory?: string;
  subcategoryLabel?: string;
  gender?: string;
  price: number;
  images?: string | string[];
}

interface PromoCodeItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableScope: 'ALL' | 'CATEGORIES' | 'SPECIFIC_PRODUCTS';
  categories?: string[];
  productIds: number[];
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usageCount?: number;
  expiresAt?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SpecialDealItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  dealType: 'BUY_X_GET_Y_FREE' | 'SECOND_AT_DISCOUNT' | 'BUNDLE_FIXED_PRICE';
  buyQuantity: number;
  getQuantity: number;
  discountPercent: number;
  bundlePrice?: number | null;
  applicableScope: 'ALL' | 'CATEGORIES' | 'SPECIFIC_PRODUCTS';
  categories?: string[];
  productIds: number[];
  isAutomatic: boolean;
  promoCode?: string | null;
  freeShipping: boolean;
  freeGiftName?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

interface PresetCategory {
  id: string;
  label: string;
  iconKey: 'men' | 'women' | 'unisex' | 'oriental' | 'testers' | 'coffrets';
  desc: string;
}

const PRESET_CATEGORIES: PresetCategory[] = [
  { id: 'men', label: 'Parfums Homme', iconKey: 'men', desc: 'Tous les parfums pour homme' },
  { id: 'women', label: 'Parfums Femme', iconKey: 'women', desc: 'Tous les parfums pour femme' },
  { id: 'unisex', label: 'Parfums Unisexe', iconKey: 'unisex', desc: 'Parfums mixtes & universels' },
  { id: 'oriental', label: 'Parfums Orientaux', iconKey: 'oriental', desc: 'Notes de oud, ambre & épices' },
  { id: 'testers', label: 'Testeurs Parfums', iconKey: 'testers', desc: 'Flacons testeurs de marques de luxe' },
  { id: 'coffrets', label: 'Coffrets & Cadeaux', iconKey: 'coffrets', desc: 'Sets découverte & coffrets' },
];

export default function AdminPromos() {
  const [activeTab, setActiveTab] = useState<'promos' | 'deals'>('deals');

  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [deals, setDeals] = useState<SpecialDealItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ==========================================
  // TAB 1: PROMO CODE FORM STATE
  // ==========================================
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [applicableScope, setApplicableScope] = useState<'ALL' | 'CATEGORIES' | 'SPECIFIC_PRODUCTS'>('ALL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBrandSelector, setShowBrandSelector] = useState(false);

  // Specific Product Selector State
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilterTab, setCategoryFilterTab] = useState<string>('all');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'selected' | 'unselected'>('all');

  // Modal State for Viewing Target Products
  const [viewingPromo, setViewingPromo] = useState<PromoCodeItem | null>(null);
  const [viewingDeal, setViewingDeal] = useState<SpecialDealItem | null>(null);

  // Copy Feedback State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Promo Search in List
  const [listSearch, setListSearch] = useState('');
  const [listScopeFilter, setListScopeFilter] = useState<'all' | 'ALL' | 'CATEGORIES' | 'SPECIFIC_PRODUCTS'>('all');

  // ==========================================
  // TAB 2: SPECIAL DEALS / BOGO FORM STATE
  // ==========================================
  const [dealTitle, setDealTitle] = useState('Achetez 2, le 3ème OFFERT');
  const [dealSubtitle, setDealSubtitle] = useState('Ajoutez 3 parfums au panier, le 3ème est automatiquement offert !');
  const [dealBadgeText, setDealBadgeText] = useState('2+1 OFFERT');
  const [dealType, setDealType] = useState<'BUY_X_GET_Y_FREE' | 'SECOND_AT_DISCOUNT' | 'BUNDLE_FIXED_PRICE'>('BUY_X_GET_Y_FREE');
  const [buyQuantity, setBuyQuantity] = useState(2);
  const [getQuantity, setGetQuantity] = useState(1);
  const [dealDiscountPercent, setDealDiscountPercent] = useState(100);
  const [bundlePrice, setBundlePrice] = useState('499');
  const [dealScope, setDealScope] = useState<'ALL' | 'CATEGORIES' | 'SPECIFIC_PRODUCTS'>('ALL');
  const [dealCategories, setDealCategories] = useState<string[]>([]);
  const [dealProductIds, setDealProductIds] = useState<number[]>([]);
  const [dealIsAutomatic, setDealIsAutomatic] = useState(true);
  const [dealPromoCode, setDealPromoCode] = useState('');
  const [dealFreeShipping, setDealFreeShipping] = useState(false);
  const [dealFreeGiftName, setDealFreeGiftName] = useState('');
  const [dealPriority, setDealPriority] = useState(10);
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);

  // Deal Product Selector State
  const [dealProductSearch, setDealProductSearch] = useState('');
  const [dealCategoryFilterTab, setDealCategoryFilterTab] = useState<string>('all');
  const [dealSelectionFilter, setDealSelectionFilter] = useState<'all' | 'selected' | 'unselected'>('all');

  // Simulator State
  const [simCartCount, setSimCartCount] = useState<number>(3);
  const [simItemPrice, setSimItemPrice] = useState<number>(299);

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/admin/deals');
      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchPromos();
    fetchDeals();
    fetchProducts();
  }, []);

  // Helper to extract image URL
  const getProductImage = (images: string | string[] | undefined): string => {
    if (!images) return '/images/nay/nay-logo-blue.png';
    if (Array.isArray(images)) return images[0] || '/images/nay/nay-logo-blue.png';
    if (typeof images === 'string') {
      try {
        if (images.startsWith('[')) {
          const parsed = JSON.parse(images);
          return Array.isArray(parsed) && parsed[0] ? parsed[0] : '/images/nay/nay-logo-blue.png';
        }
      } catch {
        return images;
      }
      return images;
    }
    return '/images/nay/nay-logo-blue.png';
  };

  // Render vector icon for category
  const renderCategoryIcon = (iconKey: string, isSelected = false, size = 13) => {
    const iconClass = isSelected ? 'text-purple-700' : 'text-neutral-700';
    switch (iconKey) {
      case 'men':
        return <User size={size} className={iconClass} />;
      case 'women':
        return <Sparkles size={size} className={iconClass} />;
      case 'unisex':
        return <Users size={size} className={iconClass} />;
      case 'oriental':
        return <Flame size={size} className={iconClass} />;
      case 'testers':
      case 'originaux':
        return <Crown size={size} className={iconClass} />;
      case 'coffrets':
        return <Gift size={size} className={iconClass} />;
      default:
        return <Tag size={size} className={iconClass} />;
    }
  };

  // Distinct Brands list from products
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brandLabel) brandsSet.add(p.brandLabel.trim());
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Check if a product belongs to a category key
  const productMatchesCategory = (p: ProductItem, catKey: string): boolean => {
    const k = catKey.toLowerCase();
    const pGender = (p.gender || '').toLowerCase();
    const pSub = (p.subcategory || '').toLowerCase();
    const pBrand = (p.brandLabel || '').toLowerCase();

    if (k === 'men') return pGender === 'men' || pGender === 'homme';
    if (k === 'women') return pGender === 'women' || pGender === 'femme';
    if (k === 'unisex') return pGender === 'unisex' || pGender === 'unisexe';
    if (k === 'oriental') return pSub === 'arabic';
    if (k === 'testers' || k === 'testeurs' || k === 'originaux') return pSub !== 'arabic';
    if (k === 'coffrets') return pSub === 'coffrets' || p.name.toLowerCase().includes('coffret');
    if (pBrand === k || pBrand.toLowerCase() === k) return true;
    return false;
  };

  // Calculate count of products for a category key
  const getCategoryProductCount = (catKey: string): number => {
    return products.filter((p) => productMatchesCategory(p, catKey)).length;
  };

  // Lookup map for products
  const productMap = useMemo(() => {
    const map = new Map<number, ProductItem>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // ==========================================
  // PRESET DEAL TEMPLATES HANDLERS
  // ==========================================
  const applyDealTemplate = (templateKey: string) => {
    switch (templateKey) {
      case 'buy2get1':
        setDealTitle('Achetez 2, le 3ème OFFERT');
        setDealSubtitle('Ajoutez 3 parfums au panier, le 3ème flacon est 100% gratuit !');
        setDealBadgeText('2+1 OFFERT');
        setDealType('BUY_X_GET_Y_FREE');
        setBuyQuantity(2);
        setGetQuantity(1);
        setDealDiscountPercent(100);
        setDealScope('ALL');
        setDealIsAutomatic(true);
        setDealFreeShipping(false);
        setDealFreeGiftName('');
        break;

      case 'second50':
        setDealTitle('2ème Parfum à -50%');
        setDealSubtitle('Pour l\'achat d\'un parfum, bénéficiez de -50% sur le deuxième flacon !');
        setDealBadgeText('2ÈME À -50%');
        setDealType('SECOND_AT_DISCOUNT');
        setBuyQuantity(1);
        setGetQuantity(1);
        setDealDiscountPercent(50);
        setDealScope('ALL');
        setDealIsAutomatic(true);
        setDealFreeShipping(false);
        setDealFreeGiftName('');
        break;

      case 'buy3get1shipping':
        setDealTitle('3 Achetés = 4ème OFFERT + Livraison Gratuite');
        setDealSubtitle('Offre Ultime : 4 parfums pour le prix de 3 avec livraison 0 DH partout au Maroc !');
        setDealBadgeText('3+1 + LIVRAISON 0 DH');
        setDealType('BUY_X_GET_Y_FREE');
        setBuyQuantity(3);
        setGetQuantity(1);
        setDealDiscountPercent(100);
        setDealScope('ALL');
        setDealIsAutomatic(true);
        setDealFreeShipping(true);
        setDealFreeGiftName('');
        break;

      case 'packDuo':
        setDealTitle('Pack Duo Luxe : 2 Parfums pour 499 DH');
        setDealSubtitle('Composez votre coffret de 2 parfums prestigieux au prix exclusif de 499 DH au lieu de 598 DH.');
        setDealBadgeText('PACK DUO 499 DH');
        setDealType('BUNDLE_FIXED_PRICE');
        setBuyQuantity(2);
        setBundlePrice('499');
        setDealScope('ALL');
        setDealIsAutomatic(true);
        setDealFreeShipping(false);
        setDealFreeGiftName('');
        break;

      case 'packTrio':
        setDealTitle('Pack Trio Prestige : 3 Parfums pour 699 DH');
        setDealSubtitle('3 parfums au choix pour seulement 699 DH (économisez près de 200 DH !)');
        setDealBadgeText('PACK TRIO 699 DH');
        setDealType('BUNDLE_FIXED_PRICE');
        setBuyQuantity(3);
        setBundlePrice('699');
        setDealScope('ALL');
        setDealIsAutomatic(true);
        setDealFreeShipping(true);
        setDealFreeGiftName('');
        break;

      case 'freeGiftDeal':
        setDealTitle('Cadeau Échantillon Luxe Offert dès 2 Parfums');
        setDealSubtitle('Recevez un vaporisateur de poche découverte offert dans votre colis dès 2 flacons achetés.');
        setDealBadgeText('CADEAU OFFERT');
        setDealType('BUY_X_GET_Y_FREE');
        setBuyQuantity(2);
        setGetQuantity(0);
        setDealDiscountPercent(0);
        setDealScope('ALL');
        setDealIsAutomatic(true);
        setDealFreeShipping(false);
        setDealFreeGiftName('Vaporisateur Nomade 5ml Luxe');
        break;
    }
  };

  // ==========================================
  // DEAL CREATION / EDITING / DELETION
  // ==========================================
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle) {
      alert('Veuillez spécifier le titre de l\'offre.');
      return;
    }

    if (dealScope === 'CATEGORIES' && dealCategories.length === 0) {
      alert('Veuillez cocher au moins une catégorie éligible.');
      return;
    }

    if (dealScope === 'SPECIFIC_PRODUCTS' && dealProductIds.length === 0) {
      alert('Veuillez sélectionner au moins un parfum.');
      return;
    }

    setIsSubmittingDeal(true);
    try {
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dealTitle,
          subtitle: dealSubtitle,
          badgeText: dealBadgeText,
          dealType,
          buyQuantity,
          getQuantity,
          discountPercent: dealDiscountPercent,
          bundlePrice: dealType === 'BUNDLE_FIXED_PRICE' ? parseFloat(bundlePrice) : null,
          applicableScope: dealScope,
          categories: dealScope === 'CATEGORIES' ? dealCategories : [],
          productIds: dealScope === 'SPECIFIC_PRODUCTS' ? dealProductIds : [],
          isAutomatic: dealIsAutomatic,
          promoCode: dealPromoCode || null,
          freeShipping: dealFreeShipping,
          freeGiftName: dealFreeGiftName || null,
          priority: dealPriority,
          isActive: true,
        })
      });

      if (res.ok) {
        fetchDeals();
        alert('🎉 Offre créée avec succès !');
      } else {
        const d = await res.json();
        alert(d.error || 'Erreur lors de la création de l\'offre');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la création de l\'offre');
    } finally {
      setIsSubmittingDeal(false);
    }
  };

  const handleToggleDealStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, isActive: !currentStatus } : d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm('Supprimer définitivement cette offre spéciale ?')) return;
    try {
      const res = await fetch(`/api/admin/deals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDeals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // LIVE SIMULATOR CALCULATION
  // ==========================================
  const simResults = useMemo(() => {
    const rawTotal = simCartCount * simItemPrice;
    let discount = 0;
    let explanation = 'Aucune offre appliquée';

    if (dealType === 'BUY_X_GET_Y_FREE') {
      const groupSize = buyQuantity + getQuantity;
      if (groupSize > 0 && getQuantity > 0) {
        const freeUnitsCount = Math.floor(simCartCount / groupSize) * getQuantity;
        discount = freeUnitsCount * (simItemPrice * (dealDiscountPercent / 100));
        explanation = freeUnitsCount > 0 
          ? `${freeUnitsCount} flacon(s) bénéficient de -${dealDiscountPercent}% (-${discount.toFixed(0)} DH)`
          : `Ajoutez encore ${groupSize - (simCartCount % groupSize)} parfum(s) pour débloquer l'offre`;
      } else if (getQuantity === 0 && simCartCount >= buyQuantity) {
        explanation = `Cadeau offert débloqué dès ${buyQuantity} parfums !`;
      }
    } else if (dealType === 'SECOND_AT_DISCOUNT') {
      const pairsCount = Math.floor(simCartCount / 2);
      discount = pairsCount * (simItemPrice * (dealDiscountPercent / 100));
      explanation = pairsCount > 0
        ? `${pairsCount} flacon(s) à -${dealDiscountPercent}% (-${discount.toFixed(0)} DH)`
        : 'Ajoutez un 2ème parfum pour obtenir -50% dessus';
    } else if (dealType === 'BUNDLE_FIXED_PRICE') {
      const bPrice = parseFloat(bundlePrice) || 0;
      const bundlesCount = Math.floor(simCartCount / buyQuantity);
      if (bundlesCount > 0 && bPrice > 0) {
        const originalBundleSum = bundlesCount * buyQuantity * simItemPrice;
        const targetBundleSum = bPrice * bundlesCount;
        if (originalBundleSum > targetBundleSum) {
          discount = originalBundleSum - targetBundleSum;
          explanation = `${bundlesCount} pack(s) de ${buyQuantity} parfums pour ${targetBundleSum} DH (au lieu de ${originalBundleSum} DH)`;
        }
      } else {
        explanation = `Ajoutez encore ${buyQuantity - (simCartCount % buyQuantity)} parfum(s) pour débloquer le pack à ${bundlePrice} DH`;
      }
    }

    const finalTotal = Math.max(0, rawTotal - discount);
    return { rawTotal, discount, finalTotal, explanation };
  }, [simCartCount, simItemPrice, dealType, buyQuantity, getQuantity, dealDiscountPercent, bundlePrice]);

  // ==========================================
  // TAB 1: PROMO CREATION
  // ==========================================
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    if (applicableScope === 'CATEGORIES' && selectedCategories.length === 0) {
      alert('Veuillez cocher au moins une catégorie pour ce code promo.');
      return;
    }

    if (applicableScope === 'SPECIFIC_PRODUCTS' && selectedProductIds.length === 0) {
      alert('Veuillez sélectionner au moins un parfum pour ce code promo ciblé.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          value,
          applicableScope,
          categories: applicableScope === 'CATEGORIES' ? selectedCategories : [],
          productIds: applicableScope === 'SPECIFIC_PRODUCTS' ? selectedProductIds : [],
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          expiresAt: expiresAt || null,
          description: description || null,
          isActive: true,
        }),
      });

      if (res.ok) {
        setCode('');
        setValue('');
        setMinOrderAmount('');
        setMaxUses('');
        setExpiresAt('');
        setDescription('');
        setSelectedCategories([]);
        setSelectedProductIds([]);
        setApplicableScope('ALL');
        setShowAdvanced(false);
        fetchPromos();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la création du code promo');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur serveur lors de la création du code promo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePromoStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setPromos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement ce code promo ?')) return;

    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPromos();
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered Products for Promo Tab
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.brandLabel && p.brandLabel.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.subcategoryLabel && p.subcategoryLabel.toLowerCase().includes(productSearch.toLowerCase()));

      const matchesTab =
        categoryFilterTab === 'all' || productMatchesCategory(p, categoryFilterTab);

      const isSelected = selectedProductIds.includes(p.id);
      const matchesSelection =
        selectionFilter === 'all' ||
        (selectionFilter === 'selected' && isSelected) ||
        (selectionFilter === 'unselected' && !isSelected);

      return matchesSearch && matchesTab && matchesSelection;
    });
  }, [products, productSearch, categoryFilterTab, selectionFilter, selectedProductIds]);

  // Filtered Products for Deals Tab
  const dealFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !dealProductSearch ||
        p.name.toLowerCase().includes(dealProductSearch.toLowerCase()) ||
        (p.brandLabel && p.brandLabel.toLowerCase().includes(dealProductSearch.toLowerCase())) ||
        (p.subcategoryLabel && p.subcategoryLabel.toLowerCase().includes(dealProductSearch.toLowerCase()));

      const matchesTab =
        dealCategoryFilterTab === 'all' || productMatchesCategory(p, dealCategoryFilterTab);

      const isSelected = dealProductIds.includes(p.id);
      const matchesSelection =
        dealSelectionFilter === 'all' ||
        (dealSelectionFilter === 'selected' && isSelected) ||
        (dealSelectionFilter === 'unselected' && !isSelected);

      return matchesSearch && matchesTab && matchesSelection;
    });
  }, [products, dealProductSearch, dealCategoryFilterTab, dealSelectionFilter, dealProductIds]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header with Tab Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1.5">
              <Zap size={11} className="text-amber-600" />
              Marketing & Croissance
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500 font-medium">Promotions & Bons Plans</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <span>Promotions, Remises & Offres BOGO</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez vos offres automatiques (2+1 Gratuit, -50% sur le 2ème, Packs) et vos codes promos ciblés.
          </p>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Gift size={14} className={activeTab === 'deals' ? 'text-amber-600' : 'text-neutral-400'} />
            <span>Bons Plans & BOGO (2+1)</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md ml-0.5">
              {deals.filter(d => d.isActive).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'promos'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Ticket size={14} className={activeTab === 'promos' ? 'text-purple-600' : 'text-neutral-400'} />
            <span>Codes Promo Classiques</span>
            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-md ml-0.5">
              {promos.filter(p => p.isActive).length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SPECIAL DEALS & BOGO ENGINE (2+1 FREE, -50% ON 2ND, PACKS, GIFTS) */}
      {/* ========================================================================= */}
      {activeTab === 'deals' && (
        <div className="space-y-6">
          {/* 1-Click Preset Templates Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-purple-500/10 border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Modèles d&apos;Offres Clés en Main (1 Clic)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Cliquez sur une offre pour pré-remplir instantanément la mécanique promotionnelle.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {/* Template 1 */}
              <button
                type="button"
                onClick={() => applyDealTemplate('buy2get1')}
                className="flex items-start gap-3 p-3 bg-white/90 hover:bg-white border border-neutral-200/80 hover:border-amber-400 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-amber-700">
                    2 Achetés = 3ème OFFERT
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    Le flacon le moins cher est 100% gratuit au panier.
                  </div>
                </div>
              </button>

              {/* Template 2 */}
              <button
                type="button"
                onClick={() => applyDealTemplate('second50')}
                className="flex items-start gap-3 p-3 bg-white/90 hover:bg-white border border-neutral-200/80 hover:border-blue-400 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100">
                  <BadgePercent size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-blue-700">
                    2ème Parfum à -50%
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    Le 2ème article bénéficie de 50% de remise immédiate.
                  </div>
                </div>
              </button>

              {/* Template 3 */}
              <button
                type="button"
                onClick={() => applyDealTemplate('buy3get1shipping')}
                className="flex items-start gap-3 p-3 bg-white/90 hover:bg-white border border-neutral-200/80 hover:border-emerald-400 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                  <Truck size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700">
                    3 Achetés = 4ème + Livraison 0 DH
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    4ème flacon offert + livraison offerte partout au Maroc.
                  </div>
                </div>
              </button>

              {/* Template 4 */}
              <button
                type="button"
                onClick={() => applyDealTemplate('packDuo')}
                className="flex items-start gap-3 p-3 bg-white/90 hover:bg-white border border-neutral-200/80 hover:border-purple-400 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-100">
                  <Package size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-purple-700">
                    Pack Duo : 2 Parfums pour 499 DH
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    Prix groupé fixe pour 2 parfums (au lieu de ~598 DH).
                  </div>
                </div>
              </button>

              {/* Template 5 */}
              <button
                type="button"
                onClick={() => applyDealTemplate('packTrio')}
                className="flex items-start gap-3 p-3 bg-white/90 hover:bg-white border border-neutral-200/80 hover:border-pink-400 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-pink-50 text-pink-700 group-hover:bg-pink-100">
                  <Crown size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-pink-700">
                    Pack Trio : 3 Parfums pour 699 DH
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    Pack prestige 3 flacons avec économie de ~200 DH.
                  </div>
                </div>
              </button>

              {/* Template 6 */}
              <button
                type="button"
                onClick={() => applyDealTemplate('freeGiftDeal')}
                className="flex items-start gap-3 p-3 bg-white/90 hover:bg-white border border-neutral-200/80 hover:border-indigo-400 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100">
                  <Gift size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-indigo-700">
                    Cadeau Offert dès 2 Parfums
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    Vaporisateur ou coffret miniature offert automatiquement.
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Deal Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" />
                  <span>Configurer une Offre Promotionnelle</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  L&apos;offre sera calculée automatiquement dans le panier de vos clients.
                </p>
              </div>

              <form onSubmit={handleCreateDeal} className="space-y-5">
                {/* Title & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700">Titre de l&apos;Offre *</label>
                    <input
                      type="text"
                      required
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      placeholder="ex: Achetez 2, le 3ème OFFERT !"
                      className="w-full px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700">Badge / Tag</label>
                    <input
                      type="text"
                      value={dealBadgeText}
                      onChange={(e) => setDealBadgeText(e.target.value)}
                      placeholder="ex: 2+1 OFFERT"
                      className="w-full px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-bold text-amber-700 focus:outline-none focus:border-amber-500 focus:bg-white uppercase"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Description pour le client (Optionnel)</label>
                  <input
                    type="text"
                    value={dealSubtitle}
                    onChange={(e) => setDealSubtitle(e.target.value)}
                    placeholder="ex: Ajoutez 3 parfums au panier, le 3ème flacon est 100% gratuit"
                    className="w-full px-3.5 py-2 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                {/* Deal Mechanism Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700">Mécanique de l&apos;Offre</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDealType('BUY_X_GET_Y_FREE')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        dealType === 'BUY_X_GET_Y_FREE'
                          ? 'bg-amber-50/50 border-amber-500 ring-1 ring-amber-500'
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-900">Achetez X, Offert Y</span>
                        <Check size={13} className={dealType === 'BUY_X_GET_Y_FREE' ? 'text-amber-600' : 'opacity-0'} />
                      </div>
                      <p className="text-[10px] text-neutral-500">Ex: 2 achetés = 1 offert (2+1)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDealType('SECOND_AT_DISCOUNT')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        dealType === 'SECOND_AT_DISCOUNT'
                          ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-900">2ème à Remise %</span>
                        <Check size={13} className={dealType === 'SECOND_AT_DISCOUNT' ? 'text-blue-600' : 'opacity-0'} />
                      </div>
                      <p className="text-[10px] text-neutral-500">Ex: 2ème flacon à -50%</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDealType('BUNDLE_FIXED_PRICE')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        dealType === 'BUNDLE_FIXED_PRICE'
                          ? 'bg-purple-50/50 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-900">Pack à Prix Fixe</span>
                        <Check size={13} className={dealType === 'BUNDLE_FIXED_PRICE' ? 'text-purple-600' : 'opacity-0'} />
                      </div>
                      <p className="text-[10px] text-neutral-500">Ex: 2 parfums = 499 DH</p>
                    </button>
                  </div>
                </div>

                {/* Deal Parameters */}
                <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-4 space-y-4">
                  {dealType === 'BUY_X_GET_Y_FREE' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">Acheter (X)</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(parseInt(e.target.value, 10) || 1)}
                          className="w-full mt-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold"
                        />
                        <span className="text-[10px] text-neutral-400">ex: 2 flacons</span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">Obtenir (Y)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={getQuantity}
                          onChange={(e) => setGetQuantity(parseInt(e.target.value, 10) || 0)}
                          className="w-full mt-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold"
                        />
                        <span className="text-[10px] text-neutral-400">ex: 1 flacon</span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">Remise sur (Y) %</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={dealDiscountPercent}
                          onChange={(e) => setDealDiscountPercent(parseFloat(e.target.value) || 100)}
                          className="w-full mt-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold"
                        />
                        <span className="text-[10px] text-neutral-400">100% = gratuit</span>
                      </div>
                    </div>
                  )}

                  {dealType === 'SECOND_AT_DISCOUNT' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-700">Pourcentage de remise sur le 2ème parfum</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={dealDiscountPercent}
                          onChange={(e) => setDealDiscountPercent(parseFloat(e.target.value) || 50)}
                          className="w-32 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold"
                        />
                        <span className="text-xs font-bold text-blue-700">-{dealDiscountPercent}% appliqué sur le 2ème flacon</span>
                      </div>
                    </div>
                  )}

                  {dealType === 'BUNDLE_FIXED_PRICE' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">Nombre de Parfums dans le Pack</label>
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(parseInt(e.target.value, 10) || 2)}
                          className="w-full mt-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">Prix Total du Pack (MAD)</label>
                        <input
                          type="number"
                          min="1"
                          value={bundlePrice}
                          onChange={(e) => setBundlePrice(e.target.value)}
                          placeholder="499"
                          className="w-full mt-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-purple-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Applicable Scope Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700">Portée / Parfums Éligibles</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDealScope('ALL')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        dealScope === 'ALL'
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                        <Globe size={13} />
                        <span>Tout le Catalogue</span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${dealScope === 'ALL' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        {products.length} parfums
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDealScope('CATEGORIES')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        dealScope === 'CATEGORIES'
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                        <FolderTree size={13} />
                        <span>Par Catégories</span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${dealScope === 'CATEGORIES' ? 'text-purple-200' : 'text-neutral-400'}`}>
                        {dealCategories.length} sélectionnée(s)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDealScope('SPECIFIC_PRODUCTS')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        dealScope === 'SPECIFIC_PRODUCTS'
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                        <Layers size={13} />
                        <span>Parfums Spécifiques</span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${dealScope === 'SPECIFIC_PRODUCTS' ? 'text-blue-200' : 'text-neutral-400'}`}>
                        {dealProductIds.length} sélectionné(s)
                      </div>
                    </button>
                  </div>

                  {/* Categories picker */}
                  {dealScope === 'CATEGORIES' && (
                    <div className="mt-3 p-3.5 bg-purple-50/40 border border-purple-200 rounded-xl space-y-2.5 animate-in fade-in">
                      <div className="text-xs font-bold text-neutral-800">Cochez les catégories éligibles à cette offre :</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_CATEGORIES.map((cat) => {
                          const isChecked = dealCategories.includes(cat.id);
                          const count = getCategoryProductCount(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setDealCategories(prev =>
                                  prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                                );
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-purple-100/70 border-purple-400 text-purple-900 font-bold'
                                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {renderCategoryIcon(cat.iconKey, isChecked, 13)}
                                <span className="text-xs truncate">{cat.label}</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded-md text-neutral-500">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Specific products picker */}
                  {dealScope === 'SPECIFIC_PRODUCTS' && (
                    <div className="mt-3 p-3.5 bg-blue-50/40 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-neutral-800">
                          Sélectionnez les parfums ({dealProductIds.length} sélectionnés) :
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const ids = dealFilteredProducts.map(p => p.id);
                              setDealProductIds(prev => Array.from(new Set([...prev, ...ids])));
                            }}
                            className="text-[10px] text-blue-700 hover:underline font-bold"
                          >
                            Tout cocher ({dealFilteredProducts.length})
                          </button>
                          <span className="text-neutral-300">•</span>
                          <button
                            type="button"
                            onClick={() => setDealProductIds([])}
                            className="text-[10px] text-neutral-500 hover:underline"
                          >
                            Vider
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-2.5 text-neutral-400" />
                        <input
                          type="text"
                          value={dealProductSearch}
                          onChange={(e) => setDealProductSearch(e.target.value)}
                          placeholder="Rechercher un parfum par nom ou marque..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {dealFilteredProducts.slice(0, 30).map((prod) => {
                          const isSel = dealProductIds.includes(prod.id);
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                setDealProductIds(prev =>
                                  prev.includes(prod.id) ? prev.filter(i => i !== prod.id) : [...prev, prod.id]
                                );
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                                isSel
                                  ? 'bg-blue-100/70 border-blue-400 text-blue-900 font-bold'
                                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-4 h-4 rounded flex items-center justify-center ${isSel ? 'bg-blue-600 text-white' : 'border border-neutral-300'}`}>
                                  {isSel && <Check size={11} />}
                                </div>
                                <span className="text-xs truncate">{prod.name}</span>
                              </div>
                              <span className="text-xs font-bold text-neutral-900">{prod.price} DH</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Extra Perks: Free Shipping & Free Gift */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealFreeShipping}
                        onChange={(e) => setDealFreeShipping(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Truck size={13} className="text-emerald-600" />
                        <span>Livraison Gratuite Automatique</span>
                      </span>
                    </label>
                    <p className="text-[10px] text-neutral-500 pl-6">
                      Débloque 0 DH de livraison partout au Maroc quand l&apos;offre est remplie.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Gift size={13} className="text-pink-600" />
                      <span>Cadeau / Échantillon Offert</span>
                    </label>
                    <input
                      type="text"
                      value={dealFreeGiftName}
                      onChange={(e) => setDealFreeGiftName(e.target.value)}
                      placeholder="ex: Miniature 5ml Luxe offerte"
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingDeal}
                    className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingDeal ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={15} className="text-amber-400" />
                        <span>Publier cette Offre Promotionnelle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Live Simulator & Active Deals List (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* LIVE CART SIMULATOR */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-400 text-neutral-900 flex items-center justify-center font-black text-xs">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                        Simulateur Panier en Direct
                      </h3>
                      <p className="text-[10px] text-neutral-400">
                        Testez en direct la réaction de votre offre !
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Quantity selector */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1.5">
                      Articles dans le panier simulé
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSimCartCount(num)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            simCartCount === num
                              ? 'bg-amber-400 text-neutral-900 font-black shadow-xs'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {num} {num === 1 ? 'flacon' : 'flacons'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing recap */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Sous-total ({simCartCount} × {simItemPrice} DH)</span>
                      <span>{simResults.rawTotal} DH</span>
                    </div>

                    {simResults.discount > 0 ? (
                      <div className="flex justify-between font-bold text-emerald-400">
                        <span>Remise débloquée</span>
                        <span>-{simResults.discount.toFixed(0)} DH</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-300 italic">
                        {simResults.explanation}
                      </div>
                    )}

                    {dealFreeShipping && simResults.discount > 0 && (
                      <div className="flex justify-between text-[11px] text-emerald-300">
                        <span>Livraison</span>
                        <span className="font-bold">GRATUITE (0 DH)</span>
                      </div>
                    )}

                    {dealFreeGiftName && (
                      <div className="flex justify-between text-[11px] text-pink-300">
                        <span>Cadeau débloqué</span>
                        <span className="font-bold">🎁 {dealFreeGiftName}</span>
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Total Client</span>
                      <span className="text-xl font-bold text-white">{simResults.finalTotal.toFixed(0)} DH</span>
                    </div>
                  </div>

                  {/* Customer Badge Preview */}
                  <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">
                      Aperçu de la bannière panier :
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-full">
                      <Sparkles size={12} />
                      <span>{dealBadgeText || 'OFFRE SPÉCIALE'}</span>
                    </div>
                    <div className="text-[11px] text-neutral-300 mt-1.5">
                      {dealSubtitle || dealTitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* LIST OF CURRENT ACTIVE DEALS */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                    <Gift size={14} className="text-amber-600" />
                    <span>Offres Actives ({deals.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={fetchDeals}
                    className="text-neutral-400 hover:text-neutral-900 p-1 rounded transition-colors"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>

                {deals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    Aucune offre spéciale pour le moment. Cliquez sur un modèle ci-dessus pour en créer une !
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          deal.isActive
                            ? 'bg-neutral-50/50 border-neutral-200'
                            : 'bg-neutral-100/50 border-neutral-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {deal.badgeText && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                                  {deal.badgeText}
                                </span>
                              )}
                              <span className="text-xs font-bold text-neutral-900">
                                {deal.title}
                              </span>
                            </div>

                            {deal.subtitle && (
                              <p className="text-[11px] text-neutral-500 mb-2">
                                {deal.subtitle}
                              </p>
                            )}

                            {/* Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-600 text-[10px] font-semibold rounded-md">
                                {deal.dealType === 'BUY_X_GET_Y_FREE' && `Achetez ${deal.buyQuantity}, Obtenez ${deal.getQuantity}`}
                                {deal.dealType === 'SECOND_AT_DISCOUNT' && `2ème à -${deal.discountPercent}%`}
                                {deal.dealType === 'BUNDLE_FIXED_PRICE' && `Pack ${deal.buyQuantity} = ${deal.bundlePrice} DH`}
                              </span>

                              {deal.freeShipping && (
                                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                                  <Truck size={10} />
                                  <span>Livraison 0 DH</span>
                                </span>
                              )}

                              {deal.freeGiftName && (
                                <span className="px-2 py-0.5 bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                                  <Gift size={10} />
                                  <span>{deal.freeGiftName}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleDealStatus(deal.id, deal.isActive)}
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                deal.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-neutral-200 text-neutral-600 border-neutral-300'
                              }`}
                              title={deal.isActive ? 'Mettre en pause' : 'Activer'}
                            >
                              <Power size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLASSIC PROMO CODES ENGINE                                         */}
      {/* ========================================================================= */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Create Promo Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Ticket size={16} className="text-purple-600" />
                <span>Nouveau Code Promo</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Créez un coupon à partager avec vos clients ou influenceurs.
              </p>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              {/* Code Name & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="ex: AID2026"
                    className="w-full px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-black tracking-wider text-neutral-900 focus:outline-none focus:border-purple-500 focus:bg-white uppercase font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Type de remise</label>
                  <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        type === 'percentage'
                          ? 'bg-white text-neutral-900 shadow-2xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      % Pourcent
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('fixed')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        type === 'fixed'
                          ? 'bg-white text-neutral-900 shadow-2xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      MAD Fixe
                    </button>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">
                  Valeur de la réduction * ({type === 'percentage' ? '%' : 'MAD'})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={type === 'percentage' ? '1' : '5'}
                    min="1"
                    max={type === 'percentage' ? '100' : '5000'}
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percentage' ? 'ex: 20 (pour -20%)' : 'ex: 50 (pour -50 MAD)'}
                    className="w-full px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                  <div className="absolute right-3.5 top-2.5 text-neutral-400 font-bold text-xs pointer-events-none">
                    {type === 'percentage' ? '%' : 'MAD'}
                  </div>
                </div>
              </div>

              {/* Scope Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-neutral-700">Portée du Code Promo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setApplicableScope('ALL')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      applicableScope === 'ALL'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Globe size={13} className="mx-auto mb-1" />
                    <span className="text-[11px] font-bold block">Global</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicableScope('CATEGORIES')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      applicableScope === 'CATEGORIES'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <FolderTree size={13} className="mx-auto mb-1" />
                    <span className="text-[11px] font-bold block">Catégories</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicableScope('SPECIFIC_PRODUCTS')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      applicableScope === 'SPECIFIC_PRODUCTS'
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Layers size={13} className="mx-auto mb-1" />
                    <span className="text-[11px] font-bold block">Parfums</span>
                  </button>
                </div>

                {/* Scope: Categories */}
                {applicableScope === 'CATEGORIES' && (
                  <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold text-purple-900">Catégories ciblées :</div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_CATEGORIES.map((cat) => {
                        const isChecked = selectedCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategories(prev =>
                                prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                              );
                            }}
                            className={`p-2 rounded-lg border text-left flex items-center justify-between text-xs cursor-pointer ${
                              isChecked
                                ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold'
                                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="truncate">{cat.label}</span>
                            <span className="text-[10px] text-neutral-400">{getCategoryProductCount(cat.id)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scope: Specific Products */}
                {applicableScope === 'SPECIFIC_PRODUCTS' && (
                  <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold text-blue-900">
                      {selectedProductIds.length} parfum(s) sélectionné(s)
                    </div>
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-neutral-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Rechercher un parfum..."
                        className="w-full pl-7 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredProducts.slice(0, 20).map((prod) => {
                        const isSel = selectedProductIds.includes(prod.id);
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductIds(prev =>
                                prev.includes(prod.id) ? prev.filter(i => i !== prod.id) : [...prev, prod.id]
                              );
                            }}
                            className={`w-full flex items-center justify-between p-1.5 rounded border text-xs cursor-pointer ${
                              isSel ? 'bg-blue-100 border-blue-400 font-bold text-blue-900' : 'bg-white border-neutral-200 text-neutral-700'
                            }`}
                          >
                            <span className="truncate">{prod.name}</span>
                            <span className="font-mono">{prod.price} DH</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Promo */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={15} />
                    <span>Créer le Code Promo</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Promo Codes List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Ticket size={16} className="text-purple-600" />
                <span>Codes Promo Actifs ({promos.length})</span>
              </h2>

              <div className="relative w-48">
                <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Filtrer..."
                  className="w-full pl-7 pr-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {promos.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                Aucun code promo créé pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((promo) => (
                  <div
                    key={promo.id}
                    className={`p-4 rounded-xl border transition-all ${
                      promo.isActive
                        ? 'bg-neutral-50/50 border-neutral-200'
                        : 'bg-neutral-100/50 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 select-all">
                          {promo.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(promo.code)}
                          className="text-neutral-400 hover:text-neutral-900 p-1"
                          title="Copier"
                        >
                          {copiedCode === promo.code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {promo.type === 'percentage' ? `-${promo.value}%` : `-${promo.value} DH`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePromoStatus(promo.id, promo.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            promo.isActive
                              ? 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {promo.isActive ? 'Pause' : 'Activer'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePromo(promo.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
