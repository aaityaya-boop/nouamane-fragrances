'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  DollarSign, Percent, TrendingUp, TrendingDown, Truck, Users, Gift, MapPin, 
  Award, RefreshCcw, Calendar, ArrowUpRight, ArrowDownRight, Package, 
  ShoppingCart, MousePointerClick, Plus, Trash2, Edit3, X, Save, 
  Banknote, Globe, AlertCircle, CheckCircle2, ShieldAlert, Filter, 
  Search, CreditCard, Sparkles, PieChart as PieIcon, Layers
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
  { id: 'ADS', label: 'Publicité & Ads (TikTok, Meta)', icon: '📱', color: '#f43f5e' },
  { id: 'HOSTING', label: 'Hébergement & Web (Vercel, Shopify, Noms de domaine)', icon: '🌐', color: '#38bdf8' },
  { id: 'SALARY', label: 'Salaires & Rémunérations Équipe', icon: '👥', color: '#f59e0b' },
  { id: 'PACKAGING', label: 'Flacons, Packaging & Coffrets', icon: '📦', color: '#10b981' },
  { id: 'LOGISTICS', label: 'Logistique & Transporteurs', icon: '🚚', color: '#8b5cf6' },
  { id: 'TOOLS', label: 'Logiciels, IA & SaaS', icon: '🛠️', color: '#ec4899' },
  { id: 'OFFICE', label: 'Loyer, Bureaux & Énergie', icon: '🏢', color: '#64748b' },
  { id: 'OTHER', label: 'Autres Charges Diverses', icon: '📌', color: '#a855f7' },
];

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

  // Expense modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null);

  // Expense filter
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('ALL');
  const [expenseSearch, setExpenseSearch] = useState<string>('');

  // Add Expense form state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'ADS',
    amount: '' as string | number,
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'CREDIT_CARD',
    recurring: 'ONE_TIME',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- FILTER DATA BY DATE ---
  const filteredOrders = useMemo(() => {
    if (dateRange === 0) return orders;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return orders.filter((o) => new Date(o.createdAt) >= cutoff);
  }, [orders, dateRange]);

  const filteredExpenses = useMemo(() => {
    if (dateRange === 0) return expenses;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return expenses.filter((e) => new Date(e.date) >= cutoff);
  }, [expenses, dateRange]);

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

  // --- 1. CORE FINANCIAL METRICS & NET REVENUE (CA NET) CALCULATION ---
  const nonCanceledOrders = filteredOrders.filter(
    (o) => !['refused', 'returned', 'canceled', 'annule'].includes(o.status)
  );
  const validOrders = filteredOrders.filter((o) =>
    ['delivered', 'shipped', 'completed', 'livre', 'expedie'].includes(o.status)
  );

  // Gross Revenue (Chiffre d'affaires brut généré par les ventes)
  const grossRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);

  // Operational Expenses from records
  const totalRecordedExpenses = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Active Monthly Payroll (Masse Salariale Mensuelle)
  const monthlyPayroll = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

  // Total Charges (Expenses + Payroll)
  const totalCharges = totalRecordedExpenses;

  // CA NET RÉEL (Bénéfice Net Réel = CA Brut - Total des Charges)
  const netRevenue = grossRevenue - totalCharges;

  // Marge Nette Réelle (%)
  const netMargin = grossRevenue > 0 ? (netRevenue / grossRevenue) * 100 : 0;

  const uniqueCustomers = new Set(validOrders.map((o) => o.customerEmail.toLowerCase())).size;
  const avgOrderValue = validOrders.length > 0 ? grossRevenue / validOrders.length : 0;

  const totalVisitors = filteredVisitors.length;
  const globalConversionRate = totalVisitors > 0 ? (validOrders.length / totalVisitors) * 100 : 0;

  // Breakdown of Expenses by Category
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      totals[cat.id] = 0;
    });

    filteredExpenses.forEach((e) => {
      const cat = e.category.toUpperCase();
      if (totals[cat] !== undefined) {
        totals[cat] += Number(e.amount) || 0;
      } else {
        totals['OTHER'] = (totals['OTHER'] || 0) + (Number(e.amount) || 0);
      }
    });

    return EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      total: totals[cat.id] || 0,
      percentage: totalRecordedExpenses > 0 ? ((totals[cat.id] || 0) / totalRecordedExpenses) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }, [filteredExpenses, totalRecordedExpenses]);

  // --- 2. TIME-SERIES CHART DATA (CA vs CHARGES vs NET) ---
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
        date: dateStr,
        revenue: dayRevenue,
        charges: dayCharges,
        netRevenue: dayNet,
        ordersCount: dayOrders.length,
      });
    }
    return data;
  }, [validOrders, filteredExpenses, dateRange]);

  // Filtered Expenses List for the table
  const displayedExpenses = useMemo(() => {
    return filteredExpenses.filter((e) => {
      const matchCat = expenseCategoryFilter === 'ALL' || e.category === expenseCategoryFilter;
      const q = expenseSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [filteredExpenses, expenseCategoryFilter, expenseSearch]);

  // Submit Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError('');

      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Erreur lors de la création de la charge');
        return;
      }

      setExpenses([data.expense, ...expenses]);
      showToast(`Charge "${expenseForm.title}" de ${Number(expenseForm.amount)} MAD enregistrée.`);
      setIsAddExpenseModalOpen(false);
      setExpenseForm({
        title: '',
        category: 'ADS',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'CREDIT_CARD',
        recurring: 'ONE_TIME',
      });
    } catch (err: any) {
      setFormError(err.message || 'Erreur réseau');
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Expense Modal
  const handleOpenEditExpense = (expense: ExpenseData) => {
    setSelectedExpense(expense);
    setExpenseForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      description: expense.description || '',
      paymentMethod: expense.paymentMethod,
      recurring: expense.recurring,
    });
    setFormError('');
    setIsEditExpenseModalOpen(true);
  };

  // Submit Edit Expense
  const handleSaveEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;

    try {
      setFormLoading(true);
      setFormError('');

      const res = await fetch(`/api/admin/expenses/${selectedExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Erreur lors de la mise à jour');
        return;
      }

      setExpenses(expenses.map((e) => (e.id === selectedExpense.id ? data.expense : e)));
      showToast(`Charge "${expenseForm.title}" mise à jour.`);
      setIsEditExpenseModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erreur réseau');
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

  // --- 3. WINNING PRODUCTS ANALYTICS ---
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
        const views = filteredViewsBySlug[p.slug] || 0;
        const cvr = views > 0 ? (stats.qty / views) * 100 : 0;
        let img = '/images/hero.png';
        try {
          img = JSON.parse(p.images)[0] || img;
        } catch {}
        return {
          ...p,
          image: img,
          qty: stats.qty,
          rev: stats.rev,
          views,
          cvr,
        };
      })
      .sort((a, b) => b.rev - a.rev);
  }, [products, validOrders, filteredViewsBySlug]);

  // --- 4. GEOGRAPHIC PERFORMANCE (CITIES) ---
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
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Timeframe & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] p-3 rounded-2xl border border-white/5">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#181818] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-gradient-to-r from-[#0ea5e9] to-blue-600 text-white shadow-md'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Vue Globale & Rentabilité</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'EXPENSES'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Banknote size={14} />
            <span>Gestion des Charges & Dépenses</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {filteredExpenses.length}
            </span>
          </button>
        </div>

        {/* Date Filter & Add Charge CTA */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-white/5">
            {[
              { label: '7J', value: 7 },
              { label: '30J', value: 30 },
              { label: '90J', value: 90 },
              { label: 'Tout', value: 0 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setDateRange(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === t.value
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all"
          >
            <Plus size={14} />
            <span>Ajouter une Charge</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 CORE EXECUTIVE FINANCIAL CARDS (CA BRUT, CHARGES, CA NET) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chiffre d'Affaires Brut */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                Chiffre d&apos;Affaires Brut
              </span>
              <h3 className="text-2xl font-black text-white mt-1.5">
                {grossRevenue.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold text-[#888]">MAD</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#888888]">
            <span className="text-emerald-400 font-bold">{validOrders.length}</span>
            <span>commandes validées</span>
          </div>
        </div>

        {/* Card 2: Total des Charges (- MAD) */}
        <div className="bg-[#111111] border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <Banknote size={12} />
                <span>Total des Charges & Dépenses</span>
              </span>
              <h3 className="text-2xl font-black text-rose-400 mt-1.5">
                -{totalCharges.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold text-rose-400/70">MAD</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#888888]">
            <span>{filteredExpenses.length} charge(s) enregistrée(s)</span>
          </div>
        </div>

        {/* Card 3: CA NET RÉEL (Bénéfice Net) */}
        <div
          className={`rounded-2xl p-5 border relative overflow-hidden shadow-lg transition-all ${
            netRevenue >= 0
              ? 'bg-[#111111] border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent shadow-emerald-500/5'
              : 'bg-[#111111] border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent shadow-rose-500/5'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  netRevenue >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <Sparkles size={12} />
                <span>CA Net Réel (Bénéfice)</span>
              </span>
              <h3
                className={`text-2xl font-black mt-1.5 flex items-baseline gap-1 ${
                  netRevenue >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {netRevenue >= 0 ? '+' : ''}
                {netRevenue.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold opacity-75">MAD</span>
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                netRevenue >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {netRevenue >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#888888]">
            <span className={netRevenue >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              = CA ({grossRevenue.toLocaleString('fr-FR')}) - Charges ({totalCharges.toLocaleString('fr-FR')})
            </span>
          </div>
        </div>

        {/* Card 4: Marge Nette Réelle (%) */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                Marge Nette Réelle
              </span>
              <h3
                className={`text-2xl font-black mt-1.5 ${
                  netMargin >= 30
                    ? 'text-emerald-400'
                    : netMargin > 0
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {netMargin.toFixed(1)} %
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#888888]">
            <span>Panier moyen :</span>
            <span className="font-bold text-white">{avgOrderValue.toFixed(0)} MAD</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: VUE GLOBALE & ANALYTICS                           */}
      {/* ======================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Financial Evolution Chart: CA vs Charges vs Net */}
          <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-sky-400" />
                  <span>Évolution Financière (Ventes vs Charges vs CA Net)</span>
                </h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Visualisez en temps réel l&apos;impact des dépenses publicitaires et charges sur le résultat net.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                  <span>Ventes (CA Brut)</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span>Charges & Pubs</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>CA Net Réel</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCharges" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#555"
                    fontSize={11}
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis stroke="#555" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [`${Number(value).toLocaleString('fr-FR')} MAD`, 'Ventes (CA Brut)'];
                      if (name === 'charges') return [`${Number(value).toLocaleString('fr-FR')} MAD`, 'Charges & Dépenses'];
                      if (name === 'netRevenue') return [`${Number(value).toLocaleString('fr-FR')} MAD`, 'CA Net Réel'];
                      return [value, name];
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="charges" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCharges)" />
                  <Area type="monotone" dataKey="netRevenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winning Products & Geographic Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Winning Products (2 cols) */}
            <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="text-amber-400" size={18} />
                    <span>Top Parfums Rentables (Winning Products)</span>
                  </h3>
                  <p className="text-xs text-[#888888] mt-0.5">
                    Classement par chiffre d&apos;affaires généré et taux de conversion.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[#888888] uppercase font-bold text-[10px]">
                      <th className="pb-3">Parfum</th>
                      <th className="pb-3 text-center">Unités</th>
                      <th className="pb-3 text-right">CA Généré</th>
                      <th className="pb-3 text-right">Taux Conv.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {winningProducts.slice(0, 5).map((prod, idx) => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <span className="w-5 text-center font-bold text-[#666]">{idx + 1}</span>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg object-cover bg-white/5"
                          />
                          <div>
                            <div className="font-bold text-white truncate max-w-[200px]">
                              {prod.name}
                            </div>
                            <div className="text-[10px] text-[#666] uppercase">{prod.brandLabel}</div>
                          </div>
                        </td>
                        <td className="py-3 text-center font-semibold text-white">{prod.qty}</td>
                        <td className="py-3 text-right font-bold text-emerald-400">
                          {prod.rev.toLocaleString('fr-FR')} MAD
                        </td>
                        <td className="py-3 text-right font-semibold text-sky-400">
                          {prod.cvr.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Villes & Répartition */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="text-rose-400" size={18} />
                  <span>Top Villes (Ventes)</span>
                </h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Répartition géographique des commandes au Maroc.
                </p>
              </div>

              <div className="space-y-4">
                {topCities.map((c, i) => {
                  const pct = grossRevenue > 0 ? (c.value / grossRevenue) * 100 : 0;
                  return (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{c.name}</span>
                        <span className="text-emerald-400">{c.value.toLocaleString('fr-FR')} MAD ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GESTION DÉTAILLÉE DES CHARGES & DÉPENSES          */}
      {/* ======================================================== */}
      {activeTab === 'EXPENSES' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Category Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setExpenseCategoryFilter(expenseCategoryFilter === cat.id ? 'ALL' : cat.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  expenseCategoryFilter === cat.id
                    ? 'bg-[#1a1a1a] border-sky-500 ring-1 ring-sky-500'
                    : 'bg-[#111111] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-[#888]">
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-[#888] truncate">{cat.label}</div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    {cat.total.toLocaleString('fr-FR')}{' '}
                    <span className="text-xs font-normal text-[#666]">MAD</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expenses Table Controls */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" size={15} />
              <input
                type="text"
                placeholder="Rechercher une charge (ex: TikTok, Vercel, Cartons)..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#666] focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="bg-[#161616] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">Toutes les Catégories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all shrink-0"
              >
                <Plus size={14} />
                <span>Nouvelle Charge</span>
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-[#141414] text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Titre de la Charge</th>
                    <th className="py-3.5 px-4">Catégorie</th>
                    <th className="py-3.5 px-4">Montant Déduit (MAD)</th>
                    <th className="py-3.5 px-4">Date de Paiement</th>
                    <th className="py-3.5 px-4">Règlement & Fréquence</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#ccc]">
                  {displayedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#666]">
                        Aucune charge enregistrée pour cette période. Cliquez sur &quot;Ajouter une Charge&quot; pour en créer une.
                      </td>
                    </tr>
                  ) : (
                    displayedExpenses.map((expense) => {
                      const catMeta = EXPENSE_CATEGORIES.find((c) => c.id === expense.category) || {
                        label: expense.category,
                        icon: '📌',
                        color: '#a855f7',
                      };

                      return (
                        <tr key={expense.id} className="hover:bg-[#161616]/70 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{catMeta.icon}</span>
                              <span>{expense.title}</span>
                            </div>
                            {expense.description && (
                              <div className="text-[11px] text-[#777] mt-0.5">
                                {expense.description}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/5 text-white border border-white/5">
                              {catMeta.label}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-black text-rose-400 text-sm">
                              -{Number(expense.amount).toLocaleString('fr-FR')} MAD
                            </span>
                          </td>

                          <td className="py-4 px-4 text-[#888]">
                            {new Date(expense.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="font-semibold text-white">
                                {expense.paymentMethod === 'CREDIT_CARD'
                                  ? 'Carte Bancaire'
                                  : expense.paymentMethod === 'BANK_TRANSFER'
                                  ? 'Virement'
                                  : expense.paymentMethod === 'CASH'
                                  ? 'Espèces'
                                  : 'Autre'}
                              </div>
                              <div className="text-[#666]">
                                {expense.recurring === 'MONTHLY' ? 'Mensuel' : 'Ponctuel'}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditExpense(expense)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                                title="Modifier la charge"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(expense.id, expense.title)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Supprimer la charge"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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

      {/* ======================================================== */}
      {/* MODAL 1: AJOUTER UNE CHARGE / DÉPENSE                    */}
      {/* ======================================================== */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#111111] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                Déduction Comptable
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Plus size={22} className="text-rose-400" />
                <span>Ajouter une Charge / Dépense</span>
              </h2>
              <p className="text-xs text-[#888888]">
                Cette charge sera immédiatement déduite du Chiffre d&apos;Affaires Net (CA Net).
              </p>
            </div>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Titre de la Charge *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campagne TikTok Ads - Mars 2026"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Catégorie *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Montant en Dirhams (MAD) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="Ex: 3500"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 font-bold text-rose-400 placeholder-[#666] focus:outline-none focus:border-rose-500 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#777]">
                      MAD
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Date du Paiement *</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Mode de Règlement</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="CREDIT_CARD">Carte Bancaire / En Ligne</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CASH">Espèces</option>
                    <option value="CHECK">Chèque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Description & Remarques (Optionnel)</label>
                <textarea
                  rows={2}
                  placeholder="Détails de la dépense, facture ou lien..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white placeholder-[#666] focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  {formLoading ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Enregistrer la Charge (- MAD)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: MODIFIER UNE CHARGE                             */}
      {/* ======================================================== */}
      {isEditExpenseModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#111111] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsEditExpenseModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                Modification
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Edit3 size={20} className="text-sky-400" />
                <span>Modifier la Charge</span>
              </h2>
            </div>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Titre de la Charge</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Catégorie</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Montant (MAD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 font-bold text-rose-400 focus:outline-none focus:border-rose-500 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#777]">
                      MAD
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Date du Paiement</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Mode de Règlement</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="CREDIT_CARD">Carte Bancaire / En Ligne</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CASH">Espèces</option>
                    <option value="CHECK">Chèque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  {formLoading ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
