import prisma from "@/lib/prisma";
import AiAssistantClient from "./AiAssistantClient";

export const dynamic = "force-dynamic";

export default async function AiAssistantPage() {
  const keywords = await prisma.seoKeyword.findMany({
    orderBy: { impressions: "desc" },
    take: 50,
    select: { id: true, keyword: true }
  });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true }
  });

  return <AiAssistantClient keywords={keywords} products={products} />;
}

