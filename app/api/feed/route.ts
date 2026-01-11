import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { 
            name: true,
            models: {
              select: { partCount: true }
            }
          } 
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
