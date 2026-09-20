'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ALL_ROLES, 
  ROLE_DEPARTMENTS, 
  RoleDepartment, 
  RoleDefinition 
} from '@/lib/auth/rbac/roles';
import { ALL_PERMISSIONS, PERMISSION_MODULES, PermissionModule } from '@/lib/auth/rbac/permissions';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  Check, 
  Key, 
  Layers, 
  ShieldAlert, 
  UserPlus, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

export default function RolesDirectoryPage() {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  // Group all permissions by module for quick lookup
  const permMap = useMemo(() => {
    return new Map(ALL_PERMISSIONS.map((p) => [p.key, p]));
  }, []);

  const filteredRoles = useMemo(() => {
    return ALL_ROLES.filter((role) => {
      const matchDept = selectedDept === 'ALL' || role.department === selectedDept;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.id.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query) ||
        role.department.toLowerCase().includes(query);

      return matchDept && matchSearch;
    });
  }, [selectedDept, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedRoleId(expandedRoleId === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/team"
              className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg"
            >
              <ArrowLeft size={13} />
              <span>Retour à l&apos;Équipe</span>
            </Link>
            <span className="text-xs text-[#555]">•</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              26 Rôles Configurés
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-sky-400" size={28} />
            <span>Annuaire des Rôles & Permissions</span>
          </h1>
          <p className="text-sm text-[#888888]">
            Matrice des 26 rôles opérationnels NAY Parfum avec leurs attributions et permissions par défaut.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/team?openNew=true"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/20"
          >
            <UserPlus size={15} />
            <span>Ajouter un Collaborateur</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedDept === 'ALL'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#151515] text-[#888888] hover:text-white hover:bg-[#202020]'
            }`}
          >
            Tous les Départements ({ALL_ROLES.length})
          </button>
          {ROLE_DEPARTMENTS.map((dept) => {
            const count = ALL_ROLES.filter((r) => r.department === dept).length;
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-[#151515] text-[#888888] hover:text-white hover:bg-[#202020]'
                }`}
              >
                <span>{dept}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-[#666]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" size={16} />
          <input
            type="text"
            placeholder="Rechercher un rôle par titre, identifiant ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const isExpanded = expandedRoleId === role.id;
          const isOwnerRole = role.isOwnerRole;

          // Group permissions of this role by module
          const roleModulesMap: Record<string, typeof ALL_PERMISSIONS> = {};
          role.defaultPermissions.forEach((key) => {
            const def = permMap.get(key);
            if (def) {
              if (!roleModulesMap[def.module]) roleModulesMap[def.module] = [];
              roleModulesMap[def.module].push(def);
            }
          });

          return (
            <div
              key={role.id}
              className={`bg-[#111111] border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden group ${
                isOwnerRole
                  ? 'border-amber-500/30 hover:border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              {/* Glow accent */}
              {isOwnerRole && (
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              <div className="space-y-4">
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${role.badgeBg} ${role.badgeText} ${role.badgeBorder}`}>
                    {role.department}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#666] bg-white/5 px-2 py-0.5 rounded">
                    {role.id}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors flex items-center gap-2">
                    {isOwnerRole && <Sparkles size={16} className="text-amber-400 shrink-0" />}
                    <span>{role.name}</span>
                  </h3>
                  <p className="text-xs text-[#888888] mt-1.5 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                {/* Stats / Permissions count */}
                <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#aaa]">
                    <Key size={14} className="text-sky-400" />
                    <span>Permissions par défaut</span>
                  </div>
                  <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                    {isOwnerRole ? 'Toutes (49+)' : `${role.defaultPermissions.length} clés`}
                  </span>
                </div>

                {/* Permissions Breakdown when Expanded */}
                {isExpanded && (
                  <div className="pt-2 border-t border-white/5 space-y-3 animate-fadeIn">
                    <div className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                      Modules & Actions autorisées :
                    </div>
                    {isOwnerRole ? (
                      <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-center gap-2">
                        <Sparkles size={14} className="shrink-0" />
                        <span>Accès irrévocable à 100% des modules, logs, finances et configuration système.</span>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar text-xs">
                        {Object.entries(roleModulesMap).map(([modId, perms]) => {
                          const modMeta = PERMISSION_MODULES.find((m) => m.id === modId);
                          return (
                            <div key={modId} className="bg-[#161616] p-2 rounded-lg border border-white/5">
                              <div className="text-[10px] font-bold text-sky-400 uppercase mb-1">
                                {modMeta?.label || modId} ({perms.length})
                              </div>
                              <div className="space-y-1">
                                {perms.map((p) => (
                                  <div key={p.key} className="flex items-start gap-1.5 text-[11px] text-[#ccc]">
                                    <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span>{p.label}</span>
                                    {p.isSensitive && (
                                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded shrink-0">
                                        Sensible
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(role.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#888888] hover:text-white transition-colors"
                >
                  <span>{isExpanded ? 'Masquer détails' : 'Voir les permissions'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <Link
                  href={`/admin/team?role=${role.id}&openNew=true`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/5"
                >
                  <UserPlus size={13} />
                  <span>Assigner</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
