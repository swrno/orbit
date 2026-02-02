import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (for demo - in production, use a real database)
// This simulates backend behavior while actually using client-side state

export async function GET(request: NextRequest) {
    try {
        // Return success - actual data comes from client-side zustand store
        return NextResponse.json({
            success: true,
            message: 'Workspaces API is operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { success: false, error: 'Title is required' },
                { status: 400 }
            );
        }

        // Create workspace (simulated - actual creation happens client-side)
        const workspace = {
            id: `ws-${Date.now()}`,
            title: body.title,
            plan: body.plan || 'Free',
            createdAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: workspace,
            message: 'Workspace created successfully'
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to create workspace' },
            { status: 500 }
        );
    }
}
