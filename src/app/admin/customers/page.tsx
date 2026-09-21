import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, TrendingUp, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const query = sp?.q || '';
  const page = parseInt(sp?.page || '1');
  const filter = sp?.filter || 'all';
  const take = 20;
  const skip = (page - 1) * take;

  // KPIs Aggregation
  const totalCustomers = await prisma.customer.count();
  const allCustomersWithOrders = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' } } } // count delivered orders for revenue
  });

  let newCustomersCount = 0;
  let returningCustomersCount = 0;
  let totalRevenue = 0;
  let totalDeliveredOrders = 0;

  const processedCustomers = allCustomersWithOrders.map(c => {
    const deliveredOrders = c.orders;
    const spent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = deliveredOrders.length;
    
    if (orderCount === 1) newCustomersCount++;
    if (orderCount > 1) returningCustomersCount++;
    
    totalRevenue += spent;
    totalDeliveredOrders += orderCount;

    return { ...c, spent, orderCount };
  });

  const aov = totalDeliveredOrders > 0 ? (totalRevenue / totalDeliveredOrders).toFixed(2) : 0;
  const cltv = allCustomersWithOrders.length > 0 ? (totalRevenue / allCustomersWithOrders.length).toFixed(2) : 0;

  // Search & Filter Query
  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } }
    ];
  }

  // Fetch paginated list
  const customersList = await prisma.customer.findMany({
    where: whereClause,
    include: { orders: { orderBy: { createdAt: 'desc' } } },
    take,
    skip,
    orderBy: { createdAt: 'desc' }
  });

  const totalFiltered = await prisma.customer.count({ where: whereClause });
  const totalPages = Math.ceil(totalFiltered / take);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Clients & CRM</h1>
          <p className="text-[13px] text-neutral-500 mt-1">Gérez vos relations clients, suivez la valeur vie et segmentez vos audiences ({totalCustomers} clients).</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Total Clients</span>
            <Users size={15} className="text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{totalCustomers}</div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Clients Fidèles</span>
            <UserCheck size={15} className="text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{returningCustomersCount}</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Chiffre d'Affaires</span>
            <TrendingUp size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-neutral-500">MAD</span></div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Valeur Moyenne (LTV)</span>
            <span className="text-[10px] font-semibold bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">MOY</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{Number(cltv).toLocaleString()} <span className="text-sm font-normal text-neutral-500">MAD</span></div>
          <p className="text-[11px] text-neutral-400 mt-1">Panier moyen (AOV) : {Number(aov).toLocaleString()} MAD</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form method="GET" className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
          <input 
            type="text" 
            name="q"
            placeholder="Rechercher par nom, email, téléphone..." 
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
            defaultValue={query}
          />
        </form>
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Link href="?filter=all" className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Tous</Link>
          <Link href="?filter=new" className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'new' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Nouveaux</Link>
          <Link href="?filter=returning" className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'returning' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Fidèles</Link>
          <Link href="/admin/customers/vip" className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200">⭐ Top VIP</Link>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Commandes</th>
                <th className="px-5 py-3">Total Dépensé</th>
                <th className="px-5 py-3">Dernière Commande</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {customersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-400 text-xs">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                customersList.map((customer) => {
                  const orders = customer.orders;
                  const deliveredOrders = orders.filter(o => o.status === 'delivered');
                  const spent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
                  const lastOrder = orders.length > 0 ? orders[0] : null;
                  
                  let statusLabel = 'NOUVEAU';
                  let statusClass = 'bg-sky-50 text-sky-700 border-sky-200';
                  if (orders.length === 0) {
                    statusLabel = 'SANS ACHAT';
                    statusClass = 'bg-neutral-100 text-neutral-700 border-neutral-200';
                  } else if (deliveredOrders.length > 1) {
                    statusLabel = 'FIDÈLE';
                    statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (lastOrder && (new Date().getTime() - new Date(lastOrder.createdAt).getTime()) > 90 * 24 * 3600 * 1000) {
                    statusLabel = 'INACTIF';
                    statusClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <tr key={customer.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900">{customer.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400">ID: {customer.id.slice(-6)}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-neutral-900 text-xs">{customer.email}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{customer.phone || 'Sans tél'}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">
                        {orders.length}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-neutral-900">
                        {spent.toLocaleString()} <span className="text-xs font-normal text-neutral-500">MAD</span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 text-xs">
                        {lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString('fr-MA') : 'Jamais'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/customers/${customer.id}`} className="text-neutral-900 hover:underline text-xs font-semibold">
                          Voir Profil
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Page {page} sur {totalPages}</span>
            <div className="flex gap-1.5">
              {page > 1 && (
                <Link href={`?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-2.5 py-1 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">Précédent</Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-2.5 py-1 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">Suivant</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
