import { generateObject } from "ai";

import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { WordSet } from "./words";

// Define the schema for the word set
const wordSetSchema = z.object({
  civilian: z.object({
    word: z.string().describe("The word for the civilian players"),
    description: z
      .string()
      .describe("A short, clear description of the civilian word"),
  }),
  undercover: z
    .array(
      z.object({
        word: z.string().describe("The word for the undercover player"),
        description: z
          .string()
          .describe("A short, clear description of the undercover word"),
      }),
    )
    .describe("A list of undercover word variations (usually just one or two)"),
});

// Provider configuration
const PROVIDERS = [
  {
    id: "arcee-ai/trinity-mini:free",
    name: "Arcee AI Trinity Mini",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1",
    model: "arcee-ai/trinity-mini:free",
  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    name: "Mistral AI Mistral Small 3.1 24B Instruct",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1",
    model: "mistralai/mistral-small-3.1-24b-instruct:free",
  },
  {
    id: "x-ai/grok-4.1-fast",
    name: "x.ai Grox Fast 4.1",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1",
    model: "x-ai/grok-4.1-fast",
  },
  {
    id: "z-ai/glm-4.6v",
    name: "Z-ai GLM 4.6v",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1",
    model: "z-ai/glm-4.6v",
  },
];

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export async function generateWordSet(
  categories?: string[],
): Promise<WordSet> {
  const cleanedCategories =
    categories?.map(normalizeCategory).filter(Boolean) ?? [];
  const categoryLine =
    cleanedCategories.length > 0
      ? `- Category must be within: ${cleanedCategories.join(", ")}.\n`
      : "";

  const prompt = `
    You generate ONE word set for the party game "Undercover".
    ${categoryLine}
    Requirements:
    - Pick a single category and stick to it. If a category list is provided, choose from it.
    - Civilian and Undercover must be in the same category and reasonably confusable in casual conversation, but NOT synonyms and NOT identical.
    - Use common, concrete nouns. Prefer similar places, concepts, and actions.
    - Keep each word to 1-2 words max (no punctuation). Avoid plural vs singular pairs.
    - Descriptions must be short (6-12 words), plain English, no commas, and must not repeat the word.
    - Undercover variations: include 1-2 distinct alternatives if both are strong; otherwise include 1.
    - Do NOT include any extra text outside the JSON schema output.
    Examples (good): Tea / Coffee, Fanta / Coca-Cola, Kiss / Hug, Singapore / Hong Kong
    Examples (bad): Tea / Car (too different), Big / Large (synonyms), Kiss / Kissing (redundant)
  `;

  let lastError: unknown = null;

  for (const providerConfig of PROVIDERS) {
    const apiKey = process.env[providerConfig.apiKeyEnvVar];
    if (!apiKey) {
      continue; // Skip if API key is not set
    }

    try {
      console.log(
        `Attempting to generate word set using ${providerConfig.name}...`,
      );

      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: providerConfig.baseURL,
      });

      const result = await generateObject({
        model: openai(providerConfig.model),
        schema: wordSetSchema,
        prompt: prompt,
      });

      console.log(
        `Successfully generated word set using ${providerConfig.name}`,
      );
      console.log(JSON.stringify(result.object));
      return cleanedCategories.length > 0
        ? { ...result.object, categories: cleanedCategories }
        : result.object;
    } catch (error) {
      console.error(
        `Failed to generate word set using ${providerConfig.name}:`,
        error,
      );
      lastError = error;
      // Continue to next provider
    }
  }

  // If we get here, either no providers were configured or all failed
  throw lastError || new Error("No AI providers configured or all failed");
}
