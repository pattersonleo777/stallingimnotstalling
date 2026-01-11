import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { auth } from "@/app/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const models = await prisma.model.findMany({
    where: { userId: (session.user as any).id },
    include: { _count: { select: { likes: true } } }
  });
  return NextResponse.json(models);
}
