import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Retrospective from '@/lib/models/Retrospective';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const pageId = searchParams.get('pageId');
    const sprint = searchParams.get('sprint');
    const type = searchParams.get('type');
    const teamId = searchParams.get('teamId');

    let query: any = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (pageId) query.pageId = pageId;
    if (teamId) query.teamId = teamId;
    if (sprint) query.sprint = sprint;
    if (type) query.type = type;

    // Sort by vote (descending) then by creation date
    const retrospectives = await Retrospective.find(query).sort({ vote: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: retrospectives,
      count: retrospectives.length
    });
  } catch (error: any) {
    console.error('GET /api/retrospectives error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch retrospectives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Validate required fields
    if (!body.feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback is required' },
        { status: 400 }
      );
    }

    if (!body.submitter || !body.submitter.id || !body.submitter.name) {
      return NextResponse.json(
        { success: false, error: 'Submitter information is required' },
        { status: 400 }
      );
    }

    if (!body.owner || !body.owner.id || !body.owner.name) {
      return NextResponse.json(
        { success: false, error: 'Owner information is required' },
        { status: 400 }
      );
    }

    if (!body.sprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint is required' },
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

    const retrospective = await Retrospective.create(body);

    return NextResponse.json({
      success: true,
      data: retrospective,
      message: 'Retrospective item created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/retrospectives error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create retrospective' },
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
        { success: false, error: 'Retrospective ID is required' },
        { status: 400 }
      );
    }

    // Special handling for vote increment
    if (updates.incrementVote) {
      delete updates.incrementVote;
      const retrospective = await Retrospective.findByIdAndUpdate(
        id,
        { $inc: { vote: 1 } },
        { new: true }
      );

      if (!retrospective) {
        return NextResponse.json(
          { success: false, error: 'Retrospective not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: retrospective,
        message: 'Vote incremented successfully'
      });
    }

    const retrospective = await Retrospective.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!retrospective) {
      return NextResponse.json(
        { success: false, error: 'Retrospective not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: retrospective,
      message: 'Retrospective updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/retrospectives error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update retrospective' },
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
        { success: false, error: 'Retrospective ID is required' },
        { status: 400 }
      );
    }

    const retrospective = await Retrospective.findByIdAndDelete(id);

    if (!retrospective) {
      return NextResponse.json(
        { success: false, error: 'Retrospective not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
      message: 'Retrospective deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/retrospectives error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete retrospective' },
      { status: 500 }
    );
  }
}
