import { NextRequest, NextResponse } from 'next/server';

// Sprints API - handles sprint operations

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const status = searchParams.get('status'); // 'planning' | 'active' | 'completed'

        return NextResponse.json({
            success: true,
            filters: { workspaceId, status },
            message: 'Sprints API is operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sprints' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { success: false, error: 'Sprint name is required' },
                { status: 400 }
            );
        }

        if (!body.workspaceId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        if (!body.startDate || !body.endDate) {
            return NextResponse.json(
                { success: false, error: 'Start date and end date are required' },
                { status: 400 }
            );
        }

        // Create sprint (simulated)
        const sprint = {
            id: `sprint-${Date.now()}`,
            name: body.name,
            goal: body.goal || null,
            startDate: body.startDate,
            endDate: body.endDate,
            status: 'planning',
            velocity: 0,
            createdAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: sprint,
            message: 'Sprint created successfully'
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to create sprint' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.sprintId) {
            return NextResponse.json(
                { success: false, error: 'Sprint ID is required' },
                { status: 400 }
            );
        }

        // Handle special actions
        if (body.action === 'start') {
            return NextResponse.json({
                success: true,
                data: {
                    id: body.sprintId,
                    status: 'active',
                    startedAt: new Date().toISOString()
                },
                message: 'Sprint started successfully'
            });
        }

        if (body.action === 'complete') {
            return NextResponse.json({
                success: true,
                data: {
                    id: body.sprintId,
                    status: 'completed',
                    velocity: body.velocity || 0,
                    completedAt: new Date().toISOString()
                },
                message: 'Sprint completed successfully'
            });
        }

        // Regular update
        return NextResponse.json({
            success: true,
            data: {
                id: body.sprintId,
                ...body.updates,
                updatedAt: new Date().toISOString()
            },
            message: 'Sprint updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update sprint' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sprintId = searchParams.get('sprintId');

        if (!sprintId) {
            return NextResponse.json(
                { success: false, error: 'Sprint ID is required' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { id: sprintId, deleted: true },
            message: 'Sprint deleted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete sprint' },
            { status: 500 }
        );
    }
}
