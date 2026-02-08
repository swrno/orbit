import { WorkspaceRole, TeamRole, WorkspaceMember } from './types';

/**
 * Permission checking utilities for workspace and team access control
 */

export type Permission = 
  | 'workspace:view'
  | 'workspace:edit'
  | 'workspace:manage_members'
  | 'workspace:delete'
  | 'team:view'
  | 'team:edit'
  | 'team:manage_members'
  | 'team:delete';

/**
 * Permission matrix for workspace roles
 */
const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: [
    'workspace:view',
    'workspace:edit',
    'workspace:manage_members',
    'workspace:delete',
    'team:view',
    'team:edit',
    'team:manage_members',
    'team:delete'
  ],
  EDITOR: [
    'workspace:view',
    'workspace:edit',
    'team:view',
    'team:edit'
  ],
  VIEWER: [
    'workspace:view',
    'team:view'
  ]
};

/**
 * Permission matrix for team roles
 */
const TEAM_PERMISSIONS: Record<TeamRole, Permission[]> = {
  LEADER: [
    'team:view',
    'team:edit',
    'team:manage_members'
  ],
  EDITOR: [
    'team:view',
    'team:edit'
  ],
  VIEWER: [
    'team:view'
  ]
};

/**
 * Check if a user has a specific workspace permission
 */
export function hasWorkspacePermission(
  userRole: WorkspaceRole | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  return WORKSPACE_PERMISSIONS[userRole]?.includes(permission) || false;
}

/**
 * Check if a user has a specific team permission
 */
export function hasTeamPermission(
  workspaceRole: WorkspaceRole | undefined,
  teamRole: TeamRole | undefined,
  permission: Permission
): boolean {
  // Workspace owners have all permissions
  if (workspaceRole === 'OWNER') {
    return true;
  }
  
  // Check workspace-level permissions first
  if (workspaceRole && WORKSPACE_PERMISSIONS[workspaceRole]?.includes(permission)) {
    return true;
  }
  
  // Check team-level permissions
  if (teamRole && TEAM_PERMISSIONS[teamRole]?.includes(permission)) {
    return true;
  }
  
  return false;
}

/**
 * Get user's role in a workspace
 */
export function getUserWorkspaceRole(
  workspaceMembers: WorkspaceMember[] | undefined,
  userId: string | undefined,
  ownerId: string | undefined
): WorkspaceRole | undefined {
  if (!userId) return undefined;
  
  // Owner check
  if (ownerId === userId) return 'OWNER';
  
  // Check members array
  const member = workspaceMembers?.find(m => m.id === userId);
  return member?.role;
}

/**
 * Check if a user is the workspace owner
 */
export function isWorkspaceOwner(
  ownerId: string | undefined,
  userId: string | undefined
): boolean {
  return !!ownerId && !!userId && ownerId === userId;
}

/**
 * Check if a user can view workspace
 */
export function canViewWorkspace(
  workspaceMembers: WorkspaceMember[] | undefined,
  userId: string | undefined,
  ownerId: string | undefined
): boolean {
  const role = getUserWorkspaceRole(workspaceMembers, userId, ownerId);
  return hasWorkspacePermission(role, 'workspace:view');
}

/**
 * Check if a user can edit workspace
 */
export function canEditWorkspace(
  workspaceMembers: WorkspaceMember[] | undefined,
  userId: string | undefined,
  ownerId: string | undefined
): boolean {
  const role = getUserWorkspaceRole(workspaceMembers, userId, ownerId);
  return hasWorkspacePermission(role, 'workspace:edit');
}

/**
 * Check if a user can manage workspace members
 */
export function canManageWorkspaceMembers(
  ownerId: string | undefined,
  userId: string | undefined
): boolean {
  return isWorkspaceOwner(ownerId, userId);
}
