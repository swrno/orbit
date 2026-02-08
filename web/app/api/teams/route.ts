import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import { getAuthUser } from '@/lib/auth-middleware';
import { canEditWorkspace } from '@/lib/permissions';

/**
 * Create a new team in a workspace
 */
// Create a new team in a workspace
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, title, icon = 'Users', leaderId, leaderEmail, leaderName } = body;

        if (!workspaceId || !title) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID and team title are required' },
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

        // Check permissions - owner or editor can create teams
        const canEdit = canEditWorkspace(workspace.members, currentUserId, workspace.ownerId);
        if (!canEdit) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only owners and editors can create teams.' },
                { status: 403 }
            );
        }

        // Create initial member (Leader)
        const initialMember = {
            id: leaderId || currentUserId,
            name: leaderName || 'Team Leader',
            email: leaderEmail || '',
            role: 'LEADER',
            addedAt: new Date()
        };

        // Create new team
        const timestamp = Date.now();
        const newTeam = {
            id: `team-${timestamp}`,
            title,
            icon,
            leaderId: initialMember.id,
            members: [initialMember],
            bugs: [],
            tasks: [],
            epics: [],
            sprints: [],
            retrospectives: [],
            pages: [
                { id: `p-${timestamp}-1`, title: 'Bugs Queue', type: 'table', icon: 'Bug', views: ['table'], activeViewIndex: 0 },
                { id: `p-${timestamp}-2`, title: 'Retrospectives', type: 'table', icon: 'RotateCcw', views: ['table'], activeViewIndex: 0 },
                { id: `p-${timestamp}-3`, title: 'Tasks', type: 'table', icon: 'CheckSquare', views: ['table'], activeViewIndex: 0 },
                { id: `p-${timestamp}-4`, title: 'Sprints', type: 'table', icon: 'Rabbit', views: ['table'], activeViewIndex: 0 },
                { id: `p-${timestamp}-5`, title: 'Epics', type: 'table', icon: 'Layers', views: ['table'], activeViewIndex: 0 },
                {
                    id: `p-${timestamp}-6`,
                    title: 'Getting Started',
                    type: 'document',
                    icon: 'FileText',
                    content: `<h1>Welcome to ${title}! 🎉</h1><p>This is your team's workspace.</p>`
                },
                {
                    id: `p-${timestamp}-7`,
                    title: 'Team Access',
                    type: 'team-access',
                    icon: 'Shield',
                    content: `<h1>Team Access Management</h1><p>Manage team member access and permissions.</p>`
                },
            ]
        };

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { id: workspaceId },
            { $push: { teams: newTeam } },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedWorkspace,
            message: 'Team created successfully',
            teamId: newTeam.id
        }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/teams error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create team' },
            { status: 500 }
        );
    }
}

/**
 * Update a team
 */
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, teamId, ...updates } = body;

        if (!workspaceId || !teamId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID and team ID are required' },
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

        // Check permissions - owner or editor can update teams
        const canEdit = canEditWorkspace(workspace.members, currentUserId, workspace.ownerId);
        if (!canEdit) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only owners and editors can update teams.' },
                { status: 403 }
            );
        }

        // Find and update the team
        const team = workspace.teams?.find((t: any) => t.id === teamId);
        if (!team) {
            return NextResponse.json(
                { success: false, error: 'Team not found' },
                { status: 404 }
            );
        }

        // Update team properties
        Object.assign(team, updates);
        await workspace.save();

        return NextResponse.json({
            success: true,
            data: workspace,
            message: 'Team updated successfully'
        });
    } catch (error: any) {
        console.error('PUT /api/teams error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update team' },
            { status: 500 }
        );
    }
}

/**
 * Delete a team
 */
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const teamId = searchParams.get('teamId');

        if (!workspaceId || !teamId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID and team ID are required' },
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

        // Check permissions - only owner can delete teams
        if (workspace.ownerId !== currentUserId) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner can delete teams.' },
                { status: 403 }
            );
        }

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { id: workspaceId },
            { $pull: { teams: { id: teamId } } },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedWorkspace,
            message: 'Team deleted successfully'
        });
    } catch (error: any) {
        console.error('DELETE /api/teams error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete team' },
            { status: 500 }
        );
    }
}
