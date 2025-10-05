import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Input validation schema
const generateSchema = z.object({
  name: z.string().min(3),
  cuisine: z.string().min(1),
  dishType: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const data = generateSchema.parse(body);
    
    // This is a stub implementation
    // In a real implementation, this would:
    // 1. Call an LLM to generate a recipe based on the inputs
    // 2. Store the resulting recipe
    
    // For now, just return a mock ID
    const id = uuidv4();
    
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { message: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}