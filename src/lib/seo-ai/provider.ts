import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { 
  KeywordAnalysisSchema, 
  PageAnalysisSchema, 
  ContentBriefSchema, 
  ProductOptimizationSchema 
} from "./schema";

export interface KeywordAnalysisInput {
  keyword: string;
  country: string;
  language: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  targetUrl?: string | null;
  businessRelevance: string;
}

export interface PageAnalysisInput {
  url: string;
  title: string;
  description: string;
  content: string;
  queries: string[];
}

export interface ContentBriefInput {
  primaryKeyword: string;
  targetUrl: string;
  searchIntent: string;
  language: string;
  topic: string;
  relatedQueries: string[];
}

export interface ProductSeoInput {
  productName: string;
  brand: string;
  description: string;
  category: string;
  notes: string;
  gender: string;
  existingTitle: string;
  existingMeta: string;
  price: number;
}

export interface SeoAIProvider {
  analyzeKeyword(input: KeywordAnalysisInput): Promise<any>;
  analyzePage(input: PageAnalysisInput): Promise<any>;
  generateContentBrief(input: ContentBriefInput): Promise<any>;
  optimizeProduct(input: ProductSeoInput): Promise<any>;
}

const MOROCCAN_PROMPT_CONTEXT = `You are a Moroccan SEO Expert for NAY Parfum.
Your task is to analyze SEO data for the Moroccan market.
Crucial constraints:
- DO NOT invent monthly search volumes (you do not have access to Google Keyword Planner).
- Analyze intents specifically for Morocco (French, Arabic, Darija).
- Do not assume intent based only on language.
- Transactional keywords imply buying intent. Informational keywords imply learning intent.
`;

export class VercelAiSdkProvider implements SeoAIProvider {
  private modelName: string;

  constructor(providerType: string, modelName: string) {
    // Only support Google via @ai-sdk/google for now
    this.modelName = modelName || "gemini-1.5-pro";
  }

  private getModel() {
    return google(this.modelName);
  }

  async analyzeKeyword(input: KeywordAnalysisInput) {
    const { object } = await generateObject({
      model: this.getModel(),
      schema: KeywordAnalysisSchema,
      prompt: `${MOROCCAN_PROMPT_CONTEXT}\n\nAnalyze this keyword data:\n${JSON.stringify(input, null, 2)}`
    });
    return object;
  }

  async analyzePage(input: PageAnalysisInput) {
    const { object } = await generateObject({
      model: this.getModel(),
      schema: PageAnalysisSchema,
      prompt: `${MOROCCAN_PROMPT_CONTEXT}\n\nAnalyze this page:\n${JSON.stringify(input, null, 2)}`
    });
    return object;
  }

  async generateContentBrief(input: ContentBriefInput) {
    const { object } = await generateObject({
      model: this.getModel(),
      schema: ContentBriefSchema,
      prompt: `${MOROCCAN_PROMPT_CONTEXT}\n\nCreate a content brief for:\n${JSON.stringify(input, null, 2)}`
    });
    return object;
  }

  async optimizeProduct(input: ProductSeoInput) {
    const { object } = await generateObject({
      model: this.getModel(),
      schema: ProductOptimizationSchema,
      prompt: `${MOROCCAN_PROMPT_CONTEXT}\n\nOptimize SEO for this product:\n${JSON.stringify(input, null, 2)}`
    });
    return object;
  }
}

export async function getSeoAiProvider(): Promise<SeoAIProvider> {
  const providerType = process.env.SEO_AI_PROVIDER || "GEMINI";
  const modelName = process.env.SEO_AI_MODEL || "gemini-1.5-pro";
  return new VercelAiSdkProvider(providerType, modelName);
}

