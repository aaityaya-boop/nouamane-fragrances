'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, Percent, TrendingUp, Truck, Users, Gift, MapPin, Award, RefreshCcw } from 'lucide-react';

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

type FinanceClientProps = {
  orders: OrderData[];
};

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function FinanceClient({ orders }: FinanceClientProps) {
  // --- 1. CORE FINANCIAL METRICS ---
  const nonCanceledOrders = orders.filter((o) => !['refused', 'returned', 'canceled', 'annule'].includes(o.status));
  const validOrders = orders.filter((o) => ['delivered', 'shipped'].includes(o.status));
  
  const grossRevenue = nonCanceledOrders.reduce((acc, o) => acc + o.total + (o.discount || 0), 0);
  const netRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const pendingRevenue = orders.filter((o) => ['pending', 'processing', 'unconfirmed'].includes(o.status)).reduce((acc, o) => acc + o.total, 0);
  const returnedRevenue = orders.filter((o) => o.status === 'returned').reduce((acc, o) => acc + o.total, 0);
  const returnedCount = orders.filter((o) => o.status === 'returned').length;
  const totalDiscounts = validOrders.reduce((acc, o) => acc + (o.discount || 0), 0);
  const totalShipping = validOrders.reduce((acc, o) => acc + o.shippingCost, 0);

  const uniqueCustomers = new Set(validOrders.map(o => o.customerEmail.toLowerCase())).size;
  const avgOrderValue = validOrders.length > 0 ? netRevenue / validOrders.length : 0;
  const ltv = uniqueCustomers > 0 ? netRevenue / uniqueCustomers : 0; // Lifetime Value

  // --- 2. TIME-SERIES DATA (LAST 30 DAYS) ---
  const last30DaysData = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = validOrders.filter((o) => o.createdAt.split('T')[0] === dateStr);
    last30DaysData.push({
      date: dateStr,
      revenue: dayOrders.reduce((acc, o) => acc + o.total, 0),
      ordersCount: dayOrders.length,
    });
  }

  // --- 3. PRODUCT PERFORMANCE ---
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  validOrders.forEach((o) => {
    try {
      const items = JSON.parse(o.items);
      items.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    } catch (e) {}
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // --- 4. GEOGRAPHIC PERFORMANCE (CITIES) ---
  const citySales: Record<string, number> = {};
  validOrders.forEach(o => {
    const city = o.shippingCity.trim().toUpperCase() || 'INCONNU';
    citySales[city] = (citySales[city] || 0) + o.total;
  });
  const topCities = Object.entries(citySales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // --- 5. TOP CUSTOMERS (LOYALTY) ---
  const customerStats: Record<string, { name: string; email: string; spent: number; count: number }> = {};
  validOrders.forEach(o => {
    const email = o.customerEmail.toLowerCase();
    if (!customerStats[email]) {
      customerStats[email] = { name: o.customerName, email, spent: 0, count: 0 };
    }
    customerStats[email].spent += o.total;
    customerStats[email].count += 1;
  });
  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* SECTION 1: EXECUTIVE SUMMARY */}
      <div>
        <h2 className="text-[14px] font-bold tracking-widest uppercase text-gray-500 mb-4">Vue d'ensemble de la Trésorerie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard icon={<DollarSign />} title="Chiffre d'Affaires Net" value={formatMAD(netRevenue)} subtitle="Revenus validés" bg="bg-emerald-50 text-emerald-600" />
          <KpiCard icon={<TrendingUp />} title="Revenus en Attente" value={formatMAD(pendingRevenue)} subtitle="Potentiel à confirmer" bg="bg-amber-50 text-amber-600" />
          <KpiCard icon={<RefreshCcw />} title="Retours Clients" value={formatMAD(returnedRevenue)} subtitle={`${returnedCount} commande(s)`} bg="bg-red-50 text-red-600" />
          <KpiCard icon={<Gift />} title="Impact Promo" value={`-${formatMAD(totalDiscounts)}`} subtitle="Réductions accordées" bg="bg-purple-50 text-purple-600" />
          <KpiCard icon={<Truck />} title="Logistique" value={formatMAD(totalShipping)} subtitle="Frais facturés" bg="bg-blue-50 text-blue-600" />
        </div>
      </div>

      {/* SECTION 2: CUSTOMER VALUE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl shadow-lg border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Valeur Vie Client (LTV)</p>
            <h3 className="text-3xl font-bold">{formatMAD(ltv)}</h3>
            <p className="text-gray-500 text-xs mt-1">Revenu moyen par client unique</p>
          </div>
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-emerald-400">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl shadow-lg border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Panier Moyen (AOV)</p>
            <h3 className="text-3xl font-bold">{formatMAD(avgOrderValue)}</h3>
            <p className="text-gray-500 text-xs mt-1">Revenu par commande</p>
          </div>
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-sky-400">
            <Percent size={24} />
          </div>
        </div>
        <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl shadow-lg border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Base Clients Active</p>
            <h3 className="text-3xl font-bold">{uniqueCustomers}</h3>
            <p className="text-gray-500 text-xs mt-1">Acheteurs confirmés uniques</p>
          </div>
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-purple-400">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* SECTION 3: REVENUE CHART */}
      <div className="bg-white border border-[#e0ddd4] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-bold text-gray-900">Croissance des Revenus (30 derniers jours)</h2>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">CA Net Uniquement</span>
        </div>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={(val) => { const d = new Date(val); return `${d.getDate()}/${d.getMonth()+1}`; }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `${val} Dh`} dx={-10} />
              <Tooltip formatter={(value: any) => [formatMAD(Number(value)), 'CA Net Généré']} labelFormatter={(label) => new Date(label as string).toLocaleDateString('fr-FR')} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: DEEP DIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Cities */}
        <div className="bg-white border border-[#e0ddd4] rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin size={18} className="text-sky-500"/> Pénétration par Ville</h2>
          <div className="flex-1 flex flex-col justify-center items-center">
            {topCities.length > 0 ? (
              <>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topCities} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {topCities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatMAD(Number(value))} contentStyle={{ borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2 mt-4">
                  {topCities.map((city, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="font-medium text-gray-700">{city.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatMAD(city.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm py-10">Pas assez de données.</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-[#e0ddd4] rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6 flex items-center gap-2">🏆 Parfums Best-Sellers</h2>
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">{product.quantity} Unités vendues</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-600">
                  {formatMAD(product.revenue)}
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-gray-500 text-center py-10">Aucune vente enregistrée.</p>}
          </div>
        </div>

        {/* Top VIP Customers */}
        <div className="bg-white border border-[#e0ddd4] rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6 flex items-center gap-2"><Award size={18} className="text-purple-500"/> Top Clients (VIPs)</h2>
          <div className="space-y-4">
            {topCustomers.map((customer, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500 truncate w-32">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatMAD(customer.spent)}</p>
                  <p className="text-[10px] uppercase font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    {customer.count} Cmds
                  </p>
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && <p className="text-sm text-gray-500 text-center py-10">Aucun client enregistré.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, subtitle, bg }: { icon: React.ReactNode, title: string, value: string, subtitle: string, bg: string }) {
  return (
    <div className="bg-white border border-[#e0ddd4] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${bg}`}>
          {icon}
        </div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">{title}</p>
      </div>
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{value}</h3>
        <p className="text-[11px] font-medium text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
