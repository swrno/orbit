import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth-middleware';
import { canManageWorkspaceMembers } from '@/lib/permissions';

/**
 * Add a member to workspace
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, userId, name, email, role = 'VIEWER', avatar } = body;

        if (!workspaceId || !userId || !name || !email) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, user ID, name, and email are required' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['OWNER', 'EDITOR', 'VIEWER'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role. Must be OWNER, EDITOR, or VIEWER' },
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

        // Check permissions - only owner can add members
        if (!canManageWorkspaceMembers(workspace.ownerId, currentUserId)) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner can add members.' },
                { status: 403 }
            );
        }

        // Check if member already exists
        const existingMember = workspace.members?.find((m: any) => m.id === userId);
        if (existingMember) {
            return NextResponse.json(
                { success: false, error: 'User is already a member of this workspace' },
                { status: 400 }
            );
        }

        // Prevent adding another owner
        if (role === 'OWNER' && workspace.ownerId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Cannot add another owner. Transfer ownership instead.' },
                { status: 400 }
            );
        }

        // Add member
        const newMember = {
            id: userId,
            name,
            email,
            avatar,
            role,
            addedAt: new Date()
        };

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { id: workspaceId },
            {
                $push: { members: newMember },
                $addToSet: { teamMembers: { id: userId, name, email, avatar, role } } // Backward compatibility
            },
            { new: true }
        );

        // Create or update user profile
        await User.findOneAndUpdate(
            { id: userId },
            {
                id: userId,
                email,
                name,
                avatar
            },
            { upsert: true, new: true }
        );

        // Auto-add to all teams with the same role
        if (updatedWorkspace?.teams) {
            for (const team of updatedWorkspace.teams) {
                const teamMemberExists = team.members?.some((m: any) => m.id === userId);
                if (!teamMemberExists) {
                    team.members = team.members || [];
                    team.members.push({
                        id: userId,
                        name,
                        email,
                        avatar,
                        teamRole: role === 'OWNER' ? 'LEADER' : role === 'EDITOR' ? 'EDITOR' : 'VIEWER'
                    });
                }
            }
            await updatedWorkspace.save();
        }

        return NextResponse.json({
            success: true,
            data: updatedWorkspace,
            message: 'Member added successfully'
        });
    } catch (error: any) {
        console.error('POST /api/workspaces/members error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to add member' },
            { status: 500 }
        );
    }
}

/**
 * Update a member's role
 */
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, userId, role } = body;

        if (!workspaceId || !userId || !role) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, user ID, and role are required' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['OWNER', 'EDITOR', 'VIEWER'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role. Must be OWNER, EDITOR, or VIEWER' },
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

        // Check permissions - only owner can update member roles
        if (!canManageWorkspaceMembers(workspace.ownerId, currentUserId)) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner can update member roles.' },
                { status: 403 }
            );
        }

        // Cannot change owner's role
        if (workspace.ownerId === userId) {
            return NextResponse.json(
                { success: false, error: 'Cannot change owner\'s role. Transfer ownership instead.' },
                { status: 400 }
            );
        }

        // Update member role
        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { id: workspaceId, "members.id": userId },
            {
                $set: { "members.$.role": role }
            },
            { new: true }
        );

        if (!updatedWorkspace) {
            return NextResponse.json(
                { success: false, error: 'Member not found in workspace' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedWorkspace,
            message: 'Member role updated successfully'
        });
    } catch (error: any) {
        console.error('PUT /api/workspaces/members error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update member' },
            { status: 500 }
        );
    }
}

/**
 * Remove a member from workspace
 */
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const userId = searchParams.get('userId');

        if (!workspaceId || !userId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID and user ID are required' },
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

        // Check permissions - only owner can remove members
        if (!canManageWorkspaceMembers(workspace.ownerId, currentUserId)) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only workspace owner can remove members.' },
                { status: 403 }
            );
        }

        // Cannot remove owner
        if (workspace.ownerId === userId) {
            return NextResponse.json(
                { success: false, error: 'Cannot remove workspace owner' },
                { status: 400 }
            );
        }

        // Remove member
        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { id: workspaceId },
            {
                $pull: {
                    members: { id: userId },
                    teamMembers: { id: userId } // Backward compatibility
                }
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedWorkspace,
            message: 'Member removed successfully'
        });
    } catch (error: any) {
        console.error('DELETE /api/workspaces/members error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to remove member' },
            { status: 500 }
        );
    }
}
