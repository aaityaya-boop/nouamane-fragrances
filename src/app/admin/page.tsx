import React from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  MapPin, 
  MousePointerClick, 
  ArrowRight, 
  ArrowUpRight, 
  LineChart, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Truck, 
  RotateCcw,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  CheckSquare,
  Archive,
  Compass,
  Zap,
  Globe2,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  Flame
} from 'lucide-react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import TrafficChart from './components/TrafficChart';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { hasPermission } from '@/lib/auth/rbac/accessControl';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const admin = await getAuthenticatedAdmin();
  const canViewRevenue = admin ? hasPermission(admin, 'finance.view_revenue') : false;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const productsCount = await prisma.product.count();

  // Metrics calculation
  const totalRevenue = orders.filter(o => o.status !== 'annule' && o.status !== 'refused' && o.status !== 'returned').reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Unique customers
  const uniqueEmails = new Set(orders.map(o => o.customerEmail));
  const totalCustomers = uniqueEmails.size;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'en-attente').length;
  const unconfirmedCount = orders.filter(o => o.status === 'unconfirmed').length;
  const processingCount = orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const returnedCount = orders.filter(o => o.status === 'refused' || o.status === 'returned').length;

  // Operational Performance Rates
  const confirmedCount = processingCount + shippedCount + deliveredCount;
  const tauxConfirmation = totalOrders > 0 ? ((confirmedCount / totalOrders) * 100).toFixed(1) : '0';
  const tauxNonConfirmation = totalOrders > 0 ? ((unconfirmedCount / totalOrders) * 100).toFixed(1) : '0';
  const tauxLivraison = totalOrders > 0 ? ((deliveredCount / totalOrders) * 100).toFixed(1) : '0';
  const tauxRetour = totalOrders > 0 ? ((returnedCount / totalOrders) * 100).toFixed(1) : '0';

  // Analytics : Visiteurs
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activeVisitorsCount = await prisma.visitor.count({
    where: { lastSeen: { gte: fiveMinutesAgo } }
  });

  const todayVisitorsCount = await prisma.visitor.count({
    where: { lastSeen: { gte: startOfDay } }
  });

  const recentPageViews = await prisma.pageView.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { visitor: true }
  });

  // Get Top Moroccan Cities
  const visitorsByCity = await prisma.visitor.groupBy({
    by: ['city'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
    where: { city: { not: null } }
  });

  // Format currency
  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  // 7-Day Chart Data
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pageViews7Days = await prisma.pageView.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, visitorId: true }
  });

  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    chartDataMap.set(dateStr, { name: dateStr, views: 0, visitors: new Set() });
  }

  pageViews7Days.forEach((pv: any) => {
    const dateStr = pv.createdAt.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    if (chartDataMap.has(dateStr)) {
      const data = chartDataMap.get(dateStr);
      data.views += 1;
      data.visitors.add(pv.visitorId);
    }
  });

  const chartData = Array.from(chartDataMap.values()).map(d => ({
    name: d.name,
    Vues: d.views,
    Visiteurs: d.visitors.size
  }));

  // Top Referrers
  const topReferrers = await prisma.pageView.groupBy({
    by: ['referrer'],
    _count: { id: true },
    where: { createdAt: { gte: sevenDaysAgo }, referrer: { not: null } },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  // Dynamic Greeting based on Morocco hour
  const currentHour = now.getHours();
  let greeting = 'Bonjour';
  let greetingIcon = '☀️';
  if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Bon après-midi';
    greetingIcon = '✨';
  } else if (currentHour >= 18 || currentHour < 5) {
    greeting = 'Bonsoir';
    greetingIcon = '🌙';
  }

  const adminFirstName = admin?.name ? admin.name.split(' ')[0] : 'Équipe NAY';

  // Format Moroccan Date
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1700px] mx-auto text-slate-900 space-y-8 animate-fadeIn">
      {/* 🌟 MOTIVATIONAL LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 md:p-9 shadow-xl border border-slate-700/50">
        {/* Subtle Ambient Lighting Overlay */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-10 top-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sky-200 text-xs font-semibold tracking-wide shadow-inner">
              <Sparkles size={13} className="text-amber-300 animate-spin-slow" />
              <span>Maison NAY Parfums • Atelier d&apos;Excellence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{greeting}, {adminFirstName}</span>
              <span className="text-2xl">{greetingIcon}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-light leading-relaxed">
              {canViewRevenue ? (
                <>Bienvenue sur votre centre de pilotage exécutif. Analysez la performance des ventes, la conversion et le rayonnement de la marque en temps réel.</>
              ) : (
                <>Votre espace opérationnel de confirmation et de satisfaction client. Offrez à chaque client une expérience luxueuse et personnalisée dès le premier contact.</>
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Clock size={13} className="text-sky-400" />
                <span className="capitalize">{dateFormatted}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-300 font-medium">Boutique & API Opérationnelles</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center">
            <Link 
              href="/admin/orders" 
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D9BF0] hover:bg-[#0284c7] text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall size={15} />
              <span>Confirmer ({pendingOrders + unconfirmedCount})</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link 
              href="/admin/tasks" 
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
            >
              <CheckSquare size={14} className="text-emerald-300" />
              <span>Missions & Tâches</span>
            </Link>

            <Link 
              href="/admin/chat" 
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
            >
              <MessageCircle size={14} className="text-sky-300" />
              <span>Live Chat</span>
            </Link>

            <Link 
              href="/" 
              target="_blank" 
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950/80 hover:bg-black text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-all duration-200"
            >
              <span>Vitrine</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* 📊 BENTO-GRID KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {canViewRevenue ? (
          <>
            <BentoKpiCard 
              icon={<DollarSign size={20} className="text-amber-500" />}
              iconBg="bg-amber-50 border-amber-100"
              label="Chiffre d'Affaires Net"
              value={formatMAD(totalRevenue)}
              subtitle={`Panier Moyen : ${formatMAD(averageOrderValue)}`}
              tag="Chiffre Net Confirmé"
              tagColor="bg-amber-50 text-amber-800 border-amber-200"
              gradient="hover:border-amber-300"
            />
            <BentoKpiCard 
              icon={<ShoppingBag size={20} className="text-sky-500" />}
              iconBg="bg-sky-50 border-sky-100"
              label="Total Commandes"
              value={totalOrders.toString()}
              subtitle={`${pendingOrders} en attente • ${processingCount} en prépa`}
              tag={`${confirmedCount} confirmées`}
              tagColor="bg-sky-50 text-sky-800 border-sky-200"
              gradient="hover:border-sky-300"
            />
            <BentoKpiCard 
              icon={<Users size={20} className="text-indigo-500" />}
              iconBg="bg-indigo-50 border-indigo-100"
              label="Visiteurs Aujourd'hui"
              value={todayVisitorsCount.toString()}
              subtitle={`${totalCustomers} clients uniques dans la base`}
              tag="Audience Maroc"
              tagColor="bg-indigo-50 text-indigo-800 border-indigo-200"
              gradient="hover:border-indigo-300"
            />
            <BentoKpiCard 
              icon={<Activity size={20} className="text-emerald-500" />}
              iconBg="bg-emerald-50 border-emerald-100"
              label="Visiteurs en Direct"
              value={activeVisitorsCount.toString()}
              subtitle="En navigation active sur la boutique"
              tag="Actifs Maintenant"
              tagColor="bg-emerald-50 text-emerald-800 border-emerald-200"
              isLive={true}
              gradient="hover:border-emerald-300"
            />
          </>
        ) : (
          <>
            <BentoKpiCard 
              icon={<CheckCircle2 size={20} className="text-emerald-500" />}
              iconBg="bg-emerald-50 border-emerald-100"
              label="Taux de Confirmation"
              value={`${tauxConfirmation}%`}
              subtitle={`${confirmedCount} commandes validées sur ${totalOrders}`}
              tag="Objectif > 80% 🎯"
              tagColor="bg-emerald-50 text-emerald-800 border-emerald-200"
              gradient="hover:border-emerald-300"
            />
            <BentoKpiCard 
              icon={<PhoneCall size={20} className="text-rose-500" />}
              iconBg="bg-rose-50 border-rose-100"
              label="Taux de Non-Confirmation"
              value={`${tauxNonConfirmation}%`}
              subtitle={`${unconfirmedCount} injoignables à relancer`}
              tag="Relances WhatsApp / Appels"
              tagColor="bg-rose-50 text-rose-800 border-rose-200"
              gradient="hover:border-rose-300"
            />
            <BentoKpiCard 
              icon={<Truck size={20} className="text-indigo-500" />}
              iconBg="bg-indigo-50 border-indigo-100"
              label="Taux de Livraison Réussie"
              value={`${tauxLivraison}%`}
              subtitle={`${deliveredCount} colis remis et encaissés`}
              tag="Efficacité Logistique"
              tagColor="bg-indigo-50 text-indigo-800 border-indigo-200"
              gradient="hover:border-indigo-300"
            />
            <BentoKpiCard 
              icon={<RotateCcw size={20} className="text-amber-500" />}
              iconBg="bg-amber-50 border-amber-100"
              label="Taux de Retour Atelier"
              value={`${tauxRetour}%`}
              subtitle={`${returnedCount} refus ou retours enregistrés`}
              tag="Qualité & Suivi"
              tagColor="bg-amber-50 text-amber-800 border-amber-200"
              gradient="hover:border-amber-300"
            />
          </>
        )}
      </div>

      {/* 🚀 OPERATIONAL FLOW SUMMARY BAR */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100/80 text-[#1D9BF0] flex items-center justify-center font-bold">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">Flux Opérationnel des Commandes</h3>
              <p className="text-[11px] text-slate-500">Répartition en temps réel des états du cycle de vie</p>
            </div>
          </div>

          {/* Flow Stepper Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Clock size={12} className="text-slate-400" />
              <span>En attente: <strong className="text-slate-900">{pendingOrders}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Phone size={12} className="text-amber-600" />
              <span>Non confirmées: <strong className="text-amber-900">{unconfirmedCount}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200">
              <Archive size={12} className="text-[#1D9BF0]" />
              <span>En prépa: <strong className="text-[#0369a1]">{processingCount}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Truck size={12} className="text-indigo-600" />
              <span>En route: <strong className="text-indigo-900">{shippedCount}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Livrées: <strong className="text-emerald-900">{deliveredCount}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <RotateCcw size={12} className="text-rose-600" />
              <span>Retours: <strong className="text-rose-900">{returnedCount}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* LEFT 2-COLUMNS: Recent Orders & Traffic Analytics */}
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          
          {/* RECENT ORDERS TABLE WITH 1-CLICK ACTIONS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1D9BF0] border border-sky-100 flex items-center justify-center font-bold">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Dernières Commandes Client</h2>
                  <p className="text-[11px] text-slate-500">Accès rapide aux coordonnées et statut en direct</p>
                </div>
              </div>
              <Link 
                href="/admin/orders" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D9BF0] hover:text-[#0284c7] hover:underline"
              >
                <span>Consulter toutes les commandes ({totalOrders})</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Client & Réf</th>
                    <th className="px-5 py-3">Ville & Contact</th>
                    <th className="px-5 py-3">{canViewRevenue ? 'Montant' : 'Articles'}</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Actions Rapides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 7).map((order) => {
                    const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
                    const waPhone = cleanPhone.startsWith('0') ? `212${cleanPhone.slice(1)}` : cleanPhone;
                    const waMessage = encodeURIComponent(`Bonjour ${order.customerName || ''}, nous vous contactons de la Maison NAY Parfums concernant votre commande ${order.orderNumber || ''}.`);
                    
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Client & Initials */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-100 to-indigo-100 text-[#1D9BF0] font-bold text-[11px] flex items-center justify-center border border-sky-200/60 shrink-0">
                              {(order.customerName || 'Client').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[150px]">
                                {order.customerName || 'Client NAY'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {order.orderNumber || order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* City & Phone */}
                        <td className="px-5 py-3.5 text-slate-600">
                          <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <MapPin size={12} className="text-[#1D9BF0] shrink-0" />
                            <span>{order.shippingCity || 'Casablanca'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {order.customerPhone || 'N/A'}
                          </div>
                        </td>

                        {/* Amount or items */}
                        <td className="px-5 py-3.5">
                          {canViewRevenue ? (
                            <div className="font-extrabold text-slate-900 text-[13px]">
                              {formatMAD(order.total)}
                            </div>
                          ) : (
                            <div className="text-slate-700 font-medium">
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-semibold">
                                <Package size={11} className="text-slate-500" />
                                {(() => {
                                  try {
                                    return JSON.parse(order.items || '[]').length || 1;
                                  } catch {
                                    return 1;
                                  }
                                })()} parfum(s)
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        {/* 1-Click Fast Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {order.customerPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=${waMessage}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Ouvrir WhatsApp Client"
                                className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200/80 flex items-center justify-center transition-all shadow-2xs"
                              >
                                <MessageCircle size={13} />
                              </a>
                            )}
                            {order.customerPhone && (
                              <a
                                href={`tel:${order.customerPhone}`}
                                title="Appeler le client"
                                className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 hover:bg-[#1D9BF0] hover:text-white border border-sky-200/80 flex items-center justify-center transition-all shadow-2xs"
                              >
                                <Phone size={13} />
                              </a>
                            )}
                            <Link
                              href="/admin/orders"
                              title="Gérer la commande"
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-2xs"
                            >
                              <ArrowRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        <ShoppingBag size={28} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">Aucune commande enregistrée pour le moment.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7-DAY TRAFFIC & VISITOR CHART */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                  <LineChart size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Affluence & Visites (7 derniers jours)</h2>
                  <p className="text-[11px] text-slate-500">Suivi de la fréquentation de la boutique en ligne</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                  Visiteurs uniques
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
                  Pages vues
                </span>
              </div>
            </div>

            <TrafficChart data={chartData} />
          </div>
        </div>

        {/* RIGHT 1-COLUMN: Moroccan Reach, Live Visitors & Traffic Sources */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* 🇲🇦 MOROCCAN REGIONAL PRESENCE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                  <Globe2 size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Rayonnement Régional Maroc</h2>
                  <p className="text-[10px] text-slate-500">Villes les plus actives sur NAY</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Maroc 🇲🇦
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {visitorsByCity.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">Aucune donnée géographique.</div>
              ) : (
                visitorsByCity.map((item, idx) => {
                  const maxCity = visitorsByCity[0]?._count.id || 1;
                  const pct = Math.min(100, Math.round((item._count.id / maxCity) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <MapPin size={11} className="text-[#1D9BF0]" />
                          {item.city || 'Casablanca'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-600">
                          {item._count.id} visites
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#1D9BF0] to-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ⚡ LIVE ACTIVITY STREAM */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/60 to-white">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-xs font-bold text-slate-900">Activité en Direct</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">Temps Réel</span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPageViews.length === 0 ? (
                <p className="px-5 py-6 text-slate-400 text-center text-xs">En attente de nouvelles visites...</p>
              ) : (
                recentPageViews.map((view: any) => (
                  <div key={view.id} className="p-3.5 hover:bg-slate-50/70 flex items-center justify-between text-xs transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 truncate">{view.pathname === '/' ? 'Accueil Boutique' : view.pathname}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                        <span>{view.visitor?.city || 'Maroc'}</span>
                        <span>•</span>
                        <span className="text-slate-400">{view.referrer ? view.referrer.replace('https://', '').replace('http://', '').slice(0, 20) : 'Accès Direct'}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
                      {new Date(view.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 🎯 TRAFFIC ACQUISITION SOURCES */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Compass size={14} className="text-[#1D9BF0]" />
              Sources d&apos;Acquisition (7j)
            </h2>
            <div className="space-y-2 text-xs">
              {topReferrers.length === 0 ? (
                <div className="text-slate-400 text-xs py-2 text-center">Aucune source externe enregistrée.</div>
              ) : (
                topReferrers.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium truncate max-w-[170px]">
                      {r.referrer ? r.referrer.replace('https://', '').replace('http://', '') : 'Accès Direct'}
                    </span>
                    <span className="font-mono text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {r._count.id} vues
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// 📦 Bento KPI Card Component
interface BentoKpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subtitle?: string;
  tag?: string;
  tagColor?: string;
  isLive?: boolean;
  gradient?: string;
}

function BentoKpiCard({ icon, iconBg, label, value, subtitle, tag, tagColor, isLive, gradient }: BentoKpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden group ${gradient || ''}`}>
      {/* Background glow on hover */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-slate-100/50 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        {isLive && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {value}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        {subtitle && (
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {subtitle}
          </p>
        )}
        {tag && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${tagColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

// 🏷️ Order Status Badge
function OrderStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    pending: { label: 'En attente', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
    unconfirmed: { label: 'Non confirmée', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    processing: { label: 'Confirmée / Prépa', bg: 'bg-sky-50', text: 'text-[#0284c7]', border: 'border-sky-200', dot: 'bg-[#1D9BF0]' },
    confirmed: { label: 'Confirmée', bg: 'bg-sky-50', text: 'text-[#0284c7]', border: 'border-sky-200', dot: 'bg-[#1D9BF0]' },
    shipped: { label: 'En livraison', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    delivered: { label: 'Livrée & Encaissée', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    refused: { label: 'Refusée', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    returned: { label: 'Retour Atelier', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
