import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AdminUserSafe } from '../adminAuth';
import { hasPermission } from './accessControl';

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
