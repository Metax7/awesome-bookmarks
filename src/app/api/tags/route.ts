import { NextResponse } from 'next/server';
import { bookmarkOperations } from '@/lib/db/operations';

export async function GET() {
  try {
    const tags = await bookmarkOperations.getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}