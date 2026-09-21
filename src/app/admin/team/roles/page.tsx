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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/team"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition-colors bg-white hover:bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg"
            >
              <ArrowLeft size={13} />
              <span>Retour à l&apos;Équipe</span>
            </Link>
            <span className="text-xs text-neutral-300">•</span>
            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              26 Rôles Configurés
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-neutral-900" size={24} />
            <span>Annuaire des Rôles & Permissions</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Matrice des 26 rôles opérationnels NAY Parfum avec leurs attributions et permissions par défaut.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/team?openNew=true"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white font-medium text-xs transition-colors shadow-xs"
          >
            <UserPlus size={14} />
            <span>Ajouter un Collaborateur</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
              selectedDept === 'ALL'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-neutral-200'
            }`}
          >
            Tous ({ALL_ROLES.length})
          </button>
          {ROLE_DEPARTMENTS.map((dept) => {
            const count = ALL_ROLES.filter((r) => r.department === dept).length;
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-neutral-200'
                }`}
              >
                <span>{dept}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
          <input
            type="text"
            placeholder="Rechercher un rôle par titre, identifiant ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-shadow shadow-2xs ${
                isOwnerRole
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="space-y-3.5">
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${role.badgeBg} ${role.badgeText} ${role.badgeBorder}`}>
                    {role.department}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {role.id}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                    {isOwnerRole && <Sparkles size={14} className="text-amber-600 shrink-0" />}
                    <span>{role.name}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                {/* Stats / Permissions count */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Key size={13} className="text-neutral-400" />
                    <span>Permissions par défaut</span>
                  </div>
                  <span className="font-semibold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px]">
                    {isOwnerRole ? 'Toutes (49+)' : `${role.defaultPermissions.length} clés`}
                  </span>
                </div>

                {/* Permissions Breakdown when Expanded */}
                {isExpanded && (
                  <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                    <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Modules & Actions autorisées :
                    </div>
                    {isOwnerRole ? (
                      <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2">
                        <Sparkles size={13} className="shrink-0 text-amber-600" />
                        <span>Accès irrévocable à 100% des modules, logs, finances et configuration système.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
                        {Object.entries(roleModulesMap).map(([modId, perms]) => {
                          const modMeta = PERMISSION_MODULES.find((m) => m.id === modId);
                          return (
                            <div key={modId} className="bg-neutral-50 p-2 rounded-lg border border-neutral-200/70">
                              <div className="text-[10px] font-semibold text-neutral-800 uppercase mb-1">
                                {modMeta?.label || modId} ({perms.length})
                              </div>
                              <div className="space-y-1">
                                {perms.map((p) => (
                                  <div key={p.key} className="flex items-start gap-1.5 text-[11px] text-neutral-700">
                                    <Check size={12} className="text-emerald-600 mt-0.5 shrink-0" />
                                    <span>{p.label}</span>
                                    {p.isSensitive && (
                                      <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.2 rounded shrink-0">
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
              <div className="pt-3 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(role.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <span>{isExpanded ? 'Masquer' : 'Détails permissions'}</span>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                <Link
                  href={`/admin/team?role=${role.id}&openNew=true`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-neutral-50 text-neutral-800 font-medium text-xs transition-colors border border-neutral-300"
                >
                  <UserPlus size={12} />
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
