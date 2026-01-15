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
        friendships: {
          where: { status: 'accepted' },
          include: {
            friend: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
        friendOf: {
          where: { status: 'accepted' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // Combine both friendship directions
    const friends = [
      ...user.friendships.map(f => ({
        id: f.friend.id,
        name: f.friend.name || 'Unknown',
        level: f.friend.level,
        status: 'offline' as const, // Would need real-time status tracking
      })),
      ...user.friendOf.map(f => ({
        id: f.user.id,
        name: f.user.name || 'Unknown',
        level: f.user.level,
        status: 'offline' as const,
      })),
    ];

    return NextResponse.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
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
    const { friendId, action } = body;

    if (action === 'send') {
      // Send friend request
      const friendship = await prisma.friendship.create({
        data: {
          userId: user.id,
          friendId,
          status: 'pending',
        },
      });
      return NextResponse.json(friendship);
    }

    if (action === 'accept') {
      // Accept friend request
      const friendship = await prisma.friendship.updateMany({
        where: {
          userId: friendId,
          friendId: user.id,
          status: 'pending',
        },
        data: {
          status: 'accepted',
        },
      });
      return NextResponse.json(friendship);
    }

    if (action === 'decline' || action === 'remove') {
      // Decline or remove friendship
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: user.id, friendId },
            { userId: friendId, friendId: user.id },
          ],
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing friendship:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
