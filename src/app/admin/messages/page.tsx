'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, Search, Archive } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchMessages();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Messages de Contact</h1>
          <p className="text-[#6B6B6B] text-[14px]">Gérez les demandes de vos clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des messages */}
        <div className="lg:col-span-1 bg-white border border-[#e0ddd4] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[700px]">
          <div className="p-4 border-b border-[#e0ddd4]">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl pl-10 pr-4 py-2 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-[#9A9A9A]" />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {loading ? (
              <div className="text-center py-8 text-[#9A9A9A] text-[13px]">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-[#9A9A9A] text-[13px]">Aucun message trouvé.</div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${selectedMessage?.id === msg.id ? 'bg-[#fafaf7] border border-[#e0ddd4]' : 'hover:bg-[#fafaf7] border border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[14px] font-semibold ${msg.status === 'unread' ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>{msg.name}</span>
                    <span className="text-[11px] text-[#9A9A9A]">{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="text-[13px] text-[#6B6B6B] line-clamp-1 mb-2">{msg.message}</div>
                  <div className="flex gap-2">
                    {msg.status === 'unread' && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Nouveau</span>}
                    {msg.status === 'read' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Lu</span>}
                    {msg.status === 'archived' && <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Archivé</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Détail du message */}
        <div className="lg:col-span-2 bg-white border border-[#e0ddd4] rounded-2xl shadow-sm h-[700px] flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-[#e0ddd4] flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">{selectedMessage.name}</h2>
                  <div className="flex flex-col gap-1 text-[13px] text-[#6B6B6B]">
                    <span>Email: <a href={`mailto:${selectedMessage.email}`} className="text-[#0ea5e9] hover:underline">{selectedMessage.email}</a></span>
                    {selectedMessage.phone && <span>Tél: {selectedMessage.phone}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedMessage.status === 'unread' && (
                    <button onClick={() => updateStatus(selectedMessage.id, 'read')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Marquer comme lu">
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {selectedMessage.status !== 'archived' && (
                    <button onClick={() => updateStatus(selectedMessage.id, 'archived')} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="Archiver">
                      <Archive size={18} />
                    </button>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <button onClick={() => updateStatus(selectedMessage.id, 'read')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Désarchiver">
                      <Clock size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="bg-[#fafaf7] p-6 rounded-xl text-[14px] leading-relaxed text-[#1A1A1A] whitespace-pre-wrap border border-[#e0ddd4]">
                  {selectedMessage.message}
                </div>
                <div className="mt-8">
                  <a href={`mailto:${selectedMessage.email}`} className="btn-blue inline-block px-6 py-3 rounded-xl text-[12px] font-bold tracking-[0.1em] uppercase">
                    Répondre par Email
                  </a>
                  {selectedMessage.phone && (
                    <a href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-4 inline-block px-6 py-3 border border-[#e0ddd4] text-[#1A1A1A] rounded-xl text-[12px] font-bold tracking-[0.1em] uppercase hover:bg-[#fafaf7]">
                      Contacter sur WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#9A9A9A]">
              <Mail size={48} className="mb-4 opacity-20" />
              <p className="text-[14px]">Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
