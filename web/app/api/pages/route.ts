import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import { getAuthUser } from '@/lib/auth-middleware';
import { canEditWorkspace } from '@/lib/permissions';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { workspaceId, teamId, title, type } = body;

        if (!workspaceId || !teamId || !title || !type) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, Team ID, Title, and Type are required' },
                { status: 400 }
            );
        }

        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid;

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        const workspace = await Workspace.findOne({ id: workspaceId });
        if (!workspace) {
            return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
        }

        const canEdit = canEditWorkspace(workspace.members, currentUserId, workspace.ownerId);
        if (!canEdit) {
            return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
        }

        const newPageId = `p-${Date.now()}`;
        const newPage = {
            id: newPageId,
            title,
            type,
            columns: [],
            content: '',
            views: [type],
            activeViewIndex: 0
        };

        let teamFound = false;
        const addPageToTeam = (teams: any[]) => {
            for (const team of teams) {
                if (team.id === teamId) {
                    team.pages.push(newPage);
                    teamFound = true;
                    return true;
                }
                if (team.teams && team.teams.length > 0) {
                    if (addPageToTeam(team.teams)) return true;
                }
            }
            return false;
        };

        addPageToTeam(workspace.teams);

        if (!teamFound) {
            return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
        }

        workspace.markModified('teams');
        await workspace.save();

        return NextResponse.json({
            success: true,
            data: newPage,
            message: 'Page created successfully'
        });

    } catch (error: any) {
        console.error('POST /api/pages error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

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

        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid;

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        const workspace = await Workspace.findOne({ id: workspaceId });
        if (!workspace) {
            return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
        }

        const canEdit = canEditWorkspace(workspace.members, currentUserId, workspace.ownerId);
        if (!canEdit) {
            return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
        }

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
                    if (updatePageInTeam(team.teams)) return true;
                }
            }
            return false;
        };

        updatePageInTeam(workspace.teams);

        if (!found) {
            return NextResponse.json({ success: false, error: 'Page or Team not found' }, { status: 404 });
        }

        workspace.markModified('teams');
        await workspace.save();

        return NextResponse.json({
            success: true,
            message: 'Page updated successfully'
        });

    } catch (error: any) {
        console.error('PUT /api/pages error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const teamId = searchParams.get('teamId');
        const pageId = searchParams.get('pageId');

        if (!workspaceId || !teamId || !pageId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, Team ID, and Page ID are required' },
                { status: 400 }
            );
        }

        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid;

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        const workspace = await Workspace.findOne({ id: workspaceId });
        if (!workspace) {
            return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
        }

        const canEdit = canEditWorkspace(workspace.members, currentUserId, workspace.ownerId);
        if (!canEdit) {
            return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
        }

        let found = false;
        const deletePageFromTeam = (teams: any[]) => {
            for (const team of teams) {
                if (team.id === teamId) {
                    const initialLength = team.pages.length;
                    team.pages = team.pages.filter((p: any) => p.id !== pageId);
                    if (team.pages.length < initialLength) {
                        found = true;
                        return true;
                    }
                }
                if (team.teams && team.teams.length > 0) {
                    if (deletePageFromTeam(team.teams)) return true;
                }
            }
            return false;
        };

        deletePageFromTeam(workspace.teams);

        if (!found) {
            return NextResponse.json({ success: false, error: 'Page or Team not found' }, { status: 404 });
        }

        workspace.markModified('teams');
        await workspace.save();

        return NextResponse.json({
            success: true,
            message: 'Page deleted successfully'
        });

    } catch (error: any) {
        console.error('DELETE /api/pages error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
