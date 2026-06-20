import { User, UserRole, Permission, RolePermissions } from '../types';

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  const permissions = RolePermissions[user.role];
  return permissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  return permissions.every((permission) => hasPermission(user, permission));
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Get all permissions for a user's role
 */
export const getUserPermissions = (user: User | null): Permission[] => {
  if (!user) return [];
  return RolePermissions[user.role];
};

/**
 * Check if user is active
 */
export const isActiveUser = (user: User | null): boolean => {
  if (!user) return false;
  return user.isActive;
};
