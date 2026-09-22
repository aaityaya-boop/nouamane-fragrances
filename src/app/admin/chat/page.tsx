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
  Users, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  Plus, 
  X, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  UserPlus, 
  AtSign, 
  Hash, 
  DollarSign, 
  ArrowUpRight, 
  ChevronRight, 
  MoreVertical, 
  MapPin, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Lock,
  Tag
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatLastSeen, isUserOnline } from '@/lib/userStatus';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  jobTitle?: string | null;
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
  slug: string;
  dbId?: string;
  name: string;
  description: string;
  type: string;
  color?: string;
  isDefault?: boolean;
  memberIds?: string;
  members?: AdminUser[];
  memberCount?: number;
  lastMessage?: ChatMessage | null;
}

interface ProductMentionItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  brand: string;
  stock: number;
  image: string;
}

interface OrderMentionItem {
  id: string;
  orderNumber: string;
  customerName: string;
  shippingCity: string;
  total: number;
  status: string;
  createdAt: string;
}

const QUICK_EMOJIS = ['👍', '🔥', '✅', '❤️', '📦', '🚀', '⏳', '👏', '✨', '👌', '💎', '🎉'];

const GROUP_COLORS = [
  { id: 'sky', bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  { id: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { id: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  { id: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { id: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
];

export default function AdminTeamChatPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [contacts, setContacts] = useState<ConversationContact[]>([]);
  const [channels, setChannels] = useState<ConversationChannel[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<AdminUser[]>([]);
  const [activeChatType, setActiveChatType] = useState<'CHANNEL' | 'DIRECT'>('CHANNEL');
  const [activeId, setActiveId] = useState<string>('GENERAL'); // channel slug or contact ID

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group Creation & Management Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('sky');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Mentionables (Members, Products, Orders)
  const [allProducts, setAllProducts] = useState<ProductMentionItem[]>([]);
  const [allOrders, setAllOrders] = useState<OrderMentionItem[]>([]);
  const [mentionMenu, setMentionMenu] = useState<{
    type: 'MEMBER' | 'PRODUCT' | 'ORDER' | null;
    query: string;
  }>({ type: null, query: '' });

  // File Upload State
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations & Team
  const fetchConversations = useCallback(async () => {
    try {
      const [meRes, convsRes, mentionablesRes] = await Promise.all([
        fetch('/api/admin/auth/me'),
        fetch('/api/admin/chat/conversations'),
        fetch('/api/admin/chat/mentionables'),
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
          setAllTeamMembers(convsData.allTeamMembers || []);
        }
      }

      if (mentionablesRes.ok) {
        const mData = await mentionablesRes.json();
        if (mData.success) {
          setAllProducts(mData.products || []);
          setAllOrders(mData.orders || []);
        }
      }
    } catch (err) {
      console.error('Failed to load chat conversations:', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch Messages for Active Chat
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

  // Real-time Polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Input Changes & Mention Autocomplete Detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    // Detect triggers: @ for member, # for product, $ for order
    const lastAt = val.lastIndexOf('@');
    const lastHash = val.lastIndexOf('#');
    const lastDollar = val.lastIndexOf('$');

    if (lastAt !== -1 && lastAt >= val.length - 20) {
      const query = val.slice(lastAt + 1).toLowerCase();
      setMentionMenu({ type: 'MEMBER', query });
      return;
    }

    if (lastHash !== -1 && lastHash >= val.length - 20) {
      const query = val.slice(lastHash + 1).toLowerCase();
      setMentionMenu({ type: 'PRODUCT', query });
      return;
    }

    if (lastDollar !== -1 && lastDollar >= val.length - 20) {
      const query = val.slice(lastDollar + 1).toLowerCase();
      setMentionMenu({ type: 'ORDER', query });
      return;
    }

    setMentionMenu({ type: null, query: '' });
  };

  // Insert Member Mention
  const insertMemberMention = (member: AdminUser) => {
    const lastAt = messageInput.lastIndexOf('@');
    const prefix = lastAt !== -1 ? messageInput.slice(0, lastAt) : messageInput;
    const cleanName = member.name.replace(/\s+/g, '_');
    setMessageInput(`${prefix}@${cleanName} `);
    setMentionMenu({ type: null, query: '' });
    inputRef.current?.focus();
  };

  // Insert Product Mention Card Token
  const insertProductMention = (product: ProductMentionItem) => {
    const lastHash = messageInput.lastIndexOf('#');
    const prefix = lastHash !== -1 ? messageInput.slice(0, lastHash) : messageInput;
    const token = `#[product:${product.id}:${product.name}:${product.price}:${product.brand}:${product.slug}]`;
    setMessageInput(`${prefix}${token} `);
    setMentionMenu({ type: null, query: '' });
    inputRef.current?.focus();
  };

  // Insert Order Mention Token
  const insertOrderMention = (order: OrderMentionItem) => {
    const lastDollar = messageInput.lastIndexOf('$');
    const prefix = lastDollar !== -1 ? messageInput.slice(0, lastDollar) : messageInput;
    const token = `#[order:${order.id}:${order.orderNumber}:${order.customerName}:${order.total}:${order.status}]`;
    setMessageInput(`${prefix}${token} `);
    setMentionMenu({ type: null, query: '' });
    inputRef.current?.focus();
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !attachmentPreview) || isSending) return;

    const textToSend = messageInput.trim();
    const attachmentToSend = attachmentPreview;

    setMessageInput('');
    setAttachmentPreview(null);
    setShowEmojiPicker(false);
    setMentionMenu({ type: null, query: '' });

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'Moi',
      senderAvatar: currentUser?.avatar,
      recipientId: activeChatType === 'DIRECT' ? activeId : null,
      channel: activeChatType === 'DIRECT' ? 'DIRECT' : activeId,
      content: textToSend,
      attachments: attachmentToSend ? JSON.stringify([attachmentToSend]) : null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const res = await fetch('/api/admin/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToSend,
          channel: activeChatType === 'DIRECT' ? 'DIRECT' : activeId,
          recipientId: activeChatType === 'DIRECT' ? activeId : null,
          attachments: attachmentToSend ? [attachmentToSend] : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
          fetchConversations();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || isSavingGroup) return;

    setIsSavingGroup(true);
    try {
      const res = await fetch('/api/admin/chat/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          color: newGroupColor,
          memberIds: selectedMemberIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.group) {
          await fetchConversations();
          setActiveChatType('CHANNEL');
          setActiveId(data.group.slug);
          setShowCreateGroupModal(false);
          setNewGroupName('');
          setNewGroupDesc('');
          setSelectedMemberIds([]);
        }
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Update Group Members
  const handleUpdateGroupMembers = async () => {
    const currentChannel = channels.find(c => c.slug === activeId);
    if (!currentChannel || !currentChannel.dbId || isSavingGroup) return;

    setIsSavingGroup(true);
    try {
      const res = await fetch('/api/admin/chat/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentChannel.dbId,
          memberIds: selectedMemberIds,
        }),
      });

      if (res.ok) {
        await fetchConversations();
        setShowManageMembersModal(false);
      }
    } catch (err) {
      console.error('Failed to update group members:', err);
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (dbId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce groupe de discussion ?')) return;

    try {
      const res = await fetch(`/api/admin/chat/groups?id=${dbId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchConversations();
        setActiveChatType('CHANNEL');
        setActiveId('GENERAL');
        setShowManageMembersModal(false);
      }
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentPreview(event.target?.result as string);
      setIsUploadingAttachment(false);
    };
    reader.readAsDataURL(file);
  };

  // Active Chat Header Info
  const activeChannel = channels.find((c) => c.slug === activeId);
  const activeContact = contacts.find((c) => c.id === activeId);

  // Filtered Contacts
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.role.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col font-sans text-slate-900 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-fadeIn">
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── 1. LEFT SIDEBAR: GROUPS & MEMBERS ───────────────────────── */}
        <aside className="w-80 border-r border-slate-200/80 bg-slate-50/50 flex flex-col shrink-0">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200/70 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1D9BF0] border border-sky-100 flex items-center justify-center font-bold">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">NAY Chat Interne</h2>
                  <p className="text-[10px] text-slate-400">Collaborateurs & Salons</p>
                </div>
              </div>

              {/* Create Group Button */}
              <button
                onClick={() => {
                  setSelectedMemberIds(allTeamMembers.map(u => u.id));
                  setShowCreateGroupModal(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                title="Créer un nouveau groupe"
              >
                <Plus size={12} />
                <span>Groupe</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher collaborateur, canal..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]/30 focus:border-[#1D9BF0]"
              />
            </div>
          </div>

          {/* Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            
            {/* SALONS & GROUPES */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users size={11} /> Groupes & Salons ({channels.length})
                </span>
                <button
                  onClick={() => {
                    setSelectedMemberIds(allTeamMembers.map(u => u.id));
                    setShowCreateGroupModal(true);
                  }}
                  className="text-slate-400 hover:text-slate-900 p-0.5"
                  title="Ajouter un groupe"
                >
                  <Plus size={13} />
                </button>
              </div>

              {channels.map((channel) => {
                const isActive = activeChatType === 'CHANNEL' && activeId === channel.slug;
                return (
                  <button
                    key={channel.slug}
                    onClick={() => {
                      setActiveChatType('CHANNEL');
                      setActiveId(channel.slug);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'hover:bg-white text-slate-700 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {channel.name}
                        </p>
                        <p className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {channel.memberCount || channel.members?.length || 0} membres • {channel.description}
                        </p>
                      </div>
                    </div>

                    {!channel.isDefault && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      }`}>
                        Groupe
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* COLLABORATEURS (DIRECT MESSAGES) */}
            <div className="space-y-1 pt-2 border-t border-slate-200/60">
              <div className="px-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserPlus size={11} /> Collaborateurs ({filteredContacts.length})
                </span>
              </div>

              {filteredContacts.map((contact) => {
                const isActive = activeChatType === 'DIRECT' && activeId === contact.id;
                const online = isUserOnline(contact.lastActivityAt);

                return (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setActiveChatType('DIRECT');
                      setActiveId(contact.id);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'hover:bg-white text-slate-700 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-sky-100 text-[#0284c7]'
                        }`}>
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{contact.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 ${
                          isActive ? 'border-slate-900' : 'border-white'
                        } ${online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>

                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {contact.name}
                        </p>
                        <p className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {contact.jobTitle || contact.role}
                        </p>
                      </div>
                    </div>

                    {(contact.unreadCount || 0) > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#1D9BF0] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {contact.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </aside>

        {/* ── 2. MAIN CHAT ACTIVE WINDOW ─────────────────────────────── */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Top Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {activeChatType === 'CHANNEL' ? '#' : '@'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeChatType === 'CHANNEL' ? activeChannel?.name : activeContact?.name}
                  </h3>
                  {activeChatType === 'CHANNEL' && activeChannel?.memberCount && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {activeChannel.memberCount} membres
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {activeChatType === 'CHANNEL' 
                    ? activeChannel?.description 
                    : (isUserOnline(activeContact?.lastActivityAt) ? '🟢 En ligne' : formatLastSeen(activeContact?.lastActivityAt).text)}
                </p>
              </div>
            </div>

            {/* Actions / Member Manager Trigger */}
            <div className="flex items-center gap-2">
              {activeChatType === 'CHANNEL' && (
                <button
                  onClick={() => {
                    let currentMemberIds: string[] = [];
                    try {
                      currentMemberIds = JSON.parse(activeChannel?.memberIds || '[]');
                    } catch {
                      currentMemberIds = allTeamMembers.map(u => u.id);
                    }
                    setSelectedMemberIds(currentMemberIds);
                    setShowManageMembersModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Users size={13} />
                  <span>Membres du Groupe</span>
                </button>
              )}

              <button
                onClick={() => fetchMessages(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Actualiser"
              >
                <RefreshCw size={14} className={isLoadingMessages ? 'animate-spin text-[#1D9BF0]' : ''} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 custom-scrollbar">
            {isLoadingMessages && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                <RefreshCw size={16} className="animate-spin text-[#1D9BF0]" />
                <span>Chargement de la conversation...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <MessageSquare size={36} className="text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">Aucun message pour l&apos;instant</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Envoyez un message, mentionnez un collaborateur (@) ou un parfum (#) pour lancer l&apos;échange.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                let attachmentsArr: string[] = [];
                try {
                  if (msg.attachments) attachmentsArr = JSON.parse(msg.attachments);
                } catch {}

                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 overflow-hidden border border-slate-300">
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(msg.senderName || 'NA').slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-lg space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMe 
                          ? 'bg-[#0f172a] text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      }`}>
                        <RenderMessageContent content={msg.content} isMe={isMe} />

                        {/* Image Attachments */}
                        {attachmentsArr.length > 0 && (
                          <div className="mt-2.5 grid grid-cols-1 gap-2">
                            {attachmentsArr.map((url, i) => (
                              <div key={i} className="rounded-xl overflow-hidden border border-slate-200/80 max-h-60">
                                <img src={url} alt="Pièce jointe" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── 3. INPUT BAR & MENTION AUTOCOMPLETE OVERLAY ───────────── */}
          <div className="p-3 sm:p-4 border-t border-slate-200/90 bg-white relative">
            
            {/* Mention Autocomplete Floating Dropdown */}
            {mentionMenu.type && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-30 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>
                    {mentionMenu.type === 'MEMBER' && '👥 Mentionner un Collaborateur (@)'}
                    {mentionMenu.type === 'PRODUCT' && '💎 Mentionner un Parfum (#)'}
                    {mentionMenu.type === 'ORDER' && '📦 Mentionner une Commande ($)'}
                  </span>
                  <button onClick={() => setMentionMenu({ type: null, query: '' })} className="p-0.5 text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Member Suggestions */}
                  {mentionMenu.type === 'MEMBER' && (
                    allTeamMembers
                      .filter(m => m.name.toLowerCase().includes(mentionMenu.query))
                      .map(m => (
                        <button
                          key={m.id}
                          onClick={() => insertMemberMention(m)}
                          className="w-full p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-100 text-[#0284c7] font-bold text-xs flex items-center justify-center">
                              {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover rounded-full" /> : m.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">@{m.name}</p>
                              <p className="text-[10px] text-slate-400">{m.jobTitle || m.role}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Insérer</span>
                        </button>
                      ))
                  )}

                  {/* Product Suggestions */}
                  {mentionMenu.type === 'PRODUCT' && (
                    allProducts
                      .filter(p => p.name.toLowerCase().includes(mentionMenu.query) || p.brand.toLowerCase().includes(mentionMenu.query))
                      .slice(0, 10)
                      .map(p => (
                        <button
                          key={p.id}
                          onClick={() => insertProductMention(p)}
                          className="w-full p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-0.5 border border-slate-200">
                              {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" /> : <Package size={14} className="text-slate-400" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.brand} • <strong className="text-slate-700">{p.price} MAD</strong></p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#1D9BF0] bg-sky-50 px-2 py-0.5 rounded shrink-0">Fiche 1-Clic</span>
                        </button>
                      ))
                  )}

                  {/* Order Suggestions */}
                  {mentionMenu.type === 'ORDER' && (
                    allOrders
                      .filter(o => o.orderNumber.toLowerCase().includes(mentionMenu.query) || o.customerName.toLowerCase().includes(mentionMenu.query))
                      .slice(0, 8)
                      .map(o => (
                        <button
                          key={o.id}
                          onClick={() => insertOrderMention(o)}
                          className="w-full p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <p className="font-bold text-slate-900">#{o.orderNumber} • {o.customerName}</p>
                            <p className="text-[10px] text-slate-400">{o.shippingCity} • {o.total} MAD • Statut: {o.status}</p>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Lier</span>
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Quick Mentions / Attachment Toolbar */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setMentionMenu({ type: 'MEMBER', query: '' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all cursor-pointer"
              >
                <AtSign size={12} className="text-[#1D9BF0]" />
                <span>Membre</span>
              </button>

              <button
                type="button"
                onClick={() => setMentionMenu({ type: 'PRODUCT', query: '' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-semibold text-[11px] border border-sky-200/60 transition-all cursor-pointer"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span>Parfum (199)</span>
              </button>

              <button
                type="button"
                onClick={() => setMentionMenu({ type: 'ORDER', query: '' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200/60 transition-all cursor-pointer"
              >
                <ShoppingBag size={12} className="text-indigo-600" />
                <span>Commande</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-500 text-[11px] transition-all cursor-pointer"
              >
                <Smile size={13} />
                <span>Emoji</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-500 text-[11px] transition-all cursor-pointer"
              >
                <Paperclip size={13} />
                <span>Photo</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Quick Emojis Bar */}
            {showEmojiPicker && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-xl mb-2 border border-slate-200">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessageInput((prev) => prev + emoji);
                      inputRef.current?.focus();
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-sm transition-transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Attachment Preview Box */}
            {attachmentPreview && (
              <div className="relative inline-block mb-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <img src={attachmentPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                <button
                  onClick={() => setAttachmentPreview(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-sm cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Main Form Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  activeChatType === 'CHANNEL'
                    ? `Message dans #${activeChannel?.name || 'Canal'} (Tapez @ pour mentionner, # pour un parfum)...`
                    : `Message à ${activeContact?.name}...`
                }
                value={messageInput}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]/30 focus:border-[#1D9BF0] transition-all"
              />

              <button
                type="submit"
                disabled={(!messageInput.trim() && !attachmentPreview) || isSending}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={13} />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>

          </div>

        </main>

      </div>

      {/* ── 4. CREATE GROUP MODAL ────────────────────────────────────── */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1D9BF0] flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Créer un Nouveau Groupe / Salon</h3>
                  <p className="text-[11px] text-slate-500">Rassemblez les collaborateurs d&apos;un pôle</p>
                </div>
              </div>
              <button onClick={() => setShowCreateGroupModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Groupe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Équipe Confirmation & Appels, Logistique & Colis..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]/30 focus:border-[#1D9BF0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Objectif</label>
                <input
                  type="text"
                  placeholder="Ex: Suivi des appels de validation et gestion des refus"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]/30 focus:border-[#1D9BF0]"
                />
              </div>

              {/* Members Selection Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sélectionner les Collaborateurs Membres ({selectedMemberIds.length}/{allTeamMembers.length})
                </label>
                <div className="max-h-44 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 custom-scrollbar">
                  {allTeamMembers.map((member) => {
                    const isSelected = selectedMemberIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMemberIds(selectedMemberIds.filter(id => id !== member.id));
                          } else {
                            setSelectedMemberIds([...selectedMemberIds, member.id]);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50 border border-sky-200' : 'bg-white hover:bg-slate-100 border border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                            <p className="text-[10px] text-slate-400">{member.jobTitle || member.role}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#1D9BF0] text-white' : 'border border-slate-300'
                        }`}>
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim() || isSavingGroup}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                >
                  {isSavingGroup ? 'Création...' : 'Créer le Groupe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. MANAGE GROUP MEMBERS MODAL ──────────────────────────── */}
      {showManageMembersModal && activeChannel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Membres du groupe : #{activeChannel.name}</h3>
                <p className="text-[11px] text-slate-500">Ajouter ou retirer des collaborateurs de ce salon</p>
              </div>
              <button onClick={() => setShowManageMembersModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Collaborateurs Membres ({selectedMemberIds.length} actifs)
              </label>

              <div className="max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 custom-scrollbar">
                {allTeamMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMemberIds(selectedMemberIds.filter(id => id !== member.id));
                        } else {
                          setSelectedMemberIds([...selectedMemberIds, member.id]);
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-50 border border-sky-200' : 'bg-white hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-400">{member.jobTitle || member.role}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#1D9BF0] text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {!activeChannel.isDefault && activeChannel.dbId ? (
                <button
                  onClick={() => handleDeleteGroup(activeChannel.dbId!)}
                  className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Supprimer le groupe</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManageMembersModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleUpdateGroupMembers}
                  disabled={isSavingGroup}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                >
                  {isSavingGroup ? 'Enregistrement...' : 'Enregistrer les Membres'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── RICH MESSAGE CONTENT PARSER & RENDERER ──────────────────────────
function RenderMessageContent({ content, isMe }: { content: string; isMe: boolean }) {
  if (!content) return null;

  // Regex to match #[product:id:name:price:brand:slug] or #[order:id:number:client:total:status] or @MemberName
  const parts = [];
  const productRegex = /#\[product:(\d+):([^:]+):([^:]+):([^:]+):([^\]]+)\]/g;
  const orderRegex = /#\[order:([^:]+):([^:]+):([^:]+):([^:]+):([^\]]+)\]/g;
  const memberRegex = /@([a-zA-Z0-9_\u00C0-\u017F]+)/g;

  // Replace tokens with custom structures
  let lastIndex = 0;
  const rawText = content;

  // Render text with highlighted @mentions, products, orders
  const formattedElements: React.ReactNode[] = [];
  
  // Simple multi-token scanner
  const tokens = rawText.split(/(#\[product:[^\]]+\]|#\[order:[^\]]+\]|@[a-zA-Z0-9_\u00C0-\u017F]+)/g);

  return (
    <div className="space-y-2">
      <div className="whitespace-pre-wrap">
        {tokens.map((token, idx) => {
          if (token.startsWith('#[product:')) {
            const match = token.match(/#\[product:(\d+):([^:]+):([^:]+):([^:]+):([^\]]+)\]/);
            if (match) {
              const [, id, name, price, brand, slug] = match;
              return (
                <div key={idx} className="my-2 p-3 rounded-xl bg-white border border-sky-200 shadow-xs flex items-center justify-between gap-3 text-slate-900">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#1D9BF0] border border-sky-200 flex items-center justify-center font-bold shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{name}</p>
                      <p className="text-[10px] text-slate-400">{brand} • <strong className="text-slate-800">{price} MAD</strong></p>
                    </div>
                  </div>
                  <Link
                    href={`/products/${slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1D9BF0] hover:bg-[#0284c7] text-white font-bold text-[10px] shrink-0 shadow-2xs"
                  >
                    <span>Voir Fiche</span>
                    <ArrowUpRight size={11} />
                  </Link>
                </div>
              );
            }
          }

          if (token.startsWith('#[order:')) {
            const match = token.match(/#\[order:([^:]+):([^:]+):([^:]+):([^:]+):([^\]]+)\]/);
            if (match) {
              const [, id, number, client, total, status] = match;
              return (
                <div key={idx} className="my-2 p-3 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center justify-between gap-3 text-slate-900">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
                      <ShoppingBag size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">Commande #{number}</p>
                      <p className="text-[10px] text-slate-400">Client : {client} • <strong className="text-slate-800">{total} MAD</strong></p>
                    </div>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shrink-0 shadow-2xs"
                  >
                    <span>Gérer</span>
                    <ChevronRight size={11} />
                  </Link>
                </div>
              );
            }
          }

          if (token.startsWith('@')) {
            const clean = token.slice(1).replace(/_/g, ' ');
            return (
              <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold mx-0.5 ${
                isMe ? 'bg-sky-500/30 text-sky-200' : 'bg-sky-100 text-[#0284c7]'
              }`}>
                @{clean}
              </span>
            );
          }

          return <span key={idx}>{token}</span>;
        })}
      </div>
    </div>
  );
}
