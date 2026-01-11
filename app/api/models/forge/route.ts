import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { auth } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const model = await prisma.model.create({
      data: { ...data, userId: (session.user as any).id }
    });
    return NextResponse.json(model);
  } catch (error) {
    return NextResponse.json({ error: "Forge failed" }, { status: 500 });
  }
}
