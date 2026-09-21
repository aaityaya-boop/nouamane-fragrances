'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, Plus, Trash2, X,
  Banknote, AlertCircle, CheckCircle2, Search, CreditCard,
  PieChart as PieIcon, ExternalLink, Calendar, RefreshCw,
  UploadCloud, FileText, Image as ImageIcon, Paperclip, Eye,
  ShieldCheck, ArrowUpRight, Filter
} from 'lucide-react';

type OrderData = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  total: number;
  status: string;
  createdAt: string;
  shippingCost: number;
  discount: number | null;
  items: string;
};

type VisitorData = {
  id: string;
  createdAt: string;
};

export type ExpenseData = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string | null;
  receiptUrl?: string | null;
  paymentMethod: string;
  recurring: string;
  creator?: {
    id: string;
    name: string;
    avatar?: string | null;
  } | null;
};

export type EmployeeData = {
  id: string;
  name: string;
  role: string;
  jobTitle?: string | null;
  salary?: number | null;
  salaryType?: string | null;
};

type FinanceClientProps = {
  orders: OrderData[];
  visitors: VisitorData[];
  viewsBySlug: Record<string, { total: number; dates: string[] }>;
  products: { id: number; slug: string; name: string; brandLabel: string; price: number; images: string; sku: string | null }[];
  initialExpenses: ExpenseData[];
  employees: EmployeeData[];
};

const EXPENSE_CATEGORIES = [
  { id: 'ADS', label: 'Publicité & Ads (TikTok, Meta, Google)', color: '#f43f5e' },
  { id: 'HOSTING', label: 'Hébergement, Web & Domaine', color: '#38bdf8' },
  { id: 'SALARY', label: 'Salaires & Rémunérations Équipe', color: '#f59e0b' },
  { id: 'PACKAGING', label: 'Flacons, Packaging & Coffrets', color: '#10b981' },
  { id: 'LOGISTICS', label: 'Logistique & Transporteurs (Amana...)', color: '#8b5cf6' },
  { id: 'TOOLS', label: 'Logiciels, IA & Abonnements SaaS', color: '#ec4899' },
  { id: 'OFFICE', label: 'Bureaux, Atelier & Fournitures', color: '#64748b' },
  { id: 'OTHER', label: 'Autres Charges Diverses', color: '#a855f7' },
];

const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', label: 'Carte Bancaire / CMI' },
  { id: 'BANK_TRANSFER', label: 'Virement Bancaire' },
  { id: 'CASH', label: 'Espèces / Cash' },
  { id: 'CHECK', label: 'Chèque Bancaire' },
  { id: 'OTHER', label: 'Autre mode de paiement' },
];

const formatMAD = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
};

export default function FinanceClient({
  orders,
  visitors,
  viewsBySlug,
  products,
  initialExpenses,
  employees,
}: FinanceClientProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPENSES'>('OVERVIEW');
  const [dateRange, setDateRange] = useState<number>(30); // days, 0 = all time
  const [expenses, setExpenses] = useState<ExpenseData[]>(initialExpenses);

  // Sync tab from URL if provided (e.g. ?tab=EXPENSES)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'EXPENSES') {
        setActiveTab('EXPENSES');
      }
    }
  }, []);

  // Modal State for New Expense
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('ADS');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('CREDIT_CARD');
  const [formRecurring, setFormRecurring] = useState('ONE_TIME');
  const [formReceiptUrl, setFormReceiptUrl] = useState('');
  const [formReceiptFileName, setFormReceiptFileName] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state for Expenses tab
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload Invoice / Receipt (PDF, PNG, JPG, JPEG, WEBP)
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploadingReceipt(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormReceiptUrl(data.url);
        setFormReceiptFileName(file.name);
        showToast('Justificatif / facture téléversé avec succès !');
      } else {
        alert(data.error || 'Erreur lors du téléversement du fichier.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Erreur réseau lors de l\'envoi du fichier.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Filter orders by dateRange
  const filteredOrders = useMemo(() => {
    if (dateRange === 0) return orders;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return orders.filter((o) => new Date(o.createdAt) >= cutoff);
  }, [orders, dateRange]);

  // Filter expenses by dateRange
  const filteredExpenses = useMemo(() => {
    if (dateRange === 0) return expenses;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return expenses.filter((e) => new Date(e.date) >= cutoff);
  }, [expenses, dateRange]);

  // Filter visitors by dateRange
  const filteredVisitors = useMemo(() => {
    if (dateRange === 0) return visitors;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return visitors.filter((v) => new Date(v.createdAt) >= cutoff);
  }, [visitors, dateRange]);

  // Calculations
  const validOrders = filteredOrders.filter((o) =>
    ['delivered', 'shipped', 'completed', 'livre', 'expedie'].includes(o.status.toLowerCase())
  );

  const grossRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalCharges = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netRevenue = grossRevenue - totalCharges;
  const netMargin = grossRevenue > 0 ? (netRevenue / grossRevenue) * 100 : 0;
  const avgOrderValue = validOrders.length > 0 ? grossRevenue / validOrders.length : 0;

  // Chart Data
  const chartData = useMemo(() => {
    const data = [];
    const daysToLook = dateRange === 0 ? 30 : dateRange;
    const today = new Date();
    for (let i = daysToLook - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayOrders = validOrders.filter((o) => o.createdAt.split('T')[0] === dateStr);
      const dayExpenses = filteredExpenses.filter((e) => e.date.split('T')[0] === dateStr);

      const dayRevenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      const dayCharges = dayExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      const dayNet = dayRevenue - dayCharges;

      data.push({
        date: dateStr.split('-').slice(1).join('/'),
        revenue: dayRevenue,
        charges: dayCharges,
        netRevenue: dayNet,
      });
    }
    return data;
  }, [validOrders, filteredExpenses, dateRange]);

  // Create Expense Submit
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) {
      alert('Veuillez renseigner l\'intitulé et le montant de la charge.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          amount: parseFloat(formAmount),
          date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
          description: formDescription,
          paymentMethod: formPaymentMethod,
          recurring: formRecurring,
          receiptUrl: formReceiptUrl || null,
        }),
      });

      if (res.ok) {
        const newExpense = await res.json();
        setExpenses([newExpense, ...expenses]);
        setIsAddExpenseModalOpen(false);
        setFormTitle('');
        setFormAmount('');
        setFormDescription('');
        setFormReceiptUrl('');
        setFormReceiptFileName('');
        setFormDate(new Date().toISOString().split('T')[0]);
        showToast('Charge et justificatif enregistrés avec succès.');
      } else {
        const d = await res.json();
        alert(d.error || "Erreur lors de l'enregistrement de la charge.");
      }
    } catch (err) {
      console.error('Create expense error:', err);
      alert('Erreur réseau lors de la création de la charge.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string, title: string) => {
    if (!window.confirm(`Supprimer définitivement la charge "${title}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
        showToast('Charge supprimée avec succès.');
      } else {
        const d = await res.json();
        alert(d.error || 'Erreur de suppression');
      }
    } catch (err) {
      console.error('Delete expense error:', err);
    }
  };

  // Winning Products
  const winningProducts = useMemo(() => {
    const productStats: Record<string, { qty: number; rev: number }> = {};
    validOrders.forEach((o) => {
      try {
        const items = JSON.parse(o.items);
        items.forEach((item: any) => {
          if (!productStats[item.slug]) {
            productStats[item.slug] = { qty: 0, rev: 0 };
          }
          productStats[item.slug].qty += item.quantity;
          productStats[item.slug].rev += item.price * item.quantity;
        });
      } catch (e) {}
    });

    return products
      .map((p) => {
        const stats = productStats[p.slug] || { qty: 0, rev: 0 };
        return {
          ...p,
          qty: stats.qty,
          rev: stats.rev,
        };
      })
      .sort((a, b) => b.rev - a.rev);
  }, [validOrders, products]);

  // Top Cities
  const topCities = useMemo(() => {
    const cities: Record<string, number> = {};
    validOrders.forEach((o) => {
      const c = o.shippingCity || 'Autre';
      cities[c] = (cities[c] || 0) + o.total;
    });
    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [validOrders]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-[#1D9BF0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Banknote size={22} className="text-[#1D9BF0]" />
            <span>Finance, Rentabilité & Charges NAY</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilotez le Chiffre d'Affaires Net, suivez vos dépenses réelles et archivez vos factures.
          </p>
        </div>

        {/* Tab Switcher & Action */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/80">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue d'ensemble & CA Net
            </button>
            <button
              onClick={() => setActiveTab('EXPENSES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'EXPENSES'
                  ? 'bg-white text-[#1D9BF0] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Charges & Factures ({expenses.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D9BF0] hover:bg-[#1a8cd8] active:bg-[#177cc0] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Ajouter une charge</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Calendar size={14} className="text-[#1D9BF0]" />
          <span>Période analysée :</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { label: '7 jours', val: 7 },
            { label: '30 jours', val: 30 },
            { label: '90 jours', val: 90 },
            { label: 'Tout l\'historique', val: 0 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDateRange(item.val)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                dateRange === item.val
                  ? 'bg-[#1D9BF0] text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CA Brut Livré</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1D9BF0] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{formatMAD(grossRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{validOrders.length} commande(s) validée(s)</div>
        </div>

        {/* Total Charges */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Charges</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">-{formatMAD(totalCharges)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{filteredExpenses.length} dépense(s) déduite(s)</div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires Net</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote size={16} />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${netRevenue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatMAD(netRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Bénéfice net après charges</div>
        </div>

        {/* Net Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marge Nette</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieIcon size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{netMargin.toFixed(1)}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Rentabilité globale</div>
        </div>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <>
          {/* Main Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1D9BF0]" />
              <span>Évolution du CA Brut vs Charges vs CA Net</span>
            </h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D9BF0" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1D9BF0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val} DH`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: any) => [`${formatMAD(Number(value))}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1D9BF0" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="CA Brut" />
                  <Area type="monotone" dataKey="charges" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={0} name="Charges" />
                  <Area type="monotone" dataKey="netRevenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" name="CA Net" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winning Products & Top Cities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Parfums les plus vendus</h2>
              <div className="divide-y divide-slate-100">
                {winningProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-400">{product.brandLabel}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatMAD(product.rev)}</div>
                      <div className="text-[11px] text-slate-500">{product.qty} flacons vendus</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Villes principales</h2>
              <div className="space-y-3">
                {topCities.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucune ville enregistrée pour le moment.</p>
                ) : (
                  topCities.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{formatMAD(item.value)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* EXPENSES & CHARGES TAB */
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une charge ou facture..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:border-[#1D9BF0] cursor-pointer"
              >
                <option value="ALL">Toutes les catégories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expenses Table with Invoices & Dates */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Intitulé & Description</th>
                    <th className="px-5 py-3.5">Catégorie</th>
                    <th className="px-5 py-3.5">Justificatif / Facture</th>
                    <th className="px-5 py-3.5">Moyen de paiement</th>
                    <th className="px-5 py-3.5">Auteur</th>
                    <th className="px-5 py-3.5 text-right">Montant</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        Aucune charge enregistrée pour cette période.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses
                      .filter((e) => {
                        const matchesSearch = 
                          e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          (e.description && e.description.toLowerCase().includes(expenseSearch.toLowerCase()));
                        const matchesCategory = expenseCategoryFilter === 'ALL' || e.category === expenseCategoryFilter;
                        return matchesSearch && matchesCategory;
                      })
                      .map((expense) => {
                        const formattedDate = new Date(expense.date).toLocaleDateString('fr-MA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });

                        const isPdf = expense.receiptUrl?.toLowerCase().includes('.pdf');

                        return (
                          <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Date */}
                            <td className="px-5 py-3.5 text-slate-600 font-mono text-xs whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-400" />
                                <span>{formattedDate}</span>
                              </div>
                            </td>

                            {/* Title & Description */}
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-slate-900">{expense.title}</div>
                              {expense.description && (
                                <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs line-clamp-1">{expense.description}</div>
                              )}
                            </td>

                            {/* Category Badge */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                                {EXPENSE_CATEGORIES.find((c) => c.id === expense.category)?.label.split('(')[0] || expense.category}
                              </span>
                            </td>

                            {/* Receipt / Invoice Upload Link */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {expense.receiptUrl ? (
                                <a
                                  href={expense.receiptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/80 text-[#0284c7] hover:bg-[#1D9BF0] hover:text-white transition-all text-xs font-semibold shadow-2xs group"
                                  title="Ouvrir la facture ou le justificatif"
                                >
                                  {isPdf ? <FileText size={13} /> : <ImageIcon size={13} />}
                                  <span>{isPdf ? 'Facture PDF' : 'Justificatif'}</span>
                                  <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                </a>
                              ) : (
                                <span className="text-slate-400 text-xs italic">Non joint</span>
                              )}
                            </td>

                            {/* Payment Method */}
                            <td className="px-5 py-3.5 text-slate-600 text-xs whitespace-nowrap">
                              {PAYMENT_METHODS.find((p) => p.id === expense.paymentMethod)?.label || expense.paymentMethod || 'Carte'}
                            </td>

                            {/* Creator */}
                            <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                              {expense.creator?.name || 'Admin'}
                            </td>

                            {/* Amount */}
                            <td className="px-5 py-3.5 text-right font-bold text-rose-600 whitespace-nowrap">
                              -{formatMAD(expense.amount)}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteExpense(expense.id, expense.title)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                                title="Supprimer la charge"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal with File Upload & Date Picker */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-6 sm:p-7 text-slate-900 animate-in fade-in zoom-in-95 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 text-[#1D9BF0] flex items-center justify-center">
                  <Banknote size={17} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Enregistrer une charge / dépense</h2>
                  <p className="text-xs text-slate-500">Déduite directement du calcul du CA Net</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              
              {/* Title Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Intitulé de la charge *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Campagne TikTok Ads Mars / Facture Hébergement Vercel"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15"
                />
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Montant */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Montant (MAD) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    placeholder="ex: 1500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15"
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Calendar size={13} className="text-[#1D9BF0]" />
                    <span>Date de la charge *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category & Payment Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1D9BF0] cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Moyen de paiement
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1D9BF0] cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INVOICE / RECEIPT FILE UPLOAD (PDF, PNG, JPG, JPEG, WEBP) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip size={13} className="text-[#1D9BF0]" />
                    <span>Facture ou Justificatif (PDF, JPG, PNG)</span>
                  </span>
                  {formReceiptUrl && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Fichier joint
                    </span>
                  )}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {formReceiptUrl ? (
                  <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-[#1D9BF0] shrink-0">
                        {formReceiptUrl.toLowerCase().includes('.pdf') ? <FileText size={16} /> : <ImageIcon size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {formReceiptFileName || 'Facture / Justificatif joint'}
                        </p>
                        <a
                          href={formReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#1D9BF0] hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <span>Voir le document</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFormReceiptUrl('');
                        setFormReceiptFileName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                      title="Supprimer ce fichier"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isUploadingReceipt
                        ? 'border-[#1D9BF0] bg-sky-50/50'
                        : 'border-slate-200 hover:border-[#1D9BF0] hover:bg-slate-50/80'
                    }`}
                  >
                    {isUploadingReceipt ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-[#1D9BF0] font-medium py-2">
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Téléversement du fichier en cours...</span>
                      </div>
                    ) : (
                      <div className="py-1">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#1D9BF0] flex items-center justify-center mx-auto mb-2 border border-sky-100">
                          <UploadCloud size={18} />
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Cliquez pour ajouter une facture ou un reçu
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Formats acceptés : PDF, JPG, PNG, WEBP (Max 15 Mo)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Remarques ou détails (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Détails du fournisseur, numéro de bon, remarques..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading || isUploadingReceipt}
                  className="px-5 py-2 bg-[#1D9BF0] hover:bg-[#1a8cd8] active:bg-[#177cc0] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer la charge</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
