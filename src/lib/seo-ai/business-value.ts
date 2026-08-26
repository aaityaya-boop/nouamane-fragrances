export type SearchIntent = "TRANSACTIONAL" | "COMMERCIAL" | "INFORMATIONAL" | "NAVIGATIONAL" | "LOCAL";

export const INTENT_BUSINESS_VALUE_MAP: Record<SearchIntent, number> = {
  TRANSACTIONAL: 100,
  COMMERCIAL: 80,
  LOCAL: 60,
  INFORMATIONAL: 30,
  NAVIGATIONAL: 10,
};

export function calculateDeterministicOpportunityScore(
  impressions: number,
  position: number,
  ctr: number,
  businessValueScore: number
): number {
  // Deterministic engine logic
  // Max score is 100
  let score = 0;

  // 1. Position potential (Positions 4-20 are sweet spots for easy wins)
  if (position > 3 && position <= 10) score += 40;
  else if (position > 10 && position <= 20) score += 30;
  else if (position > 20 && position <= 50) score += 10;

  // 2. Impression volume (More impressions = more potential traffic)
  if (impressions > 5000) score += 30;
  else if (impressions > 1000) score += 20;
  else if (impressions > 100) score += 10;

  // 3. CTR Optimization (Low CTR on page 1/2 is a huge opportunity)
  if (position <= 20 && ctr < 0.03) score += 10;

  // 4. Multiply by business value weight
  const finalScore = (score * (businessValueScore / 100));
  
  return Math.min(Math.round(finalScore), 100);
}

export function determineImpact(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

