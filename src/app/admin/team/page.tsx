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
  Power,
  Banknote,
  Coins,
  Wallet
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle?: string | null;
  phone?: string | null;
  salary?: number | null;
  salaryType?: string | null;
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
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0, online: 0, totalPayrollMAD: 0 });
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
    salary: '' as string | number,
    salaryType: 'MONTHLY',
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
    salary: 0 as number,
    salaryType: 'MONTHLY',
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
          setStats(teamData.stats || { total: 0, active: 0, disabled: 0, online: 0, totalPayrollMAD: 0 });
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
      salary: member.salary || 0,
      salaryType: member.salaryType || 'MONTHLY',
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
        salary: Number(editMemberForm.salary) || 0,
        salaryType: editMemberForm.salaryType,
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

      showToast(`Profil et rémunération de "${editMemberForm.name}" mis à jour avec succès.`);
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

      const payload = {
        ...newMemberForm,
        salary: Number(newMemberForm.salary) || 0,
      };

      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setNewMemberError(data.error || 'Erreur lors de la création du compte');
        return;
      }

      showToast(`Compte créé avec succès pour ${newMemberForm.name} (Salaire: ${payload.salary} MAD) !`);
      setIsNewMemberModalOpen(false);
      setNewMemberForm({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER_SUPPORT_AGENT',
        jobTitle: '',
        phone: '',
        salary: '',
        salaryType: 'MONTHLY',
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

  // Format Salary type label
  const getSalaryTypeLabel = (type?: string | null) => {
    if (type === 'COMMISSION') return 'Fixe + Commission';
    if (type === 'HOURLY') return 'Horaire';
    return 'Mensuel';
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
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Gestion de l&apos;Équipe & Salaires
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            Gestion des collaborateurs, rémunérations en MAD, attribution des rôles et contrôle des permissions RBAC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/team/roles"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition-colors"
          >
            <Users size={14} />
            <span>Matrice des 26 Rôles</span>
          </Link>

          {(currentUser?.isOwner || (currentUser?.effectivePermissions || []).includes('team.create')) && (
            <button
              onClick={() => setIsNewMemberModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-colors shadow-2xs"
            >
              <UserPlus size={14} />
              <span>Ajouter un collaborateur</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar with Payroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Équipe</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Comptes configurés</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>En Ligne</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{stats.online}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Actifs en ce moment</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Comptes Actifs</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{stats.active}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Sessions autorisées</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Désactivés</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{stats.disabled}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Accès bloqués</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1">
            <Coins size={13} />
            <span>Masse Salariale</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {(stats.totalPayrollMAD || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-neutral-500">MAD</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Total mensuel actif</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, poste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-neutral-200 text-neutral-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-neutral-900"
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
            className="bg-white border border-neutral-200 text-neutral-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-neutral-900"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="ACTIVE">Actifs uniquement</option>
            <option value="DISABLED">Désactivés uniquement</option>
          </select>

          <button
            onClick={() => loadData()}
            className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200 transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Team Table / List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Rôle & Département</th>
                <th className="py-3 px-4">Poste</th>
                <th className="py-3 px-4">Rémunération</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-center">Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#666]">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-sky-400" />
                      <span>Chargement des collaborateurs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#666]">
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
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        member.status === 'DISABLED' ? 'opacity-50 bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
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
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                member.status === 'DISABLED'
                                  ? 'bg-rose-500'
                                  : member.isOnline
                                  ? 'bg-emerald-500'
                                  : 'bg-neutral-300'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-normal">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-neutral-400 text-[11px] flex items-center gap-2 mt-0.5">
                              <span>{member.email}</span>
                              {member.phone && (
                                <span>• {member.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${roleDef.badgeBg} ${roleDef.badgeText} ${roleDef.badgeBorder}`}
                          >
                            <span>{roleDef.name}</span>
                          </span>
                          <div className="text-[10px] text-neutral-400 font-medium">
                            {roleDef.department}
                          </div>
                        </div>
                      </td>

                      {/* Job Title / Speciality */}
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-900 font-medium">
                          {member.jobTitle || 'Non spécifié'}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {member._count?.assignedTasks || 0} mission(s)
                        </div>
                      </td>

                      {/* Salary / Rémunération in MAD */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-neutral-900">
                            {member.salary && member.salary > 0
                              ? `${member.salary.toLocaleString('fr-FR')} MAD`
                              : 'Non défini'}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-medium">
                            {getSalaryTypeLabel(member.salaryType)}
                          </div>
                        </div>
                      </td>

                      {/* Status & Activity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div>
                            {member.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                <CheckCircle2 size={11} />
                                <span>Actif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700">
                                <XCircle size={11} />
                                <span>Désactivé</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {member.isOnline
                              ? 'En ligne'
                              : member.lastActivityAt
                              ? `Vu le ${new Date(member.lastActivityAt).toLocaleDateString('fr-MA', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}`
                              : 'Jamais connecté'}
                          </div>
                        </div>
                      </td>

                      {/* Permissions Summary */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                            {isOwner ? 'Toutes' : `${member.effectivePermissionsCount} clés`}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPermissionsDrawer(member)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                            title="Permissions"
                          >
                            <Key size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                            title="Modifier"
                          >
                            <Edit3 size={13} />
                          </button>

                          {!isOwner && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(member)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                member.status === 'ACTIVE'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                              title={member.status === 'ACTIVE' ? 'Désactiver' : 'Réactiver'}
                            >
                              <Power size={13} />
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

      {/* MODAL: AJOUTER UN COLLABORATEUR */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl relative my-8 text-neutral-900 animate-in fade-in">
            <button
              onClick={() => setIsNewMemberModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
            >
              <X size={16} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <UserPlus size={18} />
                <span>Ajouter un collaborateur</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Identifiants d&apos;accès, rôle attribué et salaire mensuel en MAD.
              </p>
            </div>

            {newMemberError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{newMemberError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1.5">Photo de Profil</label>
                <div className="flex items-center gap-3">
                  <img
                    src={typeof newMemberForm.avatar === 'string' ? newMemberForm.avatar : ''}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-300"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewMemberForm({ ...newMemberForm, avatar: av })}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                          newMemberForm.avatar === av ? 'border-neutral-900 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Yassine Benali"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Email Professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: yassine@nayparfum.ma"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Rôle Assigné (26 Rôles) *</label>
                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
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
                <p className="text-[11px] text-neutral-500 mt-1">
                  {getRoleDefinition(newMemberForm.role).description}
                </p>
              </div>

              {/* Job Title & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Poste / Spécialité</label>
                  <input
                    type="text"
                    placeholder="Ex: Confirmateur Casablanca"
                    value={newMemberForm.jobTitle}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, jobTitle: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: +212 6 XX XX XX XX"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Salary & Salary Type (MAD) */}
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-900 font-bold">
                  <Banknote size={15} />
                  <span>Rémunération & Salaire (MAD)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Montant du Salaire (MAD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Ex: 6500"
                        value={newMemberForm.salary}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, salary: e.target.value })}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-semibold placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500">
                        MAD
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Type de Rémunération</label>
                    <select
                      value={newMemberForm.salaryType}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, salaryType: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                    >
                      <option value="MONTHLY">Mensuel Fixe</option>
                      <option value="COMMISSION">Fixe + Commission</option>
                      <option value="HOURLY">Par Heure / Prestation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-neutral-700 font-medium">Mot de Passe Initial *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-neutral-700 hover:text-black font-semibold underline"
                  >
                    Générer mot de passe
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Minimum 6 caractères"
                  value={newMemberForm.password}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={newMemberLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium shadow-2xs disabled:opacity-50"
                >
                  {newMemberLoading ? <RefreshCw size={13} className="animate-spin" /> : <UserPlus size={13} />}
                  <span>Créer le Compte</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFIER COLLABORATEUR */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl relative my-8 text-neutral-900 animate-in fade-in">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
            >
              <X size={16} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <Edit3 size={18} />
                <span>Modifier : {selectedMember.name}</span>
              </h2>
            </div>

            {editError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Email Professionnel</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Rôle Assigné</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Poste</label>
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-900 font-bold">
                  <Banknote size={15} />
                  <span>Rémunération & Salaire (MAD)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Salaire (MAD)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-semibold focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Type</label>
                    <select
                      value={editForm.salaryType}
                      onChange={(e) => setEditForm({ ...editForm, salaryType: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
                    >
                      <option value="MONTHLY">Mensuel Fixe</option>
                      <option value="COMMISSION">Fixe + Commission</option>
                      <option value="HOURLY">Par Heure / Prestation</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Nouveau mot de passe (laisser vide si inchangé)</label>
                <input
                  type="text"
                  placeholder="Laisser vide pour ne pas modifier"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium shadow-2xs disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

              {/* Salary & Salary Type Edit (MAD) */}
              <div className="bg-[#161616] p-4 rounded-2xl border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Banknote size={16} />
                  <span>Modifier le Salaire (MAD)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#aaa] font-semibold mb-1.5">Montant du Salaire (MAD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={editMemberForm.salary}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, salary: Number(e.target.value) || 0 })}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-amber-300 font-bold focus:outline-none focus:border-amber-500 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#777]">
                        MAD
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#aaa] font-semibold mb-1.5">Type de Rémunération</label>
                    <select
                      value={editMemberForm.salaryType}
                      onChange={(e) => setEditMemberForm({ ...editMemberForm, salaryType: e.target.value })}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="MONTHLY">Mensuel Fixe</option>
                      <option value="COMMISSION">Fixe + Commission</option>
                      <option value="HOURLY">Par Heure / Prestation</option>
                    </select>
                  </div>
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
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white border-l border-neutral-200 w-full max-w-2xl h-full flex flex-col shadow-2xl">
            
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                    <Key size={12} />
                    <span>Permissions Granulaires</span>
                  </span>
                  <span className="text-xs text-neutral-300">•</span>
                  <span className="text-xs text-neutral-500 font-mono">{selectedMember.role}</span>
                </div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  {selectedMember.name}
                </h2>
                <p className="text-xs text-neutral-500">
                  {selectedMember.role === 'OWNER' || selectedMember.role === 'CO_OWNER'
                    ? 'Ce collaborateur est Propriétaire (Owner). Il dispose d\'un accès complet et irrévocable à toutes les fonctionnalités.'
                    : 'Le rôle fournit les permissions par défaut. Vous pouvez accorder ou révoquer individuellement chaque droit d\'accès.'}
                </p>
              </div>

              <button
                onClick={() => setIsPermissionsDrawerOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Overrides Diff Bar */}
            {selectedMember.role !== 'OWNER' && selectedMember.role !== 'CO_OWNER' && (
              <div className="bg-neutral-50 px-6 py-2.5 border-b border-neutral-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-neutral-500 text-[11px]">Modifications manuelles :</span>
                  {permissionOverrides.granted.length > 0 && (
                    <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      +{permissionOverrides.granted.length} accordée(s)
                    </span>
                  )}
                  {permissionOverrides.revoked.length > 0 && (
                    <span className="text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
                      -{permissionOverrides.revoked.length} révoquée(s)
                    </span>
                  )}
                  {permissionOverrides.granted.length === 0 && permissionOverrides.revoked.length === 0 && (
                    <span className="text-neutral-400 italic text-[11px]">Strictement identique au rôle</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetToRoleDefaults}
                  disabled={savingPermissions}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-medium transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Réinitialiser</span>
                </button>
              </div>
            )}

            {/* Module Tabs */}
            <div className="px-6 pt-2 flex items-center gap-1.5 overflow-x-auto border-b border-neutral-200">
              {PERMISSION_MODULES.map((mod) => {
                const isActive = activeModuleTab === mod.id;
                const modPerms = ALL_PERMISSIONS.filter((p) => p.module === mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleTab(mod.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                      isActive
                        ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                        : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{mod.label}</span>
                    <span className="text-[10px] text-neutral-500 bg-neutral-200/70 px-1.5 py-0.2 rounded-full">
                      {modPerms.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Module Permissions List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-2.5">
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
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      isEffectiveActive
                        ? 'bg-white border-neutral-300 shadow-2xs'
                        : 'bg-neutral-50/60 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-neutral-900 text-xs">{perm.label}</span>
                        {perm.isSensitive && (
                          <span className="text-[9px] font-medium bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
                            Sensible / Financier
                          </span>
                        )}
                        {isManuallyGranted && (
                          <span className="text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                            Accordé manuellement
                          </span>
                        )}
                        {isManuallyRevoked && (
                          <span className="text-[9px] font-medium bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
                            Révoqué manuellement
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {perm.description}
                      </p>
                      <div className="text-[10px] font-mono text-neutral-400">{perm.key}</div>
                    </div>

                    {/* Switch */}
                    <div className="pt-1">
                      {isOwner ? (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                          Toujours Actif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key, isRoleDefault)}
                          className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                            isEffectiveActive ? 'bg-neutral-900' : 'bg-neutral-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
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
            <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPermissionsDrawerOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium text-xs transition-colors shadow-2xs"
              >
                Fermer
              </button>

              {selectedMember.role !== 'OWNER' && selectedMember.role !== 'CO_OWNER' && (
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white font-medium text-xs shadow-xs disabled:opacity-50 transition-all"
                >
                  {savingPermissions ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
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
