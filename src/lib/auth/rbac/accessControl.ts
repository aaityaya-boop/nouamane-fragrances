import { NextResponse } from 'next/server';
import { ALL_PERMISSIONS } from './permissions';
import { getRoleDefinition } from './roles';
import { getAuthenticatedAdmin, AdminUserSafe } from '../adminAuth';

export interface CustomPermissionsPayload {
  granted?: string[];
  revoked?: string[];
}

/**
 * Safely parse custom permissions JSON stored in the database
 */
export function parseCustomPermissions(raw: string | null | undefined): CustomPermissionsPayload {
  if (!raw) return { granted: [], revoked: [] };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      granted: Array.isArray(parsed?.granted) ? parsed.granted : [],
      revoked: Array.isArray(parsed?.revoked) ? parsed.revoked : [],
    };
  } catch {
    return { granted: [], revoked: [] };
  }
}

/**
 * Compute the effective permissions set for an admin user
 * Formula: (RoleDefaultPermissions ∪ GrantedOverrides) \ RevokedOverrides
 * Owners always get all permissions.
 */
export function getUserEffectivePermissions(user: {
  role: string;
  customPermissions?: string | null;
  status?: string;
}): string[] {
  if (user.status && user.status !== 'ACTIVE') {
    return [];
  }

  const roleUpper = (user.role || '').toUpperCase();
  if (roleUpper === 'OWNER' || roleUpper === 'CO_OWNER' || roleUpper === 'SUPER_ADMIN') {
    return ALL_PERMISSIONS.map((p) => p.key);
  }

  const roleDef = getRoleDefinition(user.role);
  const basePermissions = new Set<string>(roleDef.defaultPermissions);
  const { granted, revoked } = parseCustomPermissions(user.customPermissions);

  // Add custom granted
  for (const perm of granted || []) {
    basePermissions.add(perm);
  }

  // Remove custom revoked
  for (const perm of revoked || []) {
    basePermissions.delete(perm);
  }

  return Array.from(basePermissions);
}

/**
 * Check if an active user has a specific permission
 */
export function hasPermission(
  user: { role: string; customPermissions?: string | null; status?: string } | null | undefined,
  permissionKey: string
): boolean {
  if (!user || (user.status && user.status !== 'ACTIVE')) return false;

  const roleUpper = (user.role || '').toUpperCase();
  if (roleUpper === 'OWNER' || roleUpper === 'CO_OWNER' || roleUpper === 'SUPER_ADMIN') {
    return true;
  }

  const effective = getUserEffectivePermissions(user);
  return effective.includes(permissionKey);
}

/**
 * Check if an active user has at least one of the specified permissions
 */
export function hasAnyPermission(
  user: { role: string; customPermissions?: string | null; status?: string } | null | undefined,
  permissionKeys: string[]
): boolean {
  if (!user || (user.status && user.status !== 'ACTIVE')) return false;

  const roleUpper = (user.role || '').toUpperCase();
  if (roleUpper === 'OWNER' || roleUpper === 'CO_OWNER' || roleUpper === 'SUPER_ADMIN') {
    return true;
  }

  const effective = getUserEffectivePermissions(user);
  return permissionKeys.some((k) => effective.includes(k));
}

/**
 * Check if an active user has all of the specified permissions
 */
export function hasAllPermissions(
  user: { role: string; customPermissions?: string | null; status?: string } | null | undefined,
  permissionKeys: string[]
): boolean {
  if (!user || (user.status && user.status !== 'ACTIVE')) return false;

  const roleUpper = (user.role || '').toUpperCase();
  if (roleUpper === 'OWNER' || roleUpper === 'CO_OWNER' || roleUpper === 'SUPER_ADMIN') {
    return true;
  }

  const effective = getUserEffectivePermissions(user);
  return permissionKeys.every((k) => effective.includes(k));
}

/**
 * Validate if an actor can manage (edit, change role, disable) another target user
 */
export function canManageUser(
  actor: AdminUserSafe,
  target: { id: string; role: string; status?: string }
): { allowed: boolean; reason?: string } {
  const actorIsOwner =
    actor.role === 'OWNER' || actor.role === 'CO_OWNER' || actor.role === 'SUPER_ADMIN';

  const targetIsOwner =
    target.role === 'OWNER' || target.role === 'CO_OWNER' || target.role === 'SUPER_ADMIN';

  // Only Owners or HR with team.edit permission can manage team members
  if (!actorIsOwner && !hasPermission(actor, 'team.edit')) {
    return { allowed: false, reason: 'Vous n\'avez pas les permissions requises pour gérer l\'équipe.' };
  }

  // Non-owners can never edit, demote or disable an Owner
  if (targetIsOwner && !actorIsOwner) {
    return { allowed: false, reason: 'Seuls les Fondateurs (Owners) peuvent modifier un compte Propriétaire.' };
  }

  // Self-protection: An owner cannot disable themselves
  if (actor.id === target.id && target.status === 'DISABLED') {
    return { allowed: false, reason: 'Vous ne pouvez pas désactiver votre propre compte.' };
  }

  return { allowed: true };
}

/**
 * Server Route Helper: Guard an API endpoint with a required permission
 */
export async function requirePermission(
  req: Request | undefined,
  permissionKey: string
): Promise<{ user: AdminUserSafe | null; errorResponse: NextResponse | null }> {
  const user = await getAuthenticatedAdmin(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Session expirée ou utilisateur non connecté', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    };
  }

  if (user.status !== 'ACTIVE') {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Votre compte est désactivé. Veuillez contacter un administrateur.', code: 'DISABLED' },
        { status: 403 }
      ),
    };
  }

  if (!hasPermission(user, permissionKey)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          error: 'Accès refusé. Privilèges insuffisants pour cette action.',
          code: 'FORBIDDEN',
          requiredPermission: permissionKey,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
