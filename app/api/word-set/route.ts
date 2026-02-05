import { getStaticWordSet } from "@/lib/server/words";
import { generateWordSet } from "@/lib/server/ai-generator";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseCategories(request: Request): string[] {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("categories");
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const categories = parseCategories(request);
  try {
    const wordSet = await generateWordSet(categories);
    return NextResponse.json(wordSet);
  } catch (error) {
    console.error(
      "AI word generation failed, falling back to static list:",
      error,
    );
    const wordSet = getStaticWordSet(categories);
    return NextResponse.json(wordSet);
  }
}
