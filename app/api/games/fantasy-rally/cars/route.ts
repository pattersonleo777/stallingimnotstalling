import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      // Return empty array for non-authenticated users
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cars: {
          include: {
            installedParts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // Transform car data to match frontend expectations
    const cars = user.cars.map(car => ({
      id: car.id,
      name: car.name,
      make: car.make,
      model: car.model,
      year: car.year,
      imageUrl: car.imageUrl,
      paint: car.paint,
      bodyKit: car.bodyKit,
      wheels: car.wheels,
      raceNumber: car.raceNumber,
      vinylLayers: JSON.parse(car.vinylLayers),
      stats: {
        horsepower: car.horsepower,
        torque: car.torque,
        weight: car.weight,
        grip: car.grip,
        acceleration: car.acceleration,
        topSpeed: car.topSpeed,
      },
      installedParts: car.installedParts.map(part => ({
        id: part.id,
        name: part.name,
        type: part.type,
        rarity: part.rarity,
        imageUrl: part.imageUrl,
        statBoosts: JSON.parse(part.statBoosts),
        unlockLevel: part.unlockLevel,
        price: part.price,
      })),
    }));

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
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
    const { name, make, model, year, paint, stats, raceNumber } = body;

    const car = await prisma.car.create({
      data: {
        name,
        make,
        model,
        year,
        paint: paint || '#ff0000',
        raceNumber: raceNumber || Math.floor(Math.random() * 99) + 1,
        horsepower: stats?.horsepower || 100,
        torque: stats?.torque || 100,
        weight: stats?.weight || 2500,
        grip: stats?.grip || 1.0,
        acceleration: stats?.acceleration || 1.0,
        topSpeed: stats?.topSpeed || 1.0,
        userId: user.id,
      },
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
