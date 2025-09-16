import { NextRequest, NextResponse } from 'next/server';
import { bookmarkOperations } from '@/lib/db/operations';
import { bookmarkSchema, searchSchema, paginationSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('search') || searchParams.get('query');
    const categoryId = searchParams.get('categoryId');
    const tags = searchParams.getAll('tags').filter(Boolean);
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'title' | 'url' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // If search parameters are provided, use search
    if (query || categoryId || tags?.length || sortBy) {
      const searchFilters = searchSchema.parse({
        query: query || undefined,
        categoryId: categoryId || undefined,
        tags: tags || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });

      const paginationOptions = paginationSchema.parse({ page, limit });
      const result = await bookmarkOperations.search(searchFilters, paginationOptions);
      return NextResponse.json(result);
    }

    // Otherwise, get all bookmarks
    const bookmarks = await bookmarkOperations.getAll();
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookmarkSchema.parse(body);
    
    const id = await bookmarkOperations.create({
      ...validatedData,
      title: validatedData.title || 'Untitled',
    });
    const bookmark = await bookmarkOperations.getById(id);
    
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}