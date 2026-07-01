import { buildPrompt } from "./prompt";
import { ModelAdapter, OpenRouterAdapter } from "./adapter";
import { makePairKey, WordSet } from "@/lib/words";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export async function resolveWordSet(
  adapter: ModelAdapter,
  modelIds: string[],
  categories?: string[],
  excludePairs?: string[],
  customPrompt?: string,
): Promise<WordSet> {
  const cleanedCategories =
    categories?.map(normalizeCategory).filter(Boolean) ?? [];
  const prompt = buildPrompt(categories, excludePairs, customPrompt);
  const excluded = new Set(excludePairs ?? []);

  let lastError: unknown = null;
  for (const modelId of modelIds) {
    try {
      console.log(`Attempting to generate word set using ${modelId}...`);
      const result = await adapter.generate(prompt, modelId);
      const pairKeys = result.undercover.map((undercover) =>
        makePairKey(result.civilian.word, undercover.word),
      );
      if (pairKeys.some((key) => excluded.has(key))) {
        throw new Error("Generated pair matches excluded history.");
      }
      console.log(`Successfully generated word set using ${modelId}`);
      const finalResult =
        cleanedCategories.length > 0
          ? { ...result, categories: cleanedCategories }
          : result;
      console.log(JSON.stringify(finalResult));
      return finalResult;
    } catch (error) {
      console.error(`Failed to generate word set using ${modelId}:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error("No AI providers configured or all failed");
}

export async function generateWordSet(
  categories?: string[],
  excludePairs?: string[],
  customPrompt?: string,
): Promise<WordSet> {
  const modelIds = (process.env.OPENROUTER_MODELS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const baseURL = process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (modelIds.length === 0) {
    throw new Error("No AI providers configured.");
  }
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const adapter = new OpenRouterAdapter({ apiKey, baseURL });
  return resolveWordSet(adapter, modelIds, categories, excludePairs, customPrompt);
}
