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
  {
    id: "google/gemini-3-flash-preview",
    name: "Google Gemini 3 Flash",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1",
    model: "google/gemini-3-flash-preview",
  },
  {
    id: "openai/gpt-5-mini",
    name: "Open AI GPT-5 Mini",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1",
    model: "openai/gpt-5-mini",
  },
];

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export async function generateWordSet(categories?: string[]): Promise<WordSet> {
  const cleanedCategories =
    categories?.map(normalizeCategory).filter(Boolean) ?? [];
  const categoryLine =
    cleanedCategories.length > 0
      ? `- Category must be within: ${cleanedCategories.join(", ")}.\n`
      : "";

  const prompt = `Generate ONE word pair for the party game "Undercover".
  Game Context: In Undercover, most players receive the "Civilian" word, while 1-2 players secretly get the "Undercover" word.
  Players give clues about their word without saying it directly.
  The goal: Undercover words must be similar enough that their clues don't immediately expose them, but different enough that careful players can spot the distinction.
  
  ${categoryLine}
  - Related concepts that overlap in descriptions but aren't interchangeable
  - Common, recognizable nouns (not abstract or obscure)
  - 1-2 words each, no punctuation
  - NOT synonyms, NOT plural/singular variants, NOT the same thing
  
  WHAT MAKES GOOD PAIRS:
  ✓ Share properties/contexts: "Tea/Coffee" (hot beverages, morning drinks)
  ✓ Often compared: "Fanta/Coca-Cola" (orange vs cola sodas)
  ✓ Similar actions: "Kiss/Hug" (physical affection, different intensity)
  ✓ Related locations: "Singapore/Hong Kong" (Asian city-states, different countries)
  ✓ Overlapping uses: "Couch/Bed" (furniture for lying down, different purposes)

  WHAT MAKES BAD PAIRS:
  ✗ Unrelated: "Tea/Car" (players would instantly know they're different)
  ✗ Synonyms: "Big/Large" (clues would be identical)
  ✗ Too similar: "Cat/Kitten" (one is just younger)
  ✗ Too obvious: "Hot/Cold" (direct opposites are too easy to detect)

  DESCRIPTIONS:
  - 6-12 words of plain English
  - Must NOT contain the word itself
  - Should hint at the concept without giving it away
  - Example for "Coffee": "A hot caffeinated drink often consumed in the morning"

  UNDERCOVER ALTERNATIVES:
  - Provide 1-2 alternatives only if they're equally strong and distinct
  - Otherwise just provide 1

  Output only valid JSON matching the schema.`;

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
