import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API route to serve lesson content from _text_content directory
 * GET /api/lessons/[filename]
 */
export async function GET(request, { params }) {
  try {
    const { filename } = await params;

    // Validate filename (security: prevent directory traversal)
    if (!filename || filename.includes('..') || !filename.endsWith('.md')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Construct the path to the lesson file
    const lessonsDir = path.join(process.cwd(), '_text_content');
    const filePath = path.join(lessonsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Return the content as plain text
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error serving lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
