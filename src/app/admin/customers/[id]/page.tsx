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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <Link 
            href="/admin/marketing/contacts" 
            className="text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg transition-colors shrink-0"
            title="Retour au Répertoire Contacts"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {customer.name}
              </h1>
              {tier !== 'STANDARD' && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                  tier === 'DIAMOND' ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs' :
                  tier === 'GOLD' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}>
                  {tier === 'DIAMOND' ? <Diamond size={12} className="text-amber-400" /> :
                   tier === 'GOLD' ? <Crown size={12} className="text-amber-600" /> :
                   <Award size={12} className="text-neutral-500" />}
                  <span>VIP {tier === 'DIAMOND' ? 'Diamant' : tier === 'GOLD' ? 'Or' : 'Argent'}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Client actif depuis le {new Date(customer.createdAt).toLocaleDateString('fr-FR')} • {allOrders.length} commande(s)
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition-all active:scale-95"
            >
              <MessageSquare size={13} />
              <span>WhatsApp Direct</span>
            </a>
          )}
          {formattedPhone && (
            <a
              href={`tel:+${formattedPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium text-xs shadow-2xs transition-colors"
            >
              <Phone size={13} />
              <span>Appeler</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Contact & Metadata Card */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-neutral-100">
              <User size={14} className="text-neutral-500" /> Coordonnées & Livraison
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Téléphone</span>
                  {phoneRaw ? (
                    <span className="text-neutral-900 font-mono font-semibold text-xs">{phoneRaw}</span>
                  ) : (
                    <span className="text-neutral-400 italic">Non renseigné</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Email</span>
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="text-neutral-800 hover:underline font-medium">
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-neutral-400 italic">Non renseigné</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Adresse de Livraison</span>
                  {customer.address || customer.city || lastOrder?.shippingCity ? (
                    <div className="text-neutral-800 font-medium leading-relaxed">
                      {customer.address || lastOrder?.shippingAddress || ''}
                      {(customer.address || lastOrder?.shippingAddress) && <br />}
                      <span className="font-semibold text-neutral-900">
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
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-neutral-900">
              <Sparkles size={14} className="text-neutral-500" />
              <h4 className="font-semibold text-xs uppercase tracking-wider">Conciergerie NAY</h4>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Pour contacter ce client directement, un clic sur le bouton WhatsApp ouvrira la conversation avec un message personnalisé adapté à son statut.
            </p>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition-all mt-1"
              >
                <MessageSquare size={13} />
                <span>Ouvrir WhatsApp Concierge</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Key Stats & Order History */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">CA Cumulé (LTV)</span>
              <div className="text-xl font-bold tracking-tight text-neutral-900 mt-1">{formatMAD(totalSpent)}</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">{deliveredCount} livrée(s)</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Total Commandes</span>
              <div className="text-xl font-bold tracking-tight text-neutral-900 mt-1">{allOrders.length}</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Historique global</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Panier Moyen (AOV)</span>
              <div className="text-xl font-bold tracking-tight text-neutral-900 mt-1">{formatMAD(aov)}</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Moyenne par achat</span>
            </div>
          </div>

          {/* Orders History Table */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="border-b border-neutral-100 bg-neutral-50/70 px-4 sm:px-5 py-3 flex justify-between items-center">
              <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-neutral-500" /> Historique des Commandes ({allOrders.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-200 text-neutral-600 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4 sm:px-5">N° Commande</th>
                    <th className="py-2.5 px-4 sm:px-5">Date</th>
                    <th className="py-2.5 px-4 sm:px-5">Statut</th>
                    <th className="py-2.5 px-4 sm:px-5 text-right">Montant (MAD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {allOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-neutral-400">
                        <ShoppingBag className="mx-auto text-neutral-300 mb-2" size={24} />
                        <p className="font-semibold text-neutral-700">Aucune commande enregistrée pour ce contact.</p>
                      </td>
                    </tr>
                  ) : (
                    allOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 px-4 sm:px-5 font-medium">
                          <Link 
                            href={`/admin/orders?search=${order.orderNumber}`} 
                            className="text-neutral-900 hover:text-neutral-600 inline-flex items-center gap-1"
                          >
                            <span>{order.orderNumber}</span>
                            <ExternalLink size={11} className="text-neutral-400" />
                          </Link>
                        </td>
                        <td className="py-3 px-4 sm:px-5 text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 sm:px-5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase border ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {order.status === 'delivered' ? 'Livré' :
                             order.status === 'cancelled' ? 'Annulé' :
                             order.status === 'pending' ? 'En attente' :
                             order.status === 'processing' ? 'En cours' :
                             order.status === 'shipped' ? 'Expédié' : order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:px-5 text-xs font-bold text-neutral-900 text-right">
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
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs p-4 sm:p-5 space-y-3">
            <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-neutral-500" /> Chronologie & Parcours Client
            </h3>
            
            <div className="space-y-3.5 pl-3.5 border-l border-neutral-200 text-xs">
              {lastOrder && (
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 bg-neutral-900 w-2 h-2 rounded-full"></div>
                  <p className="font-semibold text-neutral-900">Dernier Achat ({orderNumberBadge(lastOrder)})</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">{new Date(lastOrder.createdAt).toLocaleDateString('fr-FR')} • {formatMAD(lastOrder.total)}</p>
                </div>
              )}
              {firstOrder && firstOrder.id !== lastOrder?.id && (
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 bg-emerald-600 w-2 h-2 rounded-full"></div>
                  <p className="font-semibold text-neutral-900">Premier Achat ({orderNumberBadge(firstOrder)})</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">{new Date(firstOrder.createdAt).toLocaleDateString('fr-FR')} • {formatMAD(firstOrder.total)}</p>
                </div>
              )}
              <div className="relative">
                <div className="absolute -left-[19px] top-1 bg-neutral-400 w-2 h-2 rounded-full"></div>
                <p className="font-semibold text-neutral-900">Premier Contact / Création Fiche</p>
                <p className="text-neutral-500 text-[11px] mt-0.5">{new Date(customer.createdAt).toLocaleDateString('fr-FR')}</p>
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
