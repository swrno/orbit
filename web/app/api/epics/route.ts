import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Epic from '@/lib/models/Epic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const pageId = searchParams.get('pageId');
    const phase = searchParams.get('phase');
    const teamId = searchParams.get('teamId');

    let query: any = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (pageId) query.pageId = pageId;
    if (teamId) query.teamId = teamId;
    if (phase) query.phase = phase;

    const epics = await Epic.find(query).sort({ hierarchy: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: epics,
      count: epics.length
    });
  } catch (error: any) {
    console.error('GET /api/epics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch epics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Validate required fields
    if (!body.epic) {
      return NextResponse.json(
        { success: false, error: 'Epic name is required' },
        { status: 400 }
      );
    }

    if (!body.owner || !body.owner.id || !body.owner.name) {
      return NextResponse.json(
        { success: false, error: 'Owner information is required' },
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

    const epic = await Epic.create(body);

    return NextResponse.json({
      success: true,
      data: epic,
      message: 'Epic created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/epics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create epic' },
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
        { success: false, error: 'Epic ID is required' },
        { status: 400 }
      );
    }

    const epic = await Epic.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!epic) {
      return NextResponse.json(
        { success: false, error: 'Epic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: epic,
      message: 'Epic updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/epics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update epic' },
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
        { success: false, error: 'Epic ID is required' },
        { status: 400 }
      );
    }

    const epic = await Epic.findByIdAndDelete(id);

    if (!epic) {
      return NextResponse.json(
        { success: false, error: 'Epic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
      message: 'Epic deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/epics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete epic' },
      { status: 500 }
    );
  }
}
