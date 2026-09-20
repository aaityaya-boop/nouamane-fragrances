'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ALL_ROLES, 
  ROLE_DEPARTMENTS, 
  getRoleDefinition, 
  RoleDefinition 
} from '@/lib/auth/rbac/roles';
import { 
  ALL_PERMISSIONS, 
  PERMISSION_MODULES, 
  PermissionModule, 
  PermissionDefinition 
} from '@/lib/auth/rbac/permissions';
import { parseCustomPermissions } from '@/lib/auth/rbac/accessControl';
import AdminAccessDenied from '@/components/AdminAccessDenied';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Key, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  X, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Activity, 
  CheckSquare, 
  Calendar,
  AlertCircle,
  Clock,
  Layers,
  Power
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle?: string | null;
  phone?: string | null;
  status: string;
  avatar?: string | null;
  customPermissions?: string | null;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  createdAt: string;
  roleDefinition: RoleDefinition;
  effectivePermissionsCount: number;
  isOnline: boolean;
  _count?: {
    assignedTasks: number;
    createdTasks: number;
    activities: number;
  };
}

interface CurrentAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner?: boolean;
  effectivePermissions?: string[];
}

function TeamManagementContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const openNewParam = searchParams.get('openNew');

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0, online: 0 });
  const [currentUser, setCurrentUser] = useState<CurrentAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(openNewParam === 'true');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsDrawerOpen, setIsPermissionsDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // New Member Form
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRoleParam || 'CUSTOMER_SUPPORT_AGENT',
    jobTitle: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  });
  const [newMemberLoading, setNewMemberLoading] = useState(false);
  const [newMemberError, setNewMemberError] = useState('');

  // Edit Member Form
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    role: '',
    jobTitle: '',
    phone: '',
    avatar: '',
    newPassword: '',
    status: 'ACTIVE',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Granular Permissions State for Drawer
  const [activeModuleTab, setActiveModuleTab] = useState<PermissionModule>('dashboard');
  const [permissionOverrides, setPermissionOverrides] = useState<{ granted: string[]; revoked: string[] }>({
    granted: [],
    revoked: [],
  });
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Current Admin & Members
  const loadData = async () => {
    try {
      setLoading(true);
      const [authRes, teamRes] = await Promise.all([
        fetch('/api/admin/auth/me'),
        fetch('/api/admin/team'),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.success) {
          setCurrentUser(authData.user);
        }
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (teamData.success) {
          setMembers(teamData.members || []);
          setStats(teamData.stats || { total: 0, active: 0, disabled: 0, online: 0 });
        }
      }
    } catch (err) {
      console.error('Error loading team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        (member.jobTitle && member.jobTitle.toLowerCase().includes(q)) ||
        member.role.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  // Open Edit Modal
  const handleOpenEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditMemberForm({
      name: member.name,
      role: member.role,
      jobTitle: member.jobTitle || '',
      phone: member.phone || '',
      avatar: member.avatar || '',
      newPassword: '',
      status: member.status,
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Member
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      setEditLoading(true);
      setEditError('');

      const payload: any = {
        name: editMemberForm.name,
        role: editMemberForm.role,
        jobTitle: editMemberForm.jobTitle,
        phone: editMemberForm.phone,
        avatar: editMemberForm.avatar,
        status: editMemberForm.status,
      };

      if (editMemberForm.newPassword) {
        payload.newPassword = editMemberForm.newPassword;
      }

      const res = await fetch(`/api/admin/team/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Erreur lors de la mise à jour');
        return;
      }

      showToast(`Profil de "${editMemberForm.name}" mis à jour avec succès.`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      setEditError(err.message || 'Erreur réseau');
    } finally {
      setEditLoading(false);
    }
  };

  // Submit Create Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setNewMemberLoading(true);
      setNewMemberError('');

      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemberForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setNewMemberError(data.error || 'Erreur lors de la création du compte');
        return;
      }

      showToast(`Compte créé avec succès pour ${newMemberForm.name} !`);
      setIsNewMemberModalOpen(false);
      setNewMemberForm({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER_SUPPORT_AGENT',
        jobTitle: '',
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      });
      loadData();
    } catch (err: any) {
      setNewMemberError(err.message || 'Erreur réseau');
    } finally {
      setNewMemberLoading(false);
    }
  };

  // Open Granular Permissions Drawer
  const handleOpenPermissionsDrawer = (member: TeamMember) => {
    setSelectedMember(member);
    const parsed = parseCustomPermissions(member.customPermissions);
    setPermissionOverrides({
      granted: parsed.granted || [],
      revoked: parsed.revoked || [],
    });
    setIsPermissionsDrawerOpen(true);
  };

  // Toggle Single Permission in Drawer
  const handleTogglePermission = (permKey: string, isRoleDefault: boolean) => {
    if (!selectedMember) return;
    const isCurrentlyGranted = permissionOverrides.granted.includes(permKey);
    const isCurrentlyRevoked = permissionOverrides.revoked.includes(permKey);

    // Current effective state
    const isEffectivelyActive = isRoleDefault ? !isCurrentlyRevoked : isCurrentlyGranted;

    if (isEffectivelyActive) {
      // Deactivate it
      if (isRoleDefault) {
        // Mark as revoked
        setPermissionOverrides({
          granted: permissionOverrides.granted.filter((k) => k !== permKey),
          revoked: Array.from(new Set([...permissionOverrides.revoked, permKey])),
        });
      } else {
        // Remove from granted
        setPermissionOverrides({
          ...permissionOverrides,
          granted: permissionOverrides.granted.filter((k) => k !== permKey),
        });
      }
    } else {
      // Activate it
      if (isRoleDefault) {
        // Remove from revoked
        setPermissionOverrides({
          ...permissionOverrides,
          revoked: permissionOverrides.revoked.filter((k) => k !== permKey),
        });
      } else {
        // Add to granted
        setPermissionOverrides({
          revoked: permissionOverrides.revoked.filter((k) => k !== permKey),
          granted: Array.from(new Set([...permissionOverrides.granted, permKey])),
        });
      }
    }
  };

  // Reset Permissions to Role Defaults
  const handleResetToRoleDefaults = async () => {
    if (!selectedMember) return;
    try {
      setSavingPermissions(true);
      const res = await fetch(`/api/admin/team/${selectedMember.id}/reset-permissions`, {
        method: 'POST',
      });
      if (res.ok) {
        setPermissionOverrides({ granted: [], revoked: [] });
        showToast('Permissions réinitialisées aux valeurs par défaut du rôle.');
        loadData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setSavingPermissions(false);
    }
  };

  // Save Custom Permissions
  const handleSavePermissions = async () => {
    if (!selectedMember) return;
    try {
      setSavingPermissions(true);
      const hasOverrides =
        permissionOverrides.granted.length > 0 || permissionOverrides.revoked.length > 0;

      const res = await fetch(`/api/admin/team/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPermissions: hasOverrides ? permissionOverrides : null,
        }),
      });

      if (res.ok) {
        showToast(`Permissions granulaires enregistrées pour ${selectedMember.name}`);
        setIsPermissionsDrawerOpen(false);
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Erreur lors de la sauvegarde des permissions');
      }
    } catch (err) {
      console.error('Save permissions error:', err);
    } finally {
      setSavingPermissions(false);
    }
  };

  // Toggle Active / Disabled Status
  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const confirmMsg =
      newStatus === 'DISABLED'
        ? `Êtes-vous sûr de vouloir DÉSACTIVER l'accès de "${member.name}" ? Il sera immédiatement déconnecté.`
        : `Réactiver l'accès pour "${member.name}" ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const d = await res.json();
      if (res.ok) {
        showToast(`Statut de ${member.name} modifié en ${newStatus === 'ACTIVE' ? 'ACTIF' : 'DÉSACTIVÉ'}`);
        loadData();
      } else {
        alert(d.error || 'Erreur lors du changement de statut');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Generate random secure password helper
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Nay';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += '!';
    setNewMemberForm({ ...newMemberForm, password: pwd });
  };

  // Avatar presets
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  ];

  // If user does not have permission, show 403
  const canViewTeam =
    currentUser?.isOwner ||
    currentUser?.role === 'HR_ADMIN' ||
    (currentUser?.effectivePermissions || []).includes('team.view');

  if (!loading && currentUser && !canViewTeam) {
    return <AdminAccessDenied requiredPermission="team.view" userRole={currentUser.role} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
              Contrôle d&apos;Accès & RBAC Multi-Employés
            </span>
            <span className="text-xs text-[#555]">•</span>
            <span className="text-xs text-[#888888]">Espace Collaboratif Unique NAY Parfum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-sky-400" size={28} />
            <span>Gestion de l&apos;Équipe & Permissions</span>
          </h1>
          <p className="text-sm text-[#888888]">
            Administrez les comptes collaborateurs, assignez les 26 rôles opérationnels et personnalisez les permissions granulaires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/team/roles"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-white font-medium text-xs border border-white/10 transition-all shadow-sm"
          >
            <Users size={15} className="text-sky-400" />
            <span>Matrice des 26 Rôles</span>
          </Link>

          {(currentUser?.isOwner || (currentUser?.effectivePermissions || []).includes('team.create')) && (
            <button
              onClick={() => setIsNewMemberModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/20"
            >
              <UserPlus size={15} />
              <span>Ajouter un Collaborateur</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Total Équipe</div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-[#666] mt-0.5">Comptes configurés</div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>En Ligne</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.online}</div>
          <div className="text-[10px] text-[#666] mt-0.5">Actifs en ce moment</div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Comptes Actifs</div>
          <div className="text-2xl font-black text-white mt-1">{stats.active}</div>
          <div className="text-[10px] text-[#666] mt-0.5">Sessions autorisées</div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Désactivés</div>
          <div className="text-2xl font-black text-white mt-1">{stats.disabled}</div>
          <div className="text-[10px] text-[#666] mt-0.5">Accès révoqués</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" size={15} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, poste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#666] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#161616] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Tous les Rôles ({members.length})</option>
            {ALL_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161616] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="ACTIVE">Actifs uniquement</option>
            <option value="DISABLED">Désactivés uniquement</option>
          </select>

          <button
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-[#161616] hover:bg-[#202020] text-[#888888] hover:text-white border border-white/10 transition-colors"
            title="Actualiser la liste"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Team Table / List */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#141414] text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                <th className="py-3.5 px-4">Collaborateur</th>
                <th className="py-3.5 px-4">Rôle & Département</th>
                <th className="py-3.5 px-4">Poste & Spécialité</th>
                <th className="py-3.5 px-4">Statut & Présence</th>
                <th className="py-3.5 px-4 text-center">Permissions</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-[#ccc]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#666]">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-sky-400" />
                      <span>Chargement des collaborateurs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#666]">
                    Aucun collaborateur trouvé correspondant à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isOwner = member.role === 'OWNER' || member.role === 'CO_OWNER';
                  const roleDef = member.roleDefinition || getRoleDefinition(member.role);
                  const isSelf = currentUser?.id === member.id;
                  const customOverrides = parseCustomPermissions(member.customPermissions);
                  const hasCustomOverrides =
                    (customOverrides.granted && customOverrides.granted.length > 0) ||
                    (customOverrides.revoked && customOverrides.revoked.length > 0);

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-[#161616]/70 transition-colors ${
                        member.status === 'DISABLED' ? 'opacity-50 bg-rose-950/5' : ''
                      }`}
                    >
                      {/* Member Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span>{member.name.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111111] ${
                                member.status === 'DISABLED'
                                  ? 'bg-rose-500'
                                  : member.isOnline
                                  ? 'bg-emerald-500 animate-pulse'
                                  : 'bg-zinc-600'
                              }`}
                              title={
                                member.status === 'DISABLED'
                                  ? 'Compte désactivé'
                                  : member.isOnline
                                  ? 'En ligne maintenant'
                                  : 'Hors ligne'
                              }
                            />
                          </div>

                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-white/10 text-white px-1.5 py-0.2 rounded font-normal">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[#888888] text-[11px] flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail size={11} />
                                {member.email}
                              </span>
                              {member.phone && (
                                <span className="flex items-center gap-1 text-[#666]">
                                  • <Phone size={10} />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${roleDef.badgeBg} ${roleDef.badgeText} ${roleDef.badgeBorder}`}
                          >
                            {isOwner && <Sparkles size={11} className="text-amber-400" />}
                            <span>{roleDef.name}</span>
                          </span>
                          <div className="text-[10px] text-[#666] font-medium">
                            {roleDef.department}
                          </div>
                        </div>
                      </td>

                      {/* Job Title / Speciality */}
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">
                          {member.jobTitle || 'Non spécifié'}
                        </div>
                        <div className="text-[10px] text-[#666]">
                          {member._count?.assignedTasks || 0} mission(s) assignée(s)
                        </div>
                      </td>

                      {/* Status & Activity */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {member.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                <CheckCircle2 size={12} />
                                <span>Actif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                                <XCircle size={12} />
                                <span>Désactivé</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#666] flex items-center gap-1">
                            <Clock size={10} />
                            <span>
                              {member.isOnline
                                ? 'En ligne'
                                : member.lastActivityAt
                                ? `Vu le ${new Date(member.lastActivityAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`
                                : 'Jamais connecté'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Permissions Summary */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md text-[11px]">
                            {isOwner ? 'Toutes (49+)' : `${member.effectivePermissionsCount} clés`}
                          </span>
                          {hasCustomOverrides && !isOwner && (
                            <span className="text-[9px] text-amber-400 font-semibold mt-1">
                              Personnalisé
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Granular Permissions Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPermissionsDrawer(member)}
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
                            title="Gérer les permissions granulaires"
                          >
                            <Key size={14} />
                          </button>

                          {/* Edit Profile & Role Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-colors"
                            title="Modifier le profil & mot de passe"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Disable / Enable Toggle Button (Protected against self & owner) */}
                          {!isOwner && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(member)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                member.status === 'ACTIVE'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              }`}
                              title={member.status === 'ACTIVE' ? 'Désactiver l\'accès' : 'Réactiver l\'accès'}
                            >
                              <Power size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: AJOUTER UN COLLABORATEUR                        */}
      {/* ======================================================== */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#111111] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsNewMemberModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                Nouveau Compte
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <UserPlus size={22} className="text-sky-400" />
                <span>Ajouter un Collaborateur NAY</span>
              </h2>
              <p className="text-xs text-[#888888]">
                Créez les identifiants d&apos;accès et assignez le rôle opérationnel correspondant.
              </p>
            </div>

            {newMemberError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{newMemberError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block text-[#aaa] font-semibold mb-2">Photo de Profil</label>
                <div className="flex items-center gap-3">
                  <img
                    src={newMemberForm.avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-sky-500 shadow-md"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewMemberForm({ ...newMemberForm, avatar: av })}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                          newMemberForm.avatar === av ? 'border-sky-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Yassine Benali"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Email Professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: yassine@nayparfum.ma"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Rôle Assigné (26 Rôles) *</label>
                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  {ROLE_DEPARTMENTS.map((dept) => {
                    const deptRoles = ALL_ROLES.filter((r) => r.department === dept);
                    return (
                      <optgroup key={dept} label={`--- ${dept} ---`}>
                        {deptRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <p className="text-[11px] text-sky-400 mt-1">
                  {getRoleDefinition(newMemberForm.role).description}
                </p>
              </div>

              {/* Job Title & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Poste / Spécialité</label>
                  <input
                    type="text"
                    placeholder="Ex: Confirmateur Casablanca"
                    value={newMemberForm.jobTitle}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, jobTitle: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: +212 6 XX XX XX XX"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[#aaa] font-semibold">Mot de Passe Initial *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    Générer mot de passe sécurisé
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Minimum 6 caractères"
                  value={newMemberForm.password}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-white placeholder-[#666] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={newMemberLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {newMemberLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  <span>Créer le Compte</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: MODIFIER PROFIL, POSTE & MOT DE PASSE           */}
      {/* ======================================================== */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#111111] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                Modification Collaborateur
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Edit3 size={20} className="text-sky-400" />
                <span>Modifier : {selectedMember.name}</span>
              </h2>
            </div>

            {editError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.name}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Rôle Assigné</label>
                <select
                  value={editMemberForm.role}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  {ROLE_DEPARTMENTS.map((dept) => {
                    const deptRoles = ALL_ROLES.filter((r) => r.department === dept);
                    return (
                      <optgroup key={dept} label={`--- ${dept} ---`}>
                        {deptRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Job Title & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Poste / Spécialité</label>
                  <input
                    type="text"
                    value={editMemberForm.jobTitle}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, jobTitle: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#aaa] font-semibold mb-1.5">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    value={editMemberForm.phone}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">Statut du Compte</label>
                <select
                  value={editMemberForm.status}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, status: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ACTIVE">Actif (Accès autorisé)</option>
                  <option value="DISABLED">Désactivé (Accès bloqué)</option>
                </select>
              </div>

              {/* New Password (Optional) */}
              <div>
                <label className="block text-[#aaa] font-semibold mb-1.5">
                  Réinitialiser le Mot de Passe (Laisser vide pour ne pas changer)
                </label>
                <input
                  type="text"
                  placeholder="Nouveau mot de passe"
                  value={editMemberForm.newPassword}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, newPassword: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-white placeholder-[#666] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER 3: PERSONNALISATION DES PERMISSIONS GRANULAIRES   */}
      {/* ======================================================== */}
      {isPermissionsDrawerOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end animate-fadeIn">
          <div className="bg-[#111111] border-l border-white/10 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <Key size={12} />
                    <span>Permissions Granulaires</span>
                  </span>
                  <span className="text-xs text-[#666]">•</span>
                  <span className="text-xs text-[#888888] font-mono">{selectedMember.role}</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {selectedMember.name}
                </h2>
                <p className="text-xs text-[#888888]">
                  {selectedMember.role === 'OWNER' || selectedMember.role === 'CO_OWNER'
                    ? 'Ce collaborateur est Propriétaire (Owner). Il dispose d\'un accès complet et irrévocable à toutes les fonctionnalités.'
                    : 'Le rôle fournit les permissions par défaut. Vous pouvez accorder ou révoquer individuellement chaque droit d\'accès.'}
                </p>
              </div>

              <button
                onClick={() => setIsPermissionsDrawerOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Overrides Diff Bar */}
            {selectedMember.role !== 'OWNER' && selectedMember.role !== 'CO_OWNER' && (
              <div className="bg-[#161616] px-6 py-2.5 border-b border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[#888888]">Modifications manuelles :</span>
                  {permissionOverrides.granted.length > 0 && (
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      +{permissionOverrides.granted.length} accordée(s)
                    </span>
                  )}
                  {permissionOverrides.revoked.length > 0 && (
                    <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      -{permissionOverrides.revoked.length} révoquée(s)
                    </span>
                  )}
                  {permissionOverrides.granted.length === 0 && permissionOverrides.revoked.length === 0 && (
                    <span className="text-[#666] italic">Strictement identique au rôle</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetToRoleDefaults}
                  disabled={savingPermissions}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Réinitialiser au Rôle</span>
                </button>
              </div>
            )}

            {/* Module Tabs */}
            <div className="px-6 pt-3 flex items-center gap-1.5 overflow-x-auto border-b border-white/5 custom-scrollbar">
              {PERMISSION_MODULES.map((mod) => {
                const isActive = activeModuleTab === mod.id;
                const modPerms = ALL_PERMISSIONS.filter((p) => p.module === mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleTab(mod.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                      isActive
                        ? 'border-sky-500 text-white bg-white/5'
                        : 'border-transparent text-[#888888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{mod.label}</span>
                    <span className="text-[10px] text-[#666] bg-white/5 px-1.5 py-0.2 rounded-full">
                      {modPerms.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Module Permissions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {ALL_PERMISSIONS.filter((p) => p.module === activeModuleTab).map((perm) => {
                const roleDef = selectedMember.roleDefinition || getRoleDefinition(selectedMember.role);
                const isRoleDefault = roleDef.defaultPermissions.includes(perm.key);
                const isManuallyGranted = permissionOverrides.granted.includes(perm.key);
                const isManuallyRevoked = permissionOverrides.revoked.includes(perm.key);
                const isOwner = selectedMember.role === 'OWNER' || selectedMember.role === 'CO_OWNER';

                // Effective calculation
                const isEffectiveActive = isOwner || (isRoleDefault ? !isManuallyRevoked : isManuallyGranted);

                return (
                  <div
                    key={perm.key}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isEffectiveActive
                        ? 'bg-[#141414] border-white/10'
                        : 'bg-[#0f0f0f] border-white/5 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{perm.label}</span>
                        {perm.isSensitive && (
                          <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded">
                            Sensible / Financier
                          </span>
                        )}
                        {isManuallyGranted && (
                          <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                            Accordé manuellement
                          </span>
                        )}
                        {isManuallyRevoked && (
                          <span className="text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded">
                            Révoqué manuellement
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#888888] leading-relaxed">
                        {perm.description}
                      </p>
                      <div className="text-[10px] font-mono text-[#555]">{perm.key}</div>
                    </div>

                    {/* Switch */}
                    <div className="pt-1">
                      {isOwner ? (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          Toujours Actif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key, isRoleDefault)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            isEffectiveActive ? 'bg-sky-500' : 'bg-[#262626]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              isEffectiveActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-white/5 bg-[#141414] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPermissionsDrawerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
              >
                Fermer
              </button>

              {selectedMember.role !== 'OWNER' && selectedMember.role !== 'CO_OWNER' && (
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all"
                >
                  {savingPermissions ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Enregistrer les Permissions</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#888888] flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-sky-400" />
          <span>Chargement de l&apos;équipe NAY...</span>
        </div>
      }
    >
      <TeamManagementContent />
    </Suspense>
  );
}
