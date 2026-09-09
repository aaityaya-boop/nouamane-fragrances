import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Clock, 
  Tag, 
  MessageSquare, 
  ArrowLeft,
  Crown,
  Diamond,
  Award,
  ExternalLink,
  Package,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { formatMAD } from '@/lib/products';
import { getUnifiedCustomers } from '@/lib/unifiedCustomers';

export const dynamic = 'force-dynamic';

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // 1. Try finding by raw Customer ID
  let customer = await prisma.customer.findUnique({
    where: { id: decodedId },
    include: {
      orders: { orderBy: { createdAt: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      tags: true
    }
  });

  // Extract phone/email candidates
  let cleanPhone = customer?.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
  let email = (customer?.email || '').toLowerCase().trim();

  // 2. If not found as a registered customer, search unified dataset
  if (!customer) {
    const unifiedList = await getUnifiedCustomers();
    const matched = unifiedList.find(u => 
      u.id === decodedId || 
      u.id === id || 
      (u.cleanPhone && decodedId.includes(u.cleanPhone)) ||
      (u.email && u.email.toLowerCase() === decodedId.toLowerCase())
    );

    if (matched) {
      cleanPhone = matched.cleanPhone;
      email = matched.email;
      
      // Look for orders matching this phone or email
      const matchedOrders = await prisma.order.findMany({
        where: {
          OR: [
            ...(cleanPhone ? [
              { customerPhone: { contains: cleanPhone.slice(-8) } }
            ] : []),
            ...(email ? [{ customerEmail: email }] : [])
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      customer = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        phone: matched.phone,
        address: matched.address,
        city: matched.city,
        postalCode: matched.postalCode,
        createdAt: matched.createdAt,
        updatedAt: matched.createdAt,
        orders: matchedOrders as any,
        notes: [],
        tags: []
      } as any;
    }
  } else {
    // Also attach any guest orders that share the same phone/email but had no customerId
    const additionalOrders = await prisma.order.findMany({
      where: {
        AND: [
          { customerId: null },
          {
            OR: [
              ...(cleanPhone ? [{ customerPhone: { contains: cleanPhone.slice(-8) } }] : []),
              ...(email ? [{ customerEmail: email }] : [])
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (additionalOrders.length > 0) {
      const orderIds = new Set(customer.orders.map(o => o.id));
      for (const ao of additionalOrders) {
        if (!orderIds.has(ao.id)) {
          customer.orders.push(ao as any);
        }
      }
      customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  if (!customer) {
    notFound();
  }

  const allOrders = customer.orders || [];
  const deliveredOrders = allOrders.filter((o: any) => o.status === 'delivered');
  const totalSpent = deliveredOrders.length > 0 
    ? deliveredOrders.reduce((sum: number, o: any) => sum + o.total, 0)
    : allOrders.reduce((sum: number, o: any) => sum + o.total, 0);

  const deliveredCount = deliveredOrders.length;
  const totalCount = allOrders.length;
  const aov = totalCount > 0 ? Math.round(totalSpent / totalCount) : 0;

  const lastOrder = allOrders.length > 0 ? allOrders[0] : null;
  const firstOrder = allOrders.length > 0 ? allOrders[allOrders.length - 1] : null;

  // VIP Tier calculation
  let tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD' = 'STANDARD';
  if (totalSpent >= 5000 || totalCount >= 5) {
    tier = 'DIAMOND';
  } else if (totalSpent >= 2500 || totalCount >= 3) {
    tier = 'GOLD';
  } else if (totalSpent >= 1000 || totalCount >= 2) {
    tier = 'SILVER';
  }

  const phoneRaw = customer.phone || lastOrder?.customerPhone || '';
  const phoneDigits = phoneRaw.replace(/[^0-9]/g, '');
  const formattedPhone = phoneDigits.startsWith('0')
    ? `212${phoneDigits.slice(1)}`
    : phoneDigits.startsWith('212')
      ? phoneDigits
      : phoneDigits ? `212${phoneDigits}` : '';

  const whatsappMsg = `Salam ${customer.name} ✨, c'est l'équipe NAY Parfum. Nous restons à votre entière disposition pour tout renseignement ou commande sur nos testeurs de grandes marques. N'hésitez pas !`;
  const whatsappUrl = formattedPhone.length >= 9 
    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMsg)}`
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/marketing/contacts" 
            className="text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 p-2.5 rounded-xl transition-colors shrink-0"
            title="Retour au Répertoire Contacts"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900">
                {customer.name}
              </h1>
              {tier !== 'STANDARD' && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  tier === 'DIAMOND' ? 'bg-[#0A0A0A] text-[#0ea5e9] border border-sky-500/40 shadow-sm' :
                  tier === 'GOLD' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                  'bg-neutral-100 text-neutral-800 border border-neutral-200'
                }`}>
                  {tier === 'DIAMOND' ? <Diamond size={13} className="text-[#0ea5e9]" /> :
                   tier === 'GOLD' ? <Crown size={13} className="text-[#0ea5e9]" /> :
                   <Award size={13} className="text-neutral-600" />}
                  <span>VIP {tier === 'DIAMOND' ? 'Diamant' : tier === 'GOLD' ? 'Or' : 'Argent'}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Client actif depuis le {new Date(customer.createdAt).toLocaleDateString('fr-FR')} • {allOrders.length} commande(s) enregistrée(s)
            </p>
          </div>
        </div>

        {/* WhatsApp & Call Direct Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <MessageSquare size={15} />
              <span>WhatsApp Direct</span>
            </a>
          )}
          {formattedPhone && (
            <a
              href={`tel:+${formattedPhone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors"
            >
              <Phone size={14} />
              <span>Appeler</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Contact & Metadata Card */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 pb-3 border-b border-neutral-100">
              <User size={16} className="text-[#0ea5e9]" /> Coordonnées & Livraison
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <Phone size={15} className="text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Téléphone</span>
                  {phoneRaw ? (
                    <span className="text-neutral-900 font-mono font-bold text-sm">{phoneRaw}</span>
                  ) : (
                    <span className="text-neutral-400 italic">Non renseigné</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={15} className="text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Email</span>
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="text-[#0ea5e9] hover:underline font-medium">
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-neutral-400 italic">Non renseigné</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Adresse de Livraison</span>
                  {customer.address || customer.city || lastOrder?.shippingCity ? (
                    <div className="text-neutral-800 font-medium leading-relaxed">
                      {customer.address || lastOrder?.shippingAddress || ''}
                      {(customer.address || lastOrder?.shippingAddress) && <br />}
                      <span className="font-bold text-neutral-900">
                        {customer.city || lastOrder?.shippingCity || ''} {customer.postalCode || lastOrder?.shippingPostalCode || ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400 italic">Aucune adresse enregistrée</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Concierge Template Box */}
          <div className="bg-[#0A0A0A] text-white border border-[#1e1e1e] rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-[#0ea5e9]">
              <Sparkles size={16} />
              <h4 className="font-bold text-xs uppercase tracking-wider">Conciergerie NAY</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Pour contacter ce client directement, un clic sur le bouton WhatsApp ouvrira la conversation avec un message chaleureux adapté à son statut.
            </p>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                <MessageSquare size={14} />
                <span>Ouvrir WhatsApp Concierge</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Key Stats & Order History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">CA Cumulé (LTV)</span>
              <div className="text-2xl font-black text-emerald-700 mt-2">{formatMAD(totalSpent)}</div>
              <span className="text-[11px] text-neutral-400 mt-1 block">{deliveredCount} livrée(s)</span>
            </div>

            <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Total Commandes</span>
              <div className="text-2xl font-black text-neutral-900 mt-2">{allOrders.length}</div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Historique global</span>
            </div>

            <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Panier Moyen (AOV)</span>
              <div className="text-2xl font-black text-[#0ea5e9] mt-2">{formatMAD(aov)}</div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Moyenne par achat</span>
            </div>
          </div>

          {/* Orders History Table */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-neutral-100 bg-neutral-50/60 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#0ea5e9]" /> Historique des Commandes ({allOrders.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">N° Commande</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Statut</th>
                    <th className="py-3 px-5 text-right">Montant (MAD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {allOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-neutral-400">
                        <ShoppingBag className="mx-auto text-neutral-300 mb-2" size={28} />
                        <p className="font-bold text-neutral-700">Aucune commande enregistrée pour ce contact.</p>
                      </td>
                    </tr>
                  ) : (
                    allOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-bold">
                          <Link 
                            href={`/admin/orders?search=${order.orderNumber}`} 
                            className="text-neutral-900 hover:text-[#0ea5e9] flex items-center gap-1"
                          >
                            <span>{order.orderNumber}</span>
                            <ExternalLink size={11} className="text-neutral-400" />
                          </Link>
                        </td>
                        <td className="py-3.5 px-5 text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {order.status === 'delivered' ? 'Livré' :
                             order.status === 'cancelled' ? 'Annulé' :
                             order.status === 'pending' ? 'En attente' :
                             order.status === 'processing' ? 'En cours' :
                             order.status === 'shipped' ? 'Expédié' : order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-sm font-black text-neutral-900 text-right">
                          {formatMAD(order.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Timeline Card */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-[#0ea5e9]" /> Chronologie & Parcours Client
            </h3>
            
            <div className="space-y-4 pl-4 border-l-2 border-neutral-100 text-xs">
              {lastOrder && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 bg-[#0ea5e9] w-2.5 h-2.5 rounded-full ring-4 ring-sky-100"></div>
                  <p className="font-bold text-neutral-900">Dernier Achat ({orderNumberBadge(lastOrder)})</p>
                  <p className="text-neutral-500 mt-0.5">{new Date(lastOrder.createdAt).toLocaleDateString('fr-FR')} • {formatMAD(lastOrder.total)}</p>
                </div>
              )}
              {firstOrder && firstOrder.id !== lastOrder?.id && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 bg-emerald-500 w-2.5 h-2.5 rounded-full ring-4 ring-emerald-100"></div>
                  <p className="font-bold text-neutral-900">Premier Achat ({orderNumberBadge(firstOrder)})</p>
                  <p className="text-neutral-500 mt-0.5">{new Date(firstOrder.createdAt).toLocaleDateString('fr-FR')} • {formatMAD(firstOrder.total)}</p>
                </div>
              )}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 bg-neutral-300 w-2.5 h-2.5 rounded-full ring-4 ring-neutral-100"></div>
                <p className="font-bold text-neutral-900">Premier Contact / Création Fiche</p>
                <p className="text-neutral-500 mt-0.5">{new Date(customer.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function orderNumberBadge(order: any) {
  return order.orderNumber || `#${order.id.slice(-6)}`;
}
