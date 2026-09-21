import { ALL_ROLES, getRoleDefinition } from '../src/lib/auth/rbac/roles';
import { ALL_PERMISSIONS } from '../src/lib/auth/rbac/permissions';
import { 
  getUserEffectivePermissions, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canManageUser,
  parseCustomPermissions 
} from '../src/lib/auth/rbac/accessControl';

async function testRBAC() {
  console.log('=== 1. ROLES REGISTRY TEST ===');
  console.log(`Total Roles Defined: ${ALL_ROLES.length} (Expected: 26)`);
  if (ALL_ROLES.length !== 26) {
    throw new Error(`Expected 26 roles, got ${ALL_ROLES.length}`);
  }

  console.log(`Total Permissions Defined: ${ALL_PERMISSIONS.length}`);

  console.log('\n=== 2. OWNER PRIVILEGE TEST ===');
  const ownerUser = { id: 'owner-1', name: 'Ayoub', email: 'ayoub@nayparfum.ma', role: 'OWNER', status: 'ACTIVE' };
  const ownerPerms = getUserEffectivePermissions(ownerUser);
  console.log(`Owner effective permissions count: ${ownerPerms.length} / ${ALL_PERMISSIONS.length}`);
  if (ownerPerms.length !== ALL_PERMISSIONS.length) {
    throw new Error('Owner must have all permissions!');
  }
  if (!hasPermission(ownerUser as any, 'finance.view_profit')) {
    throw new Error('Owner must have finance.view_profit!');
  }

  console.log('\n=== 3. STOCK MANAGER DEFAULT TEST ===');
  const stockUser = { id: 'stock-1', name: 'Karim', email: 'karim@nayparfum.ma', role: 'STOCK_MANAGER', status: 'ACTIVE' };
  const stockPerms = getUserEffectivePermissions(stockUser);
  console.log('Stock Manager permissions count:', stockPerms.length);
  console.log('Has inventory.adjust:', hasPermission(stockUser as any, 'inventory.adjust'));
  console.log('Has finance.view_profit:', hasPermission(stockUser as any, 'finance.view_profit'));
  if (!hasPermission(stockUser as any, 'inventory.adjust')) {
    throw new Error('STOCK_MANAGER should have inventory.adjust');
  }
  if (hasPermission(stockUser as any, 'finance.view_profit')) {
    throw new Error('STOCK_MANAGER should NOT have finance.view_profit');
  }

  console.log('\n=== 4. CUSTOM PERMISSION OVERRIDE TEST ===');
  // Add finance.view_profit to Karim, revoke inventory.adjust
  const customStockUser = {
    ...stockUser,
    customPermissions: JSON.stringify({
      granted: ['finance.view_profit'],
      revoked: ['inventory.adjust'],
    }),
  };
  console.log('Has granted finance.view_profit:', hasPermission(customStockUser as any, 'finance.view_profit'));
  console.log('Has revoked inventory.adjust:', hasPermission(customStockUser as any, 'inventory.adjust'));
  if (!hasPermission(customStockUser as any, 'finance.view_profit')) {
    throw new Error('Custom granted permission failed');
  }
  if (hasPermission(customStockUser as any, 'inventory.adjust')) {
    throw new Error('Custom revoked permission failed');
  }

  console.log('\n=== 5. DISABLED USER STATUS TEST ===');
  const disabledUser = { ...customStockUser, status: 'DISABLED' };
  console.log('Disabled user hasPermission:', hasPermission(disabledUser as any, 'dashboard.view'));
  if (hasPermission(disabledUser as any, 'dashboard.view')) {
    throw new Error('Disabled user must have 0 permissions!');
  }

  console.log('\n=== 6. CAN MANAGE USER PROTECTION TEST ===');
  const ownerActor = { id: 'o-1', name: 'Ayoub', email: 'a@nay.ma', role: 'OWNER', status: 'ACTIVE' } as any;
  const employeeActor = { id: 'e-1', name: 'Karim', email: 'k@nay.ma', role: 'STOCK_MANAGER', status: 'ACTIVE' } as any;
  const otherEmployee = { id: 'e-2', role: 'CUSTOMER_SUPPORT_AGENT' };
  const otherOwner = { id: 'o-2', role: 'OWNER' };

  console.log('Owner can manage employee:', canManageUser(ownerActor, otherEmployee).allowed);
  console.log('Employee can manage employee:', canManageUser(employeeActor, otherEmployee).allowed);
  console.log('Employee can manage owner:', canManageUser(employeeActor, otherOwner).allowed);
  console.log('Owner can self-disable:', canManageUser(ownerActor, { id: 'o-1', role: 'OWNER', status: 'DISABLED' }).allowed);

  if (!canManageUser(ownerActor, otherEmployee).allowed) throw new Error('Owner should be able to manage employee');
  if (canManageUser(employeeActor, otherEmployee).allowed) throw new Error('Employee without team.edit should not manage employee');
  if (canManageUser(employeeActor, otherOwner).allowed) throw new Error('Employee should not manage owner');
  if (canManageUser(ownerActor, { id: 'o-1', role: 'OWNER', status: 'DISABLED' }).allowed) {
    throw new Error('Owner should not self-disable');
  }

  console.log('\n ALL RBAC & PERMISSION TESTS PASSED PERFECTLY! ');
}

testRBAC().catch((e) => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
