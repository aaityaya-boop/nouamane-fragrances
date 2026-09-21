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
import { formatLastSeen, isUserOnline } from '@/lib/userStatus';

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
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
                NAY Chat Live
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Discussion d&apos;Équipe
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Messagerie d&apos;Équipe</h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-xs text-neutral-600 shadow-2xs">
          <Sparkles size={13} className="text-amber-500" />
          <span>Espace d&apos;échange en direct NAY Parfum</span>
        </div>
      </div>

      {/* CHAT MAIN CONTAINER */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col md:flex-row h-[75vh] min-h-[550px]">
        {/* ================= LEFT SIDEBAR (CHANNELS & CONTACTS) ================= */}
        <div className="w-full md:w-80 lg:w-88 border-r border-neutral-200 flex flex-col bg-neutral-50/50 shrink-0">
          {/* Sidebar Top: User status & Search */}
          <div className="p-3.5 border-b border-neutral-200 space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-2xs">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(currentUser?.name)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-neutral-900 leading-tight">
                    {currentUser?.name || 'Mon Profil'}
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    En ligne
                  </span>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Search size={13} />
              </div>
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Conversations List (Scrollable) */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {/* 1. Salons de groupe / Canaux */}
            <div className="p-2">
              <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-neutral-400 block mb-1">
                Salons & Canaux
              </span>

              <div className="space-y-1">
                {channels.map((chan) => {
                  const isActive = activeChatType === 'CHANNEL' && activeId === chan.id;
                  const getChannelIcon = (id: string) => {
                    if (id === 'STOCK') return <Package size={15} className={isActive ? 'text-white' : 'text-neutral-600'} />;
                    if (id === 'ORDERS') return <ShoppingBag size={15} className={isActive ? 'text-white' : 'text-neutral-600'} />;
                    return <Users size={15} className={isActive ? 'text-white' : 'text-neutral-600'} />;
                  };

                  return (
                    <div
                      key={chan.id}
                      onClick={() => {
                        setActiveChatType('CHANNEL');
                        setActiveId(chan.id);
                      }}
                      className={`p-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                          : 'hover:bg-neutral-100/80 text-neutral-800 border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/15 text-white' : 'bg-white border border-neutral-200'
                      }`}>
                        {getChannelIcon(chan.id)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                            {chan.name}
                          </h4>
                          {chan.lastMessage && (
                            <span className={`text-[10px] ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                              {formatMessageTime(chan.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] truncate ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {chan.lastMessage ? `${chan.lastMessage.senderName.split(' ')[0]}: ${chan.lastMessage.content}` : chan.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Messages Directs */}
            <div className="p-2">
              <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-neutral-400 block mb-1">
                Collaborateurs
              </span>

              <div className="space-y-1">
                {contacts
                  .filter((c) => !searchContact || c.name.toLowerCase().includes(searchContact.toLowerCase()))
                  .map((contact) => {
                    const isActive = activeChatType === 'DIRECT' && activeId === contact.id;
                    const statusInfo = formatLastSeen(contact.lastActivityAt, contact.lastLoginAt);

                    return (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setActiveChatType('DIRECT');
                          setActiveId(contact.id);
                        }}
                        className={`p-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer border ${
                          isActive
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                            : 'hover:bg-neutral-100/80 text-neutral-800 border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold overflow-hidden shadow-2xs ${
                            isActive ? 'bg-white/15 text-white' : 'bg-neutral-900 text-white'
                          }`}>
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{getInitials(contact.name)}</span>
                            )}
                          </div>
                          {/* Live Online / Offline Dot */}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ${
                              isActive ? 'ring-neutral-900' : 'ring-white'
                            } ${statusInfo.isOnline ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                            title={statusInfo.text}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                              {contact.name}
                            </h4>
                            {contact.lastMessage ? (
                              <span className={`text-[10px] ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                {formatMessageTime(contact.lastMessage.createdAt)}
                              </span>
                            ) : (
                              <span className={`text-[10px] ${isActive ? 'text-neutral-300' : statusInfo.statusColor}`}>
                                {statusInfo.isOnline ? 'En ligne' : ''}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-[11px] truncate ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                              {contact.lastMessage?.content || statusInfo.text}
                            </p>
                            {(contact.unreadCount || 0) > 0 && (
                              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
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
        <div className="flex-1 flex flex-col bg-neutral-50/30 relative">
          {/* Chat Window Top Bar */}
          <div className="p-3.5 bg-white border-b border-neutral-200 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-2xs">
                  {activeContact ? (
                    activeContact.avatar ? (
                      <img src={activeContact.avatar} alt={activeContact.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(activeContact.name)}</span>
                    )
                  ) : (
                    <Users size={16} />
                  )}
                </div>
                {activeContact && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      formatLastSeen(activeContact.lastActivityAt, activeContact.lastLoginAt).isOnline
                        ? 'bg-emerald-500'
                        : 'bg-neutral-300'
                    }`}
                  />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-xs text-neutral-900 leading-tight">
                  {activeContact ? activeContact.name : activeChannel?.name || 'Salon de discussion'}
                </h3>
                {activeContact ? (
                  (() => {
                    const status = formatLastSeen(activeContact.lastActivityAt, activeContact.lastLoginAt);
                    return (
                      <div className="flex items-center gap-1.5 text-[10px] leading-tight mt-0.5">
                        <span
                          className={`font-medium ${
                            status.isOnline ? 'text-emerald-600' : 'text-neutral-500'
                          }`}
                        >
                          {status.isOnline ? '● En ligne' : status.text}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-neutral-400">{activeContact.role}</span>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                    {activeChannel?.description || 'Discussion d\'équipe'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-400">
              <button
                onClick={() => fetchMessages(false)}
                className="p-1.5 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                title="Actualiser les messages"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3">
            {isLoadingMessages ? (
              <div className="py-24 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin text-neutral-900" />
                <span className="text-xs">Chargement...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-24 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <Sparkles size={18} />
                </div>
                <p className="text-xs font-semibold text-neutral-800">Aucun message pour l&apos;instant</p>
                <p className="text-[11px] text-neutral-400">Envoyez le premier message à l&apos;équipe.</p>
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
                      <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold overflow-hidden shrink-0 shadow-2xs mb-0.5">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(msg.senderName)}</span>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-md sm:max-w-lg p-3 rounded-xl shadow-2xs space-y-1 ${
                        isMe
                          ? 'bg-neutral-900 text-white rounded-br-xs'
                          : 'bg-white text-neutral-800 rounded-bl-xs border border-neutral-200'
                      }`}
                    >
                      {/* Sender Name in group */}
                      {!isMe && activeChatType === 'CHANNEL' && (
                        <span className="text-[10px] font-semibold text-neutral-900 block">
                          {msg.senderName}
                        </span>
                      )}

                      {/* Attachments (if any) */}
                      {parsedAttachments.length > 0 && (
                        <div className="space-y-1 pb-1">
                          {parsedAttachments.map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt="Attachment"
                              className="rounded-lg max-h-56 w-full object-cover"
                            />
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      {msg.content && (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}

                      {/* Message Footer: Time + Read Checkmarks */}
                      <div className={`flex items-center justify-end gap-1 text-[9px] pt-0.5 ${
                        isMe ? 'text-neutral-400' : 'text-neutral-400'
                      }`}>
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && (
                          <CheckCheck size={12} className={msg.isRead ? 'text-neutral-200' : 'text-neutral-500'} />
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
            <div className="p-2 bg-white border-t border-neutral-200 flex items-center gap-1.5 overflow-x-auto">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMessageInput((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1 hover:bg-neutral-100 rounded text-base transition-transform hover:scale-120 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Preview (if staged to send) */}
          {attachmentPreview && (
            <div className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2.5">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-200">
                <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setAttachmentPreview(null)}
                  className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-rose-600"
                >
                  <X size={11} />
                </button>
              </div>
              <span className="text-xs text-neutral-600 font-medium">Image prête à l&apos;envoi</span>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
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
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title="Ajouter un emoji"
            >
              <Smile size={18} />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAttachment}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer disabled:opacity-40"
              title="Joindre une photo"
            >
              {isUploadingAttachment ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
            </button>

            {/* Main Text Input */}
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900"
              />

              <button
                type="submit"
                disabled={(!messageInput.trim() && !attachmentPreview) || isSending}
                className="p-2 bg-neutral-900 hover:bg-black text-white rounded-lg transition-colors shadow-2xs disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
