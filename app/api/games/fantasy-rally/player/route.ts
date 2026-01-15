import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      // Return default player data for non-authenticated users
      return NextResponse.json({
        id: 'guest',
        name: 'Guest Racer',
        xp: 0,
        level: 1,
        credits: 1000,
        wins: 0,
        losses: 0,
        title: 'Street Novice',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
        credits: true,
        wins: true,
        losses: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        id: 'guest',
        name: 'Guest Racer',
        xp: 0,
        level: 1,
        credits: 1000,
        wins: 0,
        losses: 0,
        title: 'Street Novice',
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({
      id: 'guest',
      name: 'Guest Racer',
      xp: 0,
      level: 1,
      credits: 1000,
      wins: 0,
      losses: 0,
      title: 'Street Novice',
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { xp, credits, wins, losses } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(xp !== undefined && { xp }),
        ...(credits !== undefined && { credits }),
        ...(wins !== undefined && { wins }),
        ...(losses !== undefined && { losses }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
