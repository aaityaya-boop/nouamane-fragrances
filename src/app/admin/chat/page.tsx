'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Check, 
  CheckCheck, 
  Clock, 
  Phone, 
  Video, 
  MoreVertical, 
  Image as ImageIcon, 
  Users, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  Flame, 
  Trash2, 
  RefreshCw, 
  X,
  Loader2,
  CheckCircle2,
  User
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  lastActivityAt?: string | null;
  lastLoginAt?: string | null;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  recipientId?: string | null;
  channel: string;
  content: string;
  attachments?: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
}

interface ConversationContact extends AdminUser {
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
}

interface ConversationChannel {
  id: string;
  name: string;
  description: string;
  type: string;
  lastMessage?: ChatMessage | null;
}

const QUICK_EMOJIS = ['👍', '🔥', '✅', '❤️', '📦', '🚀', '⏳', '👏', '✨', '👌'];

export default function AdminTeamChatPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [contacts, setContacts] = useState<ConversationContact[]>([]);
  const [channels, setChannels] = useState<ConversationChannel[]>([]);
  const [activeChatType, setActiveChatType] = useState<'CHANNEL' | 'DIRECT'>('CHANNEL');
  const [activeId, setActiveId] = useState<string>('GENERAL'); // channel ID or contact ID

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // File Upload State
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Current Admin & Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const [meRes, convsRes] = await Promise.all([
        fetch('/api/admin/auth/me'),
        fetch('/api/admin/chat/conversations'),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.success) setCurrentUser(meData.user);
      }

      if (convsRes.ok) {
        const convsData = await convsRes.json();
        if (convsData.success) {
          setContacts(convsData.contacts || []);
          setChannels(convsData.channels || []);
        }
      }
    } catch (err) {
      console.error('Failed to load chat conversations:', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch Messages for Active Chat
  const fetchMessages = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoadingMessages(true);
    try {
      const params = new URLSearchParams();
      if (activeChatType === 'DIRECT') {
        params.set('contactId', activeId);
      } else {
        params.set('channel', activeId);
      }

      const res = await fetch(`/api/admin/chat/messages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (!isSilent) setIsLoadingMessages(false);
    }
  }, [activeChatType, activeId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time Polling every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(true);
      fetchConversations();
    }, 3500);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !attachmentPreview) || isSending) return;

    const contentToSend = messageInput.trim();
    const attachmentToSend = attachmentPreview ? [attachmentPreview] : null;

    setMessageInput('');
    setAttachmentPreview(null);
    setIsSending(true);

    try {
      const payload: any = {
        content: contentToSend,
        channel: activeChatType === 'CHANNEL' ? activeId : 'DIRECT',
        recipientId: activeChatType === 'DIRECT' ? activeId : null,
        attachments: attachmentToSend,
      };

      const res = await fetch('/api/admin/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [...prev, data.message]);
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Attachment Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAttachmentPreview(data.url);
      }
    } catch (err) {
      console.error('Upload error in chat:', err);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const getInitials = (nameStr?: string | null) => {
    if (!nameStr) return 'NA';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const activeContact = activeChatType === 'DIRECT' ? contacts.find((c) => c.id === activeId) : null;
  const activeChannel = activeChatType === 'CHANNEL' ? channels.find((c) => c.id === activeId) : null;

  return (
    <div className="max-w-7xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-5 rounded-3xl shadow-xl mb-6 relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 ring-4 ring-white/10">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                NAY Chat Live
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Discussion Chiffrée & Directe
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">Messagerie d'Équipe</h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-300 backdrop-blur-sm">
          <Sparkles size={14} className="text-[#38bdf8]" />
          <span>Espace privé entre <strong>Ayoub</strong> et <strong>Nouamane</strong></span>
        </div>
      </div>

      {/* WHATSAPP MAIN CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col md:flex-row h-[78vh] min-h-[580px]">
        {/* ================= LEFT SIDEBAR (CHANNELS & CONTACTS) ================= */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0">
          {/* Sidebar Top: User status & Search */}
          <div className="p-4 border-b border-slate-200/80 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-xs">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(currentUser?.name)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-tight">
                    {currentUser?.name || 'Mon Profil'}
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    En ligne
                  </span>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
          </div>

          {/* Conversations List (Scrollable) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {/* 1. Salons de groupe / Canaux */}
            <div className="p-2">
              <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Salons & Canaux d'Équipe
              </span>

              <div className="space-y-1">
                {channels.map((chan) => {
                  const isActive = activeChatType === 'CHANNEL' && activeId === chan.id;
                  const getChannelIcon = (id: string) => {
                    if (id === 'STOCK') return <Package size={16} className="text-amber-500" />;
                    if (id === 'ORDERS') return <ShoppingBag size={16} className="text-emerald-500" />;
                    return <Users size={16} className="text-[#0ea5e9]" />;
                  };

                  return (
                    <div
                      key={chan.id}
                      onClick={() => {
                        setActiveChatType('CHANNEL');
                        setActiveId(chan.id);
                      }}
                      className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/20'
                          : 'hover:bg-slate-200/60 text-slate-800'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white border border-slate-200'
                      }`}>
                        {getChannelIcon(chan.id)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                            {chan.name}
                          </h4>
                          {chan.lastMessage && (
                            <span className={`text-[10px] ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                              {formatMessageTime(chan.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] truncate ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                          {chan.lastMessage ? `${chan.lastMessage.senderName.split(' ')[0]}: ${chan.lastMessage.content}` : chan.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Messages Directs (Ayoub / Nouamane) */}
            <div className="p-2">
              <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Discussions Directes
              </span>

              <div className="space-y-1">
                {contacts
                  .filter((c) => !searchContact || c.name.toLowerCase().includes(searchContact.toLowerCase()))
                  .map((contact) => {
                    const isActive = activeChatType === 'DIRECT' && activeId === contact.id;

                    return (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setActiveChatType('DIRECT');
                          setActiveId(contact.id);
                        }}
                        className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/20'
                            : 'hover:bg-slate-200/60 text-slate-800'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold overflow-hidden shadow-xs ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white'
                          }`}>
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{getInitials(contact.name)}</span>
                            )}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                              {contact.name}
                            </h4>
                            {contact.lastMessage && (
                              <span className={`text-[10px] ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                                {formatMessageTime(contact.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-[11px] truncate ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                              {contact.lastMessage?.content || 'Cliquez pour discuter'}
                            </p>
                            {(contact.unreadCount || 0) > 0 && (
                              <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT MAIN CHAT AREA ================= */}
        <div className="flex-1 flex flex-col bg-[#efeae2]/40 relative">
          {/* Chat Window Top Bar */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm">
                {activeContact ? (
                  activeContact.avatar ? (
                    <img src={activeContact.avatar} alt={activeContact.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(activeContact.name)}</span>
                  )
                ) : (
                  <Users size={18} />
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  {activeContact ? activeContact.name : activeChannel?.name || 'Salon de discussion'}
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {activeContact ? 'Propriétaire NAY • En ligne' : activeChannel?.description || 'Discussion'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <button
                onClick={() => fetchMessages(false)}
                className="p-2 hover:text-[#0ea5e9] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Actualiser les messages"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div 
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar"
            style={{
              backgroundImage: `radial-gradient(#0ea5e910 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {isLoadingMessages ? (
              <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-[#0ea5e9]" />
                <span className="text-xs">Chargement de la discussion...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0ea5e9]">
                  <Sparkles size={24} />
                </div>
                <p className="text-xs font-semibold text-slate-700">Aucun message pour l'instant</p>
                <p className="text-[11px] text-slate-400">Soyez le premier à envoyer un message !</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                let parsedAttachments: string[] = [];
                try {
                  if (msg.attachments) parsedAttachments = JSON.parse(msg.attachments);
                } catch (e) {}

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Left avatar for other person */}
                    {!isMe && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 shadow-xs mb-1">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(msg.senderName)}</span>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-md sm:max-w-lg p-3 sm:p-3.5 rounded-2xl shadow-sm space-y-1 ${
                        isMe
                          ? 'bg-[#0ea5e9] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/60'
                      }`}
                    >
                      {/* Sender Name in group */}
                      {!isMe && activeChatType === 'CHANNEL' && (
                        <span className="text-[11px] font-bold text-[#0ea5e9] block">
                          {msg.senderName}
                        </span>
                      )}

                      {/* Attachments (if any) */}
                      {parsedAttachments.length > 0 && (
                        <div className="space-y-1.5 pb-1">
                          {parsedAttachments.map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt="Attachment"
                              className="rounded-xl max-h-60 w-full object-cover shadow-xs"
                            />
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      {msg.content && (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}

                      {/* Message Footer: Time + Read Checkmarks */}
                      <div className={`flex items-center justify-end gap-1 text-[10px] pt-0.5 ${
                        isMe ? 'text-sky-100' : 'text-slate-400'
                      }`}>
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && (
                          <CheckCheck size={13} className={msg.isRead ? 'text-white' : 'text-sky-200'} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Emoji Toolbar */}
          {showEmojiPicker && (
            <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto custom-scrollbar animate-in slide-in-from-bottom-2">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMessageInput((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-base transition-transform hover:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Preview (if staged to send) */}
          {attachmentPreview && (
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setAttachmentPreview(null)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="text-xs text-slate-600 font-medium">Image prête à l'envoi</span>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Ajouter un emoji"
            >
              <Smile size={20} />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAttachment}
              className="p-2 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              title="Joindre une photo"
            >
              {isUploadingAttachment ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </button>

            {/* Main Text Input */}
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Écrire un message pour Ayoub / Nouamane..."
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
              />

              <button
                type="submit"
                disabled={(!messageInput.trim() && !attachmentPreview) || isSending}
                className="p-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-2xl transition-all shadow-md shadow-sky-500/20 disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
