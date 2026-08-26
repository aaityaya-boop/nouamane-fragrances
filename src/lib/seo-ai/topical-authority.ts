
import prisma from "@/lib/prisma";

export interface TopicScoreInfo {
  topicId: string;
  topicName: string;
  score: number;
  businessValue: number;
  coverage: number; // 0 to 100 percentage
  opportunity: "HIGH" | "MEDIUM" | "LOW";
  rankingKeywords: number;
  top10Keywords: number;
  top20Keywords: number;
  topicGaps: number;
}

export async function calculateTopicalAuthorityScore(topicId: string): Promise<TopicScoreInfo | null> {
  const topic = await prisma.seoTopic.findUnique({
    where: { id: topicId },
  });

  if (!topic) return null;

  // 1. Get Keywords in Topic
  const topicKeywords = await prisma.seoTopicKeyword.findMany({
    where: { topicId },
  });
  
  if (topicKeywords.length === 0) {
    return {
      topicId,
      topicName: topic.name,
      score: 0,
      businessValue: 50,
      coverage: 0,
      opportunity: "MEDIUM",
      rankingKeywords: 0,
      top10Keywords: 0,
      top20Keywords: 0,
      topicGaps: 0
    };
  }

  const keywordNames = topicKeywords.map(k => k.keyword);

  // 2. Fetch SEO Data for these Keywords
  const keywordsData = await prisma.seoKeyword.findMany({
    where: { keyword: { in: keywordNames } }
  });

  // 3. Metrics Calculation
  let totalImpressions = 0;
  let rankingKeywords = 0;
  let top10Keywords = 0;
  let top20Keywords = 0;
  let coveredKeywords = 0;
  let totalBusinessValueScore = 0;

  const BUSINESS_VALUE_MAP: Record<string, number> = {
    "HIGH": 100,
    "MEDIUM": 50,
    "LOW": 20
  };

  keywordsData.forEach(kd => {
    totalImpressions += kd.impressions;
    
    // Business Value
    totalBusinessValueScore += BUSINESS_VALUE_MAP[kd.businessValue] || 50;

    // Coverage & Rankings
    if (kd.url && kd.url.trim() !== "") {
      coveredKeywords++;
    }

    if (kd.currentPosition && kd.currentPosition > 0) {
      rankingKeywords++;
      if (kd.currentPosition <= 10) top10Keywords++;
      if (kd.currentPosition <= 20) top20Keywords++;
    }
  });

  const avgBusinessValue = totalBusinessValueScore / keywordsData.length;
  const coverage = Math.round((coveredKeywords / keywordsData.length) * 100);
  const topicGaps = keywordsData.length - coveredKeywords;

  // 4. Deterministic Score Formula (0-100)
  // - High Impressions (+30)
  // - High Business Value (+30)
  // - Gap Opportunity (Low coverage is good for opportunity) (+20)
  // - Existing Momentum (Some top 20 keywords) (+20)
  
  let score = 0;
  
  if (totalImpressions > 50000) score += 30;
  else if (totalImpressions > 10000) score += 20;
  else if (totalImpressions > 1000) score += 10;

  score += (avgBusinessValue / 100) * 30;

  // Opportunity from gaps (if coverage is low, opportunity to grow is higher)
  if (coverage < 30) score += 20;
  else if (coverage < 60) score += 10;
  else score += 5; // Maintenance value

  // Momentum
  if (top10Keywords > 0) score += 20;
  else if (top20Keywords > 0) score += 10;
  else if (rankingKeywords > 0) score += 5;

  score = Math.min(Math.round(score), 100);

  let opportunity: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (score >= 75) opportunity = "HIGH";
  else if (score >= 40) opportunity = "MEDIUM";

  return {
    topicId,
    topicName: topic.name,
    score,
    businessValue: Math.round(avgBusinessValue),
    coverage,
    opportunity,
    rankingKeywords,
    top10Keywords,
    top20Keywords,
    topicGaps
  };
}

export async function detectCannibalization(): Promise<{ keyword: string; urls: string[] }[]> {
  // A simple deterministic heuristic:
  // If we have SeoOpportunities mapping to the same keyword but different Target URLs, or multiple pages ranking for the same exact keyword.
  
  // Since we only store one `url` per SeoKeyword, we can look at GSC data if we had it per URL,
  // but let us use a grouping approach on SeoOpportunity for now.
  const opps = await prisma.seoOpportunity.findMany({
    where: { keyword: { not: null }, targetUrl: { not: null } },
    select: { keyword: true, targetUrl: true }
  });

  const keywordUrlMap: Record<string, Set<string>> = {};
  opps.forEach(opp => {
    if (opp.keyword && opp.targetUrl) {
      if (!keywordUrlMap[opp.keyword]) keywordUrlMap[opp.keyword] = new Set();
      keywordUrlMap[opp.keyword].add(opp.targetUrl);
    }
  });

  const cannibalizations = [];
  for (const [keyword, urlSet] of Object.entries(keywordUrlMap)) {
    if (urlSet.size > 1) {
      cannibalizations.push({
        keyword,
        urls: Array.from(urlSet)
      });
    }
  }

  return cannibalizations;
}

