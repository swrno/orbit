import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sprint from '@/lib/models/Sprint';

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

    // Fetch filtered sprints
    const sprints = await Sprint.find(query).sort({ sprintStartDate: -1 });

    return NextResponse.json({
      success: true,
      data: sprints
    });
  } catch (error: any) {
    console.error('GET /api/sprints error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.sprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint name is required' },
        { status: 400 }
      );
    }

    if (!body.sprintStartDate || !body.sprintEndDate) {
      return NextResponse.json(
        { success: false, error: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    if (!body.workspaceId || !body.pageId) {
      return NextResponse.json(
        { success: false, error: 'Workspace ID and Page ID are required' },
        { status: 400 }
      );
    }

    if (!body.teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Create sprint object matching the Mongoose schema
    const sprintData = {
      sprint: body.sprint,
      sprintGoals: body.sprintGoals || '',
      activeSprintStatus: body.activeSprintStatus || 'Planned',
      sprintStartDate: new Date(body.sprintStartDate),
      sprintEndDate: new Date(body.sprintEndDate),
      // Populate sprintTimeline redundantly as per schema requirement
      sprintTimeline: {
        start: new Date(body.sprintStartDate),
        end: new Date(body.sprintEndDate)
      },
      connectedTasks: [],
      completed: body.activeSprintStatus === 'Completed',
      workspaceId: body.workspaceId,
      teamId: body.teamId,
      pageId: body.pageId,
      owner: body.owner || {
        id: '1',
        name: 'System',
        email: 'system@orbit.com'
      }
    };

    const newSprint = await Sprint.create(sprintData);

    return NextResponse.json({
      success: true,
      data: newSprint,
      message: 'Sprint created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/sprints error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create sprint' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id && !body.id) {
        return NextResponse.json(
            { success: false, error: 'Sprint ID is required for update' },
            { status: 400 }
        );
    }

    const sprintId = body._id || body.id;
    
    // Update logic...
    const updatedSprint = await Sprint.findByIdAndUpdate(
        sprintId,
        { $set: body },
        { new: true } // Return updated document
    );

    if (!updatedSprint) {
        return NextResponse.json(
            { success: false, error: 'Sprint not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        data: updatedSprint,
        message: 'Sprint updated successfully'
    });

  } catch (error: any) {
    console.error('PUT /api/sprints error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sprint' },
      { status: 500 }
    );
  }
}
