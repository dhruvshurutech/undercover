import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { WordSet } from "@/lib/words";

export interface ModelAdapter {
  generate(prompt: string, modelId: string): Promise<WordSet>;
}

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

function extractJson(text: string): string | null {
  const fenced = text.match(/```json([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const generic = text.match(/```([\s\S]*?)```/i);
  if (generic?.[1]) return generic[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }
  return null;
}

export class OpenRouterAdapter implements ModelAdapter {
  private readonly openrouter: ReturnType<typeof createOpenRouter>;

  constructor(options: { apiKey: string; baseURL: string }) {
    this.openrouter = createOpenRouter({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
    });
  }

  async generate(prompt: string, modelId: string): Promise<WordSet> {
    try {
      const result = await generateObject({
        model: this.openrouter(modelId),
        schema: wordSetSchema,
        prompt,
      });
      return result.object;
    } catch (error) {
      const text = (error as { text?: string })?.text;
      const extracted = text ? extractJson(text) : null;
      if (!extracted) throw error;
      return wordSetSchema.parse(JSON.parse(extracted));
    }
  }
}
