import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Bug from '@/lib/models/Bug';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const pageId = searchParams.get('pageId');
    const group = searchParams.get('group');
    const teamId = searchParams.get('teamId');

    let query: any = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (pageId) query.pageId = pageId;
    if (teamId) query.teamId = teamId;
    if (group) query.group = group;

    const bugs = await Bug.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bugs,
      count: bugs.length
    });
  } catch (error: any) {
    console.error('GET /api/bugs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bugs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.bug) {
      return NextResponse.json(
        { success: false, error: 'Bug description is required' },
        { status: 400 }
      );
    }

    if (!body.reporter || !body.reporter.id || !body.reporter.name) {
      return NextResponse.json(
        { success: false, error: 'Reporter information is required' },
        { status: 400 }
      );
    }

    if (!body.workspaceId || !body.pageId) {
      return NextResponse.json(
        { success: false, error: 'Workspace ID and Page ID are required' },
        { status: 400 }
      );
    }

    // Generate bug ID if not provided - using UUID as requested to prevent collisions
    if (!body.bugId) {
      body.bugId = crypto.randomUUID();
    }

    if (!body.teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const bug = await Bug.create(body);

    return NextResponse.json({
      success: true,
      data: bug,
      message: 'Bug created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/bugs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create bug' },
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
        { success: false, error: 'Bug ID is required' },
        { status: 400 }
      );
    }

    const bug = await Bug.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!bug) {
      return NextResponse.json(
        { success: false, error: 'Bug not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bug,
      message: 'Bug updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/bugs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update bug' },
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
        { success: false, error: 'Bug ID is required' },
        { status: 400 }
      );
    }

    const bug = await Bug.findByIdAndDelete(id);

    if (!bug) {
      return NextResponse.json(
        { success: false, error: 'Bug not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
      message: 'Bug deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/bugs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete bug' },
      { status: 500 }
    );
  }
}
