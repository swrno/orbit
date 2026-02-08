import { useAppStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'GUEST';

interface Permissions {
  role: UserRole;
  canEdit: boolean;
  canManageAccess: boolean;
  isReadOnly: boolean;
  isOwner: boolean;
}

export function usePermissions(workspaceId?: string, teamId?: string): Permissions {
  const { user } = useAuth();
  const { workspaces } = useAppStore();

  return useMemo(() => {
    if (!user || !workspaceId) {
      return {
        role: 'VIEWER',
        canEdit: false,
        canManageAccess: false,
        isReadOnly: true,
        isOwner: false,
      };
    }

    const workspace = workspaces.find((w) => w.id === workspaceId);

    if (!workspace) {
      return {
        role: 'VIEWER',
        canEdit: false,
        canManageAccess: false,
        isReadOnly: true,
        isOwner: false,
      };
    }

    // Check workspace level role
    const isWorkspaceOwner = workspace.ownerId === user.uid;
    const workspaceMember = workspace.members?.find((m) => m.id === user.uid);
    let role: UserRole = isWorkspaceOwner ? 'OWNER' : (workspaceMember?.role as UserRole) || 'VIEWER';

    // If teamId is provided, check team level role overrides
    // In this model, team roles might be stricter or grant specific access
    // For now, we'll assume workspace role is the baseline, and team leader adds management rights for that team
    let isTeamLeader = false;
    if (teamId && workspace.teams) {
      const team = workspace.teams.find((t) => t.id === teamId);
      // We need to check finding the member in the team if we have a team member list separate from workspace
      // But typically "Leader" status is what we care about for "canManageAccess" in a team context
        
       // Use a loose check if the team object has a leaderId field (it might not be typed yet in all places)
       // cast to any to avoid TS errors if the type isn't fully updated in store.ts yet
       if (team && (team as any).leaderId === user.uid) {
           isTeamLeader = true;
       }
    }

    // Refine permissions based on Role
    let canEdit = false;
    let canManageAccess = false;
    let isReadOnly = true;

    if (role === 'OWNER') {
      canEdit = true;
      canManageAccess = true;
      isReadOnly = false;
    } else if (role === 'ADMIN') { // If we have an ADMIN role
        canEdit = true;
        canManageAccess = true;
        isReadOnly = false;
    } else if (role === 'EDITOR') {
      canEdit = true;
      canManageAccess = false; // Editors cannot manage access
      isReadOnly = false;
    } else {
      // VIEWER or GUEST
      canEdit = false;
      canManageAccess = false;
      isReadOnly = true;
    }

    // Team Leader Override within the context of a Team
    if (teamId && isTeamLeader) {
        canManageAccess = true; // Leaders can manage their team
        canEdit = true; // Leaders can edit their team
        isReadOnly = false;
    }

    return {
      role,
      canEdit,
      canManageAccess,
      isReadOnly,
      isOwner: isWorkspaceOwner,
    };
  }, [user, workspaceId, teamId, workspaces]);
}
