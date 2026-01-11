import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { auth } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const formData = await req.formData();
    const savedModel = await prisma.model.create({
      data: {
        name: formData.get('name') as string,
        url: formData.get('url') as string,
        game: "gods-rods",
        category: (formData.get('category') as string) || "vehicle",
        partCount: parseInt(formData.get('partCount') as string) || 1,
        userId: (session.user as any).id,
        isForged: false,
        components: "[]"
      },
    });
    return NextResponse.json({ success: true, modelId: savedModel.id });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
