import { NextRequest, NextResponse } from 'next/server';
import { bookmarkOperations } from '@/lib/db/operations';
import { bookmarkUpdateSchema } from '@/lib/utils/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookmark = await bookmarkOperations.getById(id);
    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = bookmarkUpdateSchema.parse(body);
    
    await bookmarkOperations.update(id, validatedData);
    const bookmark = await bookmarkOperations.getById(id);
    
    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await bookmarkOperations.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}