import { z } from "zod";

export const SearchIntentSchema = z.object({
  intent: z.enum(["TRANSACTIONAL", "COMMERCIAL", "INFORMATIONAL", "NAVIGATIONAL", "LOCAL"]),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export const KeywordAnalysisSchema = z.object({
  intent: SearchIntentSchema,
  recommendedPageType: z.string(),
  opportunity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  reason: z.string(),
  recommendedActions: z.array(z.string()),
  relatedKeywords: z.array(z.string()),
});

export const ContentBriefSchema = z.object({
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  searchIntent: z.string(),
  recommendedTitle: z.string(),
  h1: z.string(),
  h2Structure: z.array(z.string()),
  faq: z.array(z.string()),
  entitiesToCover: z.array(z.string()),
  internalLinks: z.array(z.string()),
  productsToMention: z.array(z.string()),
  recommendedCta: z.string(),
});

export const PageAnalysisSchema = z.object({
  seoScore: z.number().min(0).max(100),
  searchIntentMatch: z.boolean(),
  contentQuality: z.string(),
  keywordCoverage: z.string(),
  internalLinking: z.string(),
  ctrOpportunity: z.string(),
  recommendations: z.array(z.string()),
});

export const ProductOptimizationSchema = z.object({
  seoTitle: z.string(),
  metaDescription: z.string(),
  focusKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
});

