import { NextRequest, NextResponse } from 'next/server';
import { categoryOperations } from '@/lib/db/operations';
import { categorySchema } from '@/lib/utils/validation';

export async function GET() {
  try {
    const categories = await categoryOperations.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);
    
    const id = await categoryOperations.create(validatedData);
    const category = await categoryOperations.getById(id);
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}