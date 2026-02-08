import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const pageId = searchParams.get('pageId');
    const teamId = searchParams.get('teamId');

    // Build query object
    const query: any = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (pageId) query.pageId = pageId;
    if (teamId) query.teamId = teamId;
    
    // Add sprint and group filtering
    const sprint = searchParams.get('sprint');
    const group = searchParams.get('group');
    if (sprint) query.sprint = sprint;
    if (group) query.group = group;

    // Fetch filtered tasks
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.task) {
      return NextResponse.json(
        { success: false, error: 'Task name is required' },
        { status: 400 }
      );
    }

    if (!body.workspaceId || !body.pageId) {
      return NextResponse.json(
        { success: false, error: 'Workspace ID and Page ID are required' },
        { status: 400 }
      );
    }

    // Generate a simple unique taskId
    const prefix = body.key || 'TASK';
    // Find the last task with this prefix globally to ensure uniqueness
    const lastTask = await Task.findOne({ 
        taskId: { $regex: new RegExp(`^${prefix}-\\d+$`) } 
    }).sort({ taskId: -1 }).collation({ locale: "en_US", numericOrdering: true });
    
    let nextId = 1;
    if (lastTask && lastTask.taskId) {
        const parts = lastTask.taskId.split('-');
        if (parts.length > 1) {
            nextId = parseInt(parts[parts.length - 1]) + 1;
        }
    }
    
    const taskId = `${prefix}-${nextId}`;

    if (!body.teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Fetch workspace to check permissions (and get members for assignee lookup)
    const workspace = await (await import('@/lib/models/Workspace')).default.findOne({ workspaceId: body.workspaceId });
    if (!workspace) {
        return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    // Handle Assignee
    let assignee;
    if (body.assigneeId) {
        const member = workspace.members?.find((m: any) => m.id === body.assigneeId);
        if (member) {
            assignee = {
                id: member.id,
                name: member.name,
                email: member.email,
                avatar: member.avatar,
                role: member.role
            };
        }
    }

    const newTask = await Task.create({
      ...body,
      taskId,
      assignee, // Add constructed assignee
      group: body.sprint || body.group || 'Backlog' // Prioritize sprint, then group, then backlog
    });

    return NextResponse.json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { taskId, updates } = body;

    if (!taskId) {
        return NextResponse.json(
            { success: false, error: 'Task ID (MongoDB _id or taskId) is required' },
            { status: 400 }
        );
    }

    // Try to find by MongoDB _id first, then by custom taskId
    let updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $set: updates },
        { new: true }
    );

    if (!updatedTask) {
        // Try finding by custom taskId if _id failed
        updatedTask = await Task.findOneAndUpdate(
            { taskId: taskId },
            { $set: updates },
            { new: true }
        );
    }

    if (!updatedTask) {
        return NextResponse.json(
            { success: false, error: 'Task not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
    });

  } catch (error: any) {
    console.error('PUT /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
             // Try deleting by custom taskId
             await Task.findOneAndDelete({ taskId: id });
        }

        return NextResponse.json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error: any) {
        console.error('DELETE /api/tasks error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}
