import { getStaticWordSet } from "@/lib/server/words";
import { generateWordSet } from "@/lib/server/ai-generator";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type WordSetRequest = {
  categories?: string[];
  excludePairs?: string[];
  source?: "ai" | "files";
  prompt?: string;
};

function parseCategories(request: Request): string[] {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("categories");
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseExcludePairs(request: Request): string[] {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("exclude");
  if (!raw) return [];
  return raw
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseSource(request: Request): "ai" | "files" {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("source");
  return raw === "files" ? "files" : "ai";
}

export async function GET(request: Request) {
  const categories = parseCategories(request);
  const excludePairs = parseExcludePairs(request);
  const source = parseSource(request);
  try {
    if (source === "files") {
      const wordSet = getStaticWordSet(categories, excludePairs);
      return NextResponse.json(wordSet);
    }
    const wordSet = await generateWordSet(categories, excludePairs);
    return NextResponse.json(wordSet);
  } catch (error) {
    console.error(
      "AI word generation failed, falling back to static list:",
      error,
    );
    const wordSet = getStaticWordSet(categories, excludePairs);
    return NextResponse.json(wordSet);
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as WordSetRequest;
  const categories = body.categories ?? [];
  const excludePairs = body.excludePairs ?? [];
  const source = body.source ?? "ai";
  const prompt = body.prompt;

  try {
    if (source === "files") {
      const wordSet = getStaticWordSet(categories, excludePairs);
      return NextResponse.json(wordSet);
    }
    const wordSet = await generateWordSet(categories, excludePairs, prompt);
    return NextResponse.json(wordSet);
  } catch (error) {
    console.error(
      "AI word generation failed, falling back to static list:",
      error,
    );
    const wordSet = getStaticWordSet(categories, excludePairs);
    return NextResponse.json(wordSet);
  }
}
