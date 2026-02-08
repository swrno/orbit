import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const currentUserId = authUser?.uid || userId;

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Find workspaces where user is owner or member
        const workspaces = await Workspace.find({
            $or: [
                { ownerId: currentUserId },
                { "members.id": currentUserId },
                { "teamMembers.id": currentUserId } // Backward compatibility
            ]
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: workspaces,
            count: workspaces.length
        });
    } catch (error: any) {
        console.error('GET /api/workspaces error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const creatorId = authUser?.uid || body.creatorId;
        const creatorEmail = authUser?.email || body.creatorEmail;
        const creatorName = body.creatorName || creatorEmail?.split('@')[0] || 'Unknown';

        if (!creatorId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        if (!body.title) {
            return NextResponse.json(
                { success: false, error: 'Workspace title is required' },
                { status: 400 }
            );
        }

        // Generate ID if not provided
        if (!body.id) {
            body.id = `ws-${Date.now()}`;
        }

        // Ensure key exists
        if (!body.key) {
            body.key = body.title.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4) || 'PROJ';
        }

        // Set name to title if not provided (name is required by schema)
        if (!body.name) {
            body.name = body.title;
        }

        // Set creator as owner
        body.ownerId = creatorId;

        // Initialize members array with owner
        if (!body.members) {
            body.members = [];
        }

        // Add owner to members if not already there
        const ownerInMembers = body.members.find((m: any) => m.id === creatorId);
        if (!ownerInMembers) {
            body.members.push({
                id: creatorId,
                name: creatorName,
                email: creatorEmail,
                role: 'OWNER',
                addedAt: new Date()
            });
        }

        // Ensure default structure if missing
        if (!body.teams) {
            const timestamp = Date.now();
            body.teams = [{
                id: `g-${timestamp}`,
                title: 'Team',
                icon: 'Users',
                members: [],
                bugs: [],
                tasks: [],
                epics: [],
                sprints: [],
                retrospectives: [],
                pages: [
                    { id: `p-${timestamp}-1`, title: 'Bugs Queue', type: 'table', icon: 'Bug', views: ['table', 'board', 'gantt', 'calendar', 'chart'], activeViewIndex: 0 },
                    { id: `p-${timestamp}-2`, title: 'Retrospectives', type: 'table', icon: 'RotateCcw', views: ['table', 'board', 'gantt', 'calendar', 'chart'], activeViewIndex: 0 },
                    { id: `p-${timestamp}-3`, title: 'Tasks', type: 'table', icon: 'CheckSquare', views: ['table', 'board', 'gantt', 'calendar', 'chart'], activeViewIndex: 0 },
                    { id: `p-${timestamp}-4`, title: 'Sprints', type: 'table', icon: 'Rabbit', views: ['table', 'board', 'gantt', 'calendar', 'chart'], activeViewIndex: 0 },
                    { id: `p-${timestamp}-5`, title: 'Epics', type: 'table', icon: 'Layers', views: ['table', 'board', 'gantt', 'calendar', 'chart'], activeViewIndex: 0 },
                    {
                        id: `p-${timestamp}-6`,
                        title: 'Getting Started',
                        type: 'document',
                        icon: 'FileText',
                        content: `<h1>Welcome to ${body.title}! 🎉</h1><p>This is your team's workspace.</p>`
                    },
                    {
                        id: `p-${timestamp}-7`,
                        title: 'Team Access',
                        type: 'document',
                        icon: 'Shield',
                        pageType: 'team-access',
                        content: `<h1>Team Access Management</h1><p>Manage team member access and permissions.</p>`
                    },
                ]
            }];
        }

        // Ensure backward compatibility with teamMembers
        if (!body.teamMembers) {
            body.teamMembers = [];
        }

        const workspace = await Workspace.create(body);

        // Create or update user profile
        if (creatorEmail) {
            await User.findOneAndUpdate(
                { id: creatorId },
                {
                    id: creatorId,
                    email: creatorEmail,
                    name: creatorName
                },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({
            success: true,
            data: workspace,
            message: 'Workspace created successfully'
        }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID already exists' },
                { status: 400 }
            );
        }
        console.error('POST /api/workspaces error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create workspace' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const authUser = await getAuthUser(request);
        const userId = authUser?.uid || body.userId;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User authentication required' },
                { status: 401 }
            );
        }

        // Find the workspace
        const workspace = await Workspace.findOne({ id });

        if (!workspace) {
            return NextResponse.json(
                { success: false, error: 'Workspace not found' },
                { status: 404 }
            );
        }

        // Check permissions - only owner or editor can update
        const isOwner = workspace.ownerId === userId;
        const member = workspace.members?.find((m: any) => m.id === userId);
        const canEdit = isOwner || member?.role === 'EDITOR';

        if (!canEdit) {
            return NextResponse.json(
                { success: false, error: 'Permission denied. Only owners and editors can update workspace.' },
                { status: 403 }
            );
        }

        // Prevent changing owner through update
        if (updates.ownerId && updates.ownerId !== workspace.ownerId && !isOwner) {
            return NextResponse.json(
                { success: false, error: 'Only workspace owner can change ownership' },
                { status: 403 }
            );
        }

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { id: id },
            { $set: updates },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedWorkspace
        });
    } catch (error: any) {
        console.error('PUT /api/workspaces error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update workspace' },
            { status: 500 }
        );
    }
}
