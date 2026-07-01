function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export function buildPrompt(
  categories?: string[],
  excludePairs?: string[],
  customPrompt?: string,
): string {
  const cleanedCategories =
    categories?.map(normalizeCategory).filter(Boolean) ?? [];
  const categoryLine =
    cleanedCategories.length > 0
      ? `- Category must be within: ${cleanedCategories.join(", ")}.\n`
      : "";
  const excludeLine =
    excludePairs && excludePairs.length > 0
      ? `- Do NOT use any of these pairs (order-agnostic): ${excludePairs.join(
          ", ",
        )}.\n`
      : "";
  const customLine =
    customPrompt && customPrompt.trim().length > 0
      ? `\nCUSTOM INSTRUCTIONS:\n${customPrompt.trim()}\n`
      : "";

  return `Generate ONE word pair for the party game "Undercover".
  Game Context: In Undercover, most players receive the "Civilian" word, while 1-2 players secretly get the "Undercover" word.
  Players give clues about their word without saying it directly.
  The goal: Undercover words must be similar enough that their clues don't immediately expose them, but different enough that careful players can spot the distinction.

  If categories are provided only generate from given category in case no category is provided generate from any category:
  <categories_provided>${categoryLine ?? ""}</<categories_provided>
  ${excludeLine}
  - Related concepts that overlap in descriptions but aren't interchangeable
  - Common, recognizable nouns (not abstract or obscure)
  - Avoid overused safe pairs (e.g., Piano/Guitar, Tea/Coffee, Apple/Orange)
  - Prefer fresh, less obvious but still well-known everyday nouns
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

  OUTPUT FORMAT (STRICT):
  - Output ONLY a valid JSON object matching this schema:
    {
      "civilian": { "word": string, "description": string },
      "undercover": [ { "word": string, "description": string } ]
    }
  - Do NOT wrap in markdown or code fences.
  - Do NOT add extra keys like "pair" or "descriptions".

  ${customLine}
  Output only valid JSON matching the schema.`;
}
