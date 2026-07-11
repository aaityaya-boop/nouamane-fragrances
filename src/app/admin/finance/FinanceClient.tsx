'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { DollarSign, Percent, TrendingUp, Truck, Users, Gift, MapPin, Award, RefreshCcw, Calendar, ArrowUpRight, ArrowDownRight, Package, ShoppingCart, MousePointerClick } from 'lucide-react';

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

type FinanceClientProps = {
  orders: OrderData[];
  visitors: VisitorData[];
  viewsBySlug: Record<string, { total: number, dates: string[] }>;
  products: { id: number, slug: string, name: string, brandLabel: string, price: number, images: string, sku: string | null }[];
};

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function FinanceClient({ orders, visitors, viewsBySlug, products }: FinanceClientProps) {
  const [dateRange, setDateRange] = useState<number>(30); // days, 0 = all time

  // --- FILTER DATA BY DATE ---
  const filteredOrders = useMemo(() => {
    if (dateRange === 0) return orders;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, dateRange]);

  const filteredVisitors = useMemo(() => {
    if (dateRange === 0) return visitors;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return visitors.filter(v => new Date(v.createdAt) >= cutoff);
  }, [visitors, dateRange]);

  const filteredViewsBySlug = useMemo(() => {
    if (dateRange === 0) {
      const result: Record<string, number> = {};
      Object.keys(viewsBySlug).forEach(slug => {
        result[slug] = viewsBySlug[slug].total;
      });
      return result;
    }
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    const result: Record<string, number> = {};
    Object.keys(viewsBySlug).forEach(slug => {
      const dates = viewsBySlug[slug].dates.filter(d => new Date(d) >= cutoff);
      result[slug] = dates.length;
    });
    return result;
  }, [viewsBySlug, dateRange]);

  // --- 1. CORE FINANCIAL METRICS ---
  const nonCanceledOrders = filteredOrders.filter((o) => !['refused', 'returned', 'canceled', 'annule'].includes(o.status));
  const validOrders = filteredOrders.filter((o) => ['delivered', 'shipped'].includes(o.status));
  
  const grossRevenue = nonCanceledOrders.reduce((acc, o) => acc + o.total + (o.discount || 0), 0);
  const netRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  
  const uniqueCustomers = new Set(validOrders.map(o => o.customerEmail.toLowerCase())).size;
  const avgOrderValue = validOrders.length > 0 ? netRevenue / validOrders.length : 0;
  
  const totalVisitors = filteredVisitors.length;
  const globalConversionRate = totalVisitors > 0 ? (validOrders.length / totalVisitors) * 100 : 0;

  // --- 2. TIME-SERIES DATA ---
  const chartData = useMemo(() => {
    const data = [];
    const daysToLook = dateRange === 0 ? 30 : dateRange; // Default to 30 if all time just for chart
    const today = new Date();
    for (let i = daysToLook - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = validOrders.filter((o) => o.createdAt.split('T')[0] === dateStr);
      data.push({
        date: dateStr,
        revenue: dayOrders.reduce((acc, o) => acc + o.total, 0),
        ordersCount: dayOrders.length,
      });
    }
    return data;
  }, [validOrders, dateRange]);

  // --- 3. WINNING PRODUCTS ANALYTICS ---
  const winningProducts = useMemo(() => {
    const productStats: Record<string, { qty: number, rev: number }> = {};
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

    return products.map(p => {
      const stats = productStats[p.slug] || { qty: 0, rev: 0 };
      const views = filteredViewsBySlug[p.slug] || 0;
      const cvr = views > 0 ? (stats.qty / views) * 100 : 0;
      let img = '/images/hero.png';
      try { img = JSON.parse(p.images)[0] || img; } catch {}
      return {
        ...p,
        image: img,
        qty: stats.qty,
        rev: stats.rev,
        views,
        cvr
      };
    }).sort((a, b) => b.rev - a.rev);
  }, [products, validOrders, filteredViewsBySlug]);

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Calendar size={18} className="text-[#0ea5e9]" />
          <span className="text-[14px] font-bold text-[#111]">Période d'analyse :</span>
        </div>
        <div className="flex items-center gap-2 bg-[#f8fafc] p-1 rounded-xl border border-black/5">
          {[
            { label: "7 Jours", value: 7 },
            { label: "30 Jours", value: 30 },
            { label: "Tout le temps", value: 0 },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all ${
                dateRange === opt.value 
                  ? 'bg-white shadow-sm text-[#111]' 
                  : 'text-[#666] hover:text-[#111]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: MASTER KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CA Net */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666]">Chiffre d'Affaires</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={16} /></div>
          </div>
          <h3 className="text-3xl font-black text-[#111] tracking-tight">{formatMAD(netRevenue)}</h3>
          <p className="text-[11px] font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> Net Validé
          </p>
        </div>

        {/* Commandes */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666]">Ventes (Qté)</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingCart size={16} /></div>
          </div>
          <h3 className="text-3xl font-black text-[#111] tracking-tight">{validOrders.length}</h3>
          <p className="text-[11px] font-medium text-blue-600 mt-2 flex items-center gap-1">
            Commandes livrées/expédiées
          </p>
        </div>

        {/* Conversion */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666]">Conversion</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Percent size={16} /></div>
          </div>
          <h3 className="text-3xl font-black text-[#111] tracking-tight">{globalConversionRate.toFixed(2)}%</h3>
          <p className="text-[11px] font-medium text-purple-600 mt-2 flex items-center gap-1">
            Visiteurs → Acheteurs
          </p>
        </div>

        {/* AOV */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666]">Panier Moyen</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Package size={16} /></div>
          </div>
          <h3 className="text-3xl font-black text-[#111] tracking-tight">{formatMAD(avgOrderValue)}</h3>
          <p className="text-[11px] font-medium text-amber-600 mt-2 flex items-center gap-1">
            Revenu par commande
          </p>
        </div>

        {/* Traffic */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666]">Visiteurs</p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={16} /></div>
          </div>
          <h3 className="text-3xl font-black text-[#111] tracking-tight">{totalVisitors}</h3>
          <p className="text-[11px] font-medium text-indigo-600 mt-2 flex items-center gap-1">
            Trafic unique généré
          </p>
        </div>
      </div>

      {/* SECTION 2: CHARTS */}
      <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[18px] font-black text-[#111] tracking-tight">Dynamique des Ventes</h2>
            <p className="text-[12px] text-[#666] mt-1">Évolution du chiffre d'affaires net sur la période sélectionnée.</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={(val) => { const d = new Date(val); return `${d.getDate()}/${d.getMonth()+1}`; }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9A9A9A', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9A9A9A', fontWeight: 600 }} tickFormatter={(val) => `${val} Dh`} dx={-10} />
              <Tooltip 
                formatter={(value: any) => [`${formatMAD(Number(value))}`, 'CA Net']} 
                labelFormatter={(label) => new Date(label as string).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })} 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" activeDot={{ r: 8, strokeWidth: 0, fill: '#0ea5e9' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: WINNING PRODUCTS TABLE */}
      <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-black text-[#111] tracking-tight flex items-center gap-2">
              <Award className="text-[#f59e0b]" size={20} /> Matrice "Winning Products"
            </h2>
            <p className="text-[12px] text-[#666] mt-1">
              Analysez la performance individuelle de chaque parfum pour scaler vos meilleures ventes.
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#9A9A9A]">Produit</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#9A9A9A]">Vues (Trafic)</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#9A9A9A]">Unités Vendues</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#9A9A9A]">CA Généré</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#9A9A9A]">Taux de Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {winningProducts.slice(0, 20).map((product, idx) => (
                <tr key={product.id} className="hover:bg-[#fafaf7] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f8fafc] border border-black/5 flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#111]">{product.name}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#0ea5e9] mt-0.5">{product.brandLabel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-[#111]">
                      <MousePointerClick size={16} className="text-[#9A9A9A]" />
                      {product.views}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-bold text-[#111]">
                      {product.qty} <span className="text-[12px] text-[#9A9A9A] font-medium">pcs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-black text-[#10b981]">
                      {formatMAD(product.rev)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${product.cvr >= 3 ? 'bg-emerald-500' : product.cvr >= 1 ? 'bg-amber-500' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(product.cvr * 10, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[13px] font-bold ${product.cvr >= 3 ? 'text-emerald-600' : product.cvr >= 1 ? 'text-amber-600' : 'text-red-500'}`}>
                        {product.cvr.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {winningProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#9A9A9A] text-[13px] font-medium">
                    Aucune donnée disponible pour cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
