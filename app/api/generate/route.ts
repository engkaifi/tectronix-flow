import { NextRequest, NextResponse } from 'next/server';
import { generateProject } from '@/lib/core';
export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea || typeof idea !== 'string') return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    return NextResponse.json(generateProject(idea));
  } catch {
    return NextResponse.json({ error: 'Failed to generate project' }, { status: 500 });
  }
}
