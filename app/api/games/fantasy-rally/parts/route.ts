import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        parts: true,
      },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const parts = user.parts.map(part => ({
      id: part.id,
      name: part.name,
      type: part.type,
      rarity: part.rarity,
      imageUrl: part.imageUrl,
      statBoosts: JSON.parse(part.statBoosts),
      unlockLevel: part.unlockLevel,
      price: part.price,
    }));

    return NextResponse.json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, rarity, imageUrl, statBoosts, unlockLevel, price } = body;

    const part = await prisma.part.create({
      data: {
        name,
        type,
        rarity: rarity || 'common',
        imageUrl,
        statBoosts: JSON.stringify(statBoosts || {}),
        unlockLevel: unlockLevel || 1,
        price: price || 100,
        userId: user.id,
      },
    });

    return NextResponse.json(part);
  } catch (error) {
    console.error('Error creating part:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
