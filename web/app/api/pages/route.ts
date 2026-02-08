import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import { getAuthUser } from '@/lib/auth-middleware';
import { canEditWorkspace } from '@/lib/permissions';

export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, teamId, pageId, updates } = body;

        if (!workspaceId || !teamId || !pageId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, Team ID, and Page ID are required' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid;

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

        // Check permissions - owner or editor can update pages
        const canEdit = canEditWorkspace(workspace.members, currentUserId, workspace.ownerId);
        if (!canEdit) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only owners and editors can update pages.' },
                { status: 403 }
            );
        }

        // Find the team
        // Note: We need to handle nested teams if that's a feature, but for now assuming flat structure based on provided models
        // Actually, the model shows recursive teams support, but let's stick to first level for now or do a recursive search?
        // Let's implement a recursive search/update helper since the model supports nested teams.
        
        let found = false;
        
        const updatePageInTeam = (teams: any[]) => {
            for (const team of teams) {
                if (team.id === teamId) {
                     const page = team.pages.find((p: any) => p.id === pageId);
                     if (page) {
                         Object.assign(page, updates);
                         found = true;
                         return true;
                     }
                }
                
                if (team.teams && team.teams.length > 0) {
                    if (updatePageInTeam(team.teams)) {
                        return true;
                    }
                }
            }
            return false;
        };

        updatePageInTeam(workspace.teams);

        if (!found) {
            return NextResponse.json(
                { success: false, error: 'Page or Team not found' },
                { status: 404 }
            );
        }

        workspace.markModified('teams');
        await workspace.save();

        return NextResponse.json({
            success: true,
            message: 'Page updated successfully'
        });

    } catch (error: any) {
        console.error('PUT /api/pages error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update page' },
            { status: 500 }
        );
    }
}
