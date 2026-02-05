import { getStaticWordSet } from "@/lib/server/words";
import { generateWordSet } from "@/lib/server/ai-generator";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const wordSet = await generateWordSet();
    return NextResponse.json(wordSet);
  } catch (error) {
    console.error(
      "AI word generation failed, falling back to static list:",
      error,
    );
    const wordSet = getStaticWordSet();
    return NextResponse.json(wordSet);
  }
}
