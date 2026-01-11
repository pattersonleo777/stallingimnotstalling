import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getFeedData() {
  const items = await prisma.feedItem.findMany({
    include: {
      user: {
        include: {
          models: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return items;
}

export default async function FeedPage() {
  const items = await getFeedData();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Pilot Activity Feed
      </h1>
      
      <div className="grid gap-6 max-w-4xl mx-auto">
        {items.map((item: any) => {
          const userModels = item.user?.models || [];
          const totalParts = userModels.reduce((acc: number, m: any) => acc + (m.partCount || 1), 0);
          const pilotStats = calculateLevel(userModels.length, totalParts);

          return (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400">{item.user?.name || "Unknown Pilot"}</h3>
                  <p className="text-slate-400 text-sm">
                    {item.type === "MODEL_CREATED" ? "Forged a new orbital rod" : "Updated their arsenal"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-widest">Rank</div>
                  <div className="text-lg font-mono text-white">LVL {pilotStats.level}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
