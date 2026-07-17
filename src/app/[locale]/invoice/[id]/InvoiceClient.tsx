'use client';

import React, { useEffect } from 'react';
import { formatMAD } from '@/lib/products';

export default function InvoiceClient({ order }: { order: any }) {
  useEffect(() => {
    // Automatically trigger print dialog when the page loads
    window.print();
  }, []);

  const items = JSON.parse(order.items || '[]');

  return (
    <div className="bg-white min-h-screen text-black p-8 font-sans max-w-4xl mx-auto">
      {/* Hide print button when printing */}
      <div className="mb-8 print:hidden flex justify-end">
        <button 
          onClick={() => window.print()}
          className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          Imprimer / Sauvegarder PDF
        </button>
      </div>

      <div className="border border-gray-200 p-10 rounded-xl shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-light tracking-widest uppercase mb-2">NAY</h1>
            <p className="text-gray-500 text-sm tracking-widest uppercase">Parfums de Luxe</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold mb-2">FACTURE</h2>
            <p className="text-gray-500 text-sm">N° {order.orderNumber}</p>
            <p className="text-gray-500 text-sm mt-1">Date : {new Date(order.createdAt).toLocaleDateString('fr-MA')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Émetteur</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold">NAY Parfums</p>
              <p>Fès, Maroc</p>
              <p>Contact : +212 5 35 63 42 18</p>
              <p>Email : contact@nouamane.ma</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Facturé à</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity} {order.shippingPostalCode ? `, ${order.shippingPostalCode}` : ''}</p>
              <p>{order.customerPhone}</p>
              <p>{order.customerEmail}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-left mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 text-xs font-bold tracking-wider uppercase text-gray-500">Désignation</th>
              <th className="py-3 text-xs font-bold tracking-wider uppercase text-gray-500 text-center">Qté</th>
              <th className="py-3 text-xs font-bold tracking-wider uppercase text-gray-500 text-right">Prix Unitaire</th>
              <th className="py-3 text-xs font-bold tracking-wider uppercase text-gray-500 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                <td className="py-4">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.size} {item.sku && `• Réf: ${item.sku}`}
                  </p>
                </td>
                <td className="py-4 text-sm text-center">{item.quantity}</td>
                <td className="py-4 text-sm text-right">{formatMAD(item.price)}</td>
                <td className="py-4 text-sm font-semibold text-right">{formatMAD(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total</span>
              <span>{formatMAD(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frais de livraison</span>
              <span>{formatMAD(order.shippingCost)}</span>
            </div>
            <div className="border-t border-gray-200 my-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">TOTAL À PAYER</span>
                <span className="text-xl font-bold">{formatMAD(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 space-y-2">
          <p>Méthode de paiement : {order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte bancaire'}</p>
          <p>Merci pour votre confiance. Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
        </div>
      </div>
    </div>
  );
}
