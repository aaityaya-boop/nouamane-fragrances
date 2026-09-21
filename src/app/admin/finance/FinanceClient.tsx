'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, Plus, Trash2, X,
  Banknote, AlertCircle, CheckCircle2, Search, CreditCard,
  PieChart as PieIcon, ExternalLink, Calendar, RefreshCw
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
  { id: 'ADS', label: 'Publicité & Ads (TikTok, Meta)', color: '#f43f5e' },
  { id: 'HOSTING', label: 'Hébergement & Web (Vercel, Shopify)', color: '#38bdf8' },
  { id: 'SALARY', label: 'Salaires & Rémunérations', color: '#f59e0b' },
  { id: 'PACKAGING', label: 'Flacons, Packaging & Coffrets', color: '#10b981' },
  { id: 'LOGISTICS', label: 'Logistique & Transporteurs', color: '#8b5cf6' },
  { id: 'TOOLS', label: 'Logiciels, IA & SaaS', color: '#ec4899' },
  { id: 'OFFICE', label: 'Bureaux & Frais Généraux', color: '#64748b' },
  { id: 'OTHER', label: 'Autres Charges Diverses', color: '#a855f7' },
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
  const [formLoading, setFormLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state for Expenses tab
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  const filteredViewsBySlug = useMemo(() => {
    if (dateRange === 0) {
      const result: Record<string, number> = {};
      Object.keys(viewsBySlug).forEach((slug) => {
        result[slug] = viewsBySlug[slug].total;
      });
      return result;
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    const result: Record<string, number> = {};
    Object.keys(viewsBySlug).forEach((slug) => {
      const dates = viewsBySlug[slug].dates.filter((d) => new Date(d) >= cutoff);
      result[slug] = dates.length;
    });
    return result;
  }, [viewsBySlug, dateRange]);

  // 1. Calculations
  const validOrders = filteredOrders.filter((o) =>
    ['delivered', 'shipped', 'completed', 'livre', 'expedie'].includes(o.status.toLowerCase())
  );

  const grossRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalCharges = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netRevenue = grossRevenue - totalCharges;
  const netMargin = grossRevenue > 0 ? (netRevenue / grossRevenue) * 100 : 0;
  const avgOrderValue = validOrders.length > 0 ? grossRevenue / validOrders.length : 0;

  // 2. Chart Data
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
      alert('Veuillez remplir le titre et le montant.');
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
          date: formDate,
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
        showToast('Charge enregistrée et déduite du CA Net.');
      } else {
        const d = await res.json();
        alert(d.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error('Create expense error:', err);
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
        showToast(`Charge supprimée.`);
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
  }, [products, validOrders]);

  // Top Cities
  const topCities = useMemo(() => {
    const citySales: Record<string, number> = {};
    validOrders.forEach((o) => {
      const city = o.shippingCity.trim().toUpperCase() || 'INCONNU';
      citySales[city] = (citySales[city] || 0) + o.total;
    });
    return Object.entries(citySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [validOrders]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Timeframe & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>Vue Globale & Rentabilité</span>
            {activeTab === 'OVERVIEW' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`pb-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'EXPENSES'
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>Charges & Dépenses</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
              {filteredExpenses.length}
            </span>
            {activeTab === 'EXPENSES' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
        </div>

        {/* Date Filter & Add Charge CTA */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            {[
              { label: '7J', value: 7 },
              { label: '30J', value: 30 },
              { label: '90J', value: 90 },
              { label: 'Tout', value: 0 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setDateRange(t.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  dateRange === t.value
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white font-medium text-xs shadow-2xs transition-colors"
          >
            <Plus size={13} />
            <span>Ajouter une charge</span>
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <>
          {/* 4 CORE EXECUTIVE FINANCIAL CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Chiffre d'Affaires Brut */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Chiffre d&apos;affaires brut
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                {formatMAD(grossRevenue)}
              </h3>
              <div className="mt-2 text-[12px] text-neutral-500">
                {validOrders.length} commande(s) livrée(s)
              </div>
            </div>

            {/* Card 2: Total des Charges (- MAD) */}
            <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                Total des charges
              </span>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                -{formatMAD(totalCharges)}
              </h3>
              <div className="mt-2 text-[12px] text-neutral-500">
                {filteredExpenses.length} charge(s) déduite(s)
              </div>
            </div>

            {/* Card 3: CA NET RÉEL (Bénéfice) */}
            <div className={`bg-white border rounded-xl p-5 shadow-2xs ${
              netRevenue >= 0 ? 'border-emerald-200' : 'border-rose-200'
            }`}>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                netRevenue >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                CA Net Réel (Bénéfice)
              </span>
              <h3 className={`text-2xl font-bold mt-1 ${
                netRevenue >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {netRevenue >= 0 ? '+' : ''}{formatMAD(netRevenue)}
              </h3>
              <div className="mt-2 text-[12px] text-neutral-500 font-mono">
                = CA ({grossRevenue.toFixed(0)}) - Charges ({totalCharges.toFixed(0)})
              </div>
            </div>

            {/* Card 4: Marge Nette Réelle */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Marge nette réelle
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                {netMargin.toFixed(1)}%
              </h3>
              <div className="mt-2 text-[12px] text-neutral-500">
                Panier moyen : {formatMAD(avgOrderValue)}
              </div>
            </div>
          </div>

          {/* FINANCIAL TIME-SERIES CHART */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Évolution financière
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Comparaison du CA Brut, des Charges et du CA Net Réel sur la période.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-neutral-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" /> CA Brut
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Charges
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> CA Net Réel
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#111827" fill="#111827" fillOpacity={0.05} strokeWidth={2} name="CA Brut" />
                  <Area type="monotone" dataKey="charges" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.05} strokeWidth={2} name="Charges" />
                  <Area type="monotone" dataKey="netRevenue" stroke="#059669" fill="#059669" fillOpacity={0.08} strokeWidth={2} name="CA Net" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winning Products & Top Cities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">
                Parfums les plus vendus
              </h3>
              <div className="divide-y divide-neutral-100">
                {winningProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between text-[13px]">
                    <div>
                      <div className="font-medium text-neutral-900">{product.name}</div>
                      <div className="text-[11px] text-neutral-400">{product.brandLabel} {product.sku ? `• ${product.sku}` : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900">{formatMAD(product.rev)}</div>
                      <div className="text-[11px] text-neutral-500">{product.qty} vendu(s)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities (1 col) */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">
                Villes les plus actives
              </h3>
              <div className="space-y-3">
                {topCities.map(([city, total]: any, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-neutral-800">{city}</span>
                    <span className="font-semibold text-neutral-900">{formatMAD(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* EXPENSES MANAGEMENT TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher une charge..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Titre & Description</th>
                  <th className="px-5 py-3">Catégorie</th>
                  <th className="px-5 py-3">Enregistré par</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-400">
                      Aucune charge enregistrée.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses
                    .filter((e) =>
                      e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                      (e.description && e.description.toLowerCase().includes(expenseSearch.toLowerCase()))
                    )
                    .map((expense) => {
                      const formattedDate = new Date(expense.date).toLocaleDateString('fr-MA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });

                      return (
                        <tr key={expense.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-5 py-3 text-neutral-500 font-mono text-xs">{formattedDate}</td>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-neutral-900">{expense.title}</div>
                            {expense.description && (
                              <div className="text-xs text-neutral-500 mt-0.5">{expense.description}</div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-neutral-600">
                            {expense.creator?.name || 'Admin'}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-rose-600">
                            -{formatMAD(expense.amount)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleDeleteExpense(expense.id, expense.title)}
                              className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
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
      )}

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-lg w-full p-6 text-neutral-900 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-base font-bold text-neutral-900">Ajouter une charge</h3>
              <button onClick={() => setIsAddExpenseModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Intitulé de la charge</label>
                <input
                  type="text"
                  placeholder="ex: Campagne TikTok Ads Mars / Hébergement Vercel"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Montant (MAD)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 1500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Détails supplémentaires..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-medium shadow-2xs disabled:opacity-50"
                >
                  {formLoading ? 'Enregistrement...' : 'Enregistrer la charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
