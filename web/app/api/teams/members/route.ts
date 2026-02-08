import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import { getAuthUser } from '@/lib/auth-middleware';

/**
 * Add a member to a team
 * When a member is added to a team, they should also be added to workspace with VIEW access if not already present
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, teamId, userId, name, email, teamRole = 'MEMBER', avatar } = body;

        if (!workspaceId || !teamId || !userId || !name || !email) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, team ID, user ID, name, and email are required' },
                { status: 400 }
            );
        }

        // Validate team role
        if (!['LEADER', 'MEMBER', 'VIEWER'].includes(teamRole)) {
            return NextResponse.json(
                { success: false, error: 'Invalid team role. Must be LEADER, MEMBER, or VIEWER' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid || body.currentUserId;

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        // Find workspace
        const workspace = await Workspace.findOne({ id: workspaceId });

        if (!workspace) {
            return NextResponse.json(
                { success: false, error: 'Workspace not found' },
                { status: 404 }
            );
        }

        // Find the team
        const team = workspace.teams?.find((t: any) => t.id === teamId);
        if (!team) {
            return NextResponse.json(
                { success: false, error: 'Team not found' },
                { status: 404 }
            );
        }

        // Check permissions - workspace owner or team leader can add members
        const isOwner = workspace.ownerId === currentUserId;
        const isTeamLeader = team.leaderId === currentUserId;

        if (!isOwner && !isTeamLeader) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner or team leader can add team members.' },
                { status: 403 }
            );
        }

        // Check if member already in team
        const existingMember = team.members?.find((m: any) => m.id === userId);
        if (existingMember) {
            return NextResponse.json(
                { success: false, error: 'User is already a member of this team' },
                { status: 400 }
            );
        }

        // Add member to team
        const newTeamMember = {
            id: userId,
            name,
            email,
            avatar,
            teamRole
        };

        team.members = team.members || [];
        team.members.push(newTeamMember);

        // Add to workspace with VIEWER role if not already a workspace member
        const workspaceMember = workspace.members?.find((m: any) => m.id === userId);
        if (!workspaceMember) {
            workspace.members = workspace.members || [];
            workspace.members.push({
                id: userId,
                name,
                email,
                avatar,
                role: 'VIEWER', // Default to VIEWER when added via team
                addedAt: new Date()
            });
        }

        await workspace.save();

        return NextResponse.json({
            success: true,
            data: workspace,
            message: 'Team member added successfully'
        });
    } catch (error: any) {
        console.error('POST /api/teams/members error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to add team member' },
            { status: 500 }
        );
    }
}

/**
 * Update a team member's role
 */
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, teamId, userId, teamRole } = body;

        if (!workspaceId || !teamId || !userId || !teamRole) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, team ID, user ID, and team role are required' },
                { status: 400 }
            );
        }

        // Validate team role
        if (!['LEADER', 'MEMBER', 'VIEWER'].includes(teamRole)) {
            return NextResponse.json(
                { success: false, error: 'Invalid team role. Must be LEADER, MEMBER, or VIEWER' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid || body.currentUserId;

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        // Find workspace
        const workspace = await Workspace.findOne({ id: workspaceId });

        if (!workspace) {
            return NextResponse.json(
                { success: false, error: 'Workspace not found' },
                { status: 404 }
            );
        }

        // Find the team
        const team = workspace.teams?.find((t: any) => t.id === teamId);
        if (!team) {
            return NextResponse.json(
                { success: false, error: 'Team not found' },
                { status: 404 }
            );
        }

        // Check permissions - workspace owner or team leader can update member roles
        const isOwner = workspace.ownerId === currentUserId;
        const isTeamLeader = team.leaderId === currentUserId;

        if (!isOwner && !isTeamLeader) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner or team leader can update team member roles.' },
                { status: 403 }
            );
        }

        // Find and update the member
        const member = team.members?.find((m: any) => m.id === userId);
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Member not found in team' },
                { status: 404 }
            );
        }

        member.teamRole = teamRole;
        await workspace.save();

        return NextResponse.json({
            success: true,
            data: workspace,
            message: 'Team member role updated successfully'
        });
    } catch (error: any) {
        console.error('PUT /api/teams/members error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update team member' },
            { status: 500 }
        );
    }
}

/**
 * Remove a member from a team
 */
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const teamId = searchParams.get('teamId');
        const userId = searchParams.get('userId');

        if (!workspaceId || !teamId || !userId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, team ID, and user ID are required' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid || searchParams.get('currentUserId');

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        // Find workspace
        const workspace = await Workspace.findOne({ id: workspaceId });

        if (!workspace) {
            return NextResponse.json(
                { success: false, error: 'Workspace not found' },
                { status: 404 }
            );
        }

        // Find the team
        const team = workspace.teams?.find((t: any) => t.id === teamId);
        if (!team) {
            return NextResponse.json(
                { success: false, error: 'Team not found' },
                { status: 404 }
            );
        }

        // Check permissions - workspace owner or team leader can remove members
        const isOwner = workspace.ownerId === currentUserId;
        const isTeamLeader = team.leaderId === currentUserId;

        if (!isOwner && !isTeamLeader) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner or team leader can remove team members.' },
                { status: 403 }
            );
        }

        // Remove member from team
        team.members = team.members?.filter((m: any) => m.id !== userId) || [];
        await workspace.save();

        return NextResponse.json({
            success: true,
            data: workspace,
            message: 'Team member removed successfully'
        });
    } catch (error: any) {
        console.error('DELETE /api/teams/members error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to remove team member' },
            { status: 500 }
        );
    }
}
