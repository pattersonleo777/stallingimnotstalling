import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const topPlayers = await prisma.user.findMany({
      take: 10,
      orderBy: [
        { score: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        score: true,
        _count: {
          select: { models: true }
        }
      }
    });

    return NextResponse.json(topPlayers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
