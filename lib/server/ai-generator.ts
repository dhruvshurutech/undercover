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

export async function generateWordSet(): Promise<WordSet> {
  const prompt = `
    Generate a set of words for the game "Undercover".
    - The "Civilian" word and the "Undercover" word must be distinct but related (same category, similar context).
    - They should NOT be synonyms, but clearly different objects/concepts that could be confused in vague conversation.
    - Provide a short, clear description for each.
    - Examples of good pairs: Tea / Coffee, Apple / Orange, Train / Bus, Sun / Moon.
    - Examples of BAD pairs: Tea / Car (too different), Big / Large (synonyms).
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
      return result.object;
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
