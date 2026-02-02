import { NextRequest, NextResponse } from 'next/server';

// Tasks API - handles task operations

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const sprintId = searchParams.get('sprintId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        // Return success - actual filtering happens client-side
        return NextResponse.json({
            success: true,
            filters: { workspaceId, sprintId, status, priority },
            message: 'Tasks API is operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tasks' },
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

        if (!body.workspaceId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        // Create task (simulated - actual creation happens client-side)
        const task = {
            id: `t-${Date.now()}`,
            title: body.title,
            description: body.description || '',
            status: body.status || 'Todo',
            priority: body.priority || 'Medium',
            owner: body.owner || null,
            sprintId: body.sprintId || 'backlog',
            estimatedPoints: body.estimatedPoints || 0,
            epic: body.epic || null,
            dueDate: body.dueDate || null,
            labels: body.labels || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: task,
            message: 'Task created successfully'
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to create task' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.taskId) {
            return NextResponse.json(
                { success: false, error: 'Task ID is required' },
                { status: 400 }
            );
        }

        // Update task (simulated)
        return NextResponse.json({
            success: true,
            data: {
                id: body.taskId,
                ...body.updates,
                updatedAt: new Date().toISOString()
            },
            message: 'Task updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');

        if (!taskId) {
            return NextResponse.json(
                { success: false, error: 'Task ID is required' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { id: taskId, deleted: true },
            message: 'Task deleted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}
