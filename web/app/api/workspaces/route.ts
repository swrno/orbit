import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/lib/models/Workspace';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query: any = {};
        if (userId) {
            query["teamMembers.id"] = userId;
        }

        const workspaces = await Workspace.find(query).sort({ createdAt: -1 });

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
                        content: `<h1>Welcome to ${body.title}! 🎉</h1><p>This is your team's workspace.</p>`
                    },
                ]
            }];
        }

        const workspace = await Workspace.create(body);

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
        const { id, ...updates } = body; // Expect custom 'id' not '_id' based on schema, but let's see

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        const workspace = await Workspace.findOneAndUpdate(
            { id: id }, // use custom id field
            { $set: updates },
            { new: true }
        );

        if (!workspace) {
            return NextResponse.json(
                { success: false, error: 'Workspace not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: workspace
        });
    } catch (error: any) {
        console.error('PUT /api/workspaces error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update workspace' },
            { status: 500 }
        );
    }
}
