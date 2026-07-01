import { describe, expect, it } from "vitest";
import { buildPrompt } from "./prompt";

describe("buildPrompt", () => {
  it("includes a category constraint line when categories are given", () => {
    const prompt = buildPrompt(["sports", "food"]);

    expect(prompt).toContain("Category must be within: sports, food.");
  });

  it("omits the category constraint line when no categories are given", () => {
    const prompt = buildPrompt();

    expect(prompt).not.toContain("Category must be within");
  });

  it("lists exclude pairs when given", () => {
    const prompt = buildPrompt(undefined, ["tea|coffee", "cat|dog"]);

    expect(prompt).toContain(
      "Do NOT use any of these pairs (order-agnostic): tea|coffee, cat|dog.",
    );
  });

  it("omits the exclude-pairs line when none are given", () => {
    const prompt = buildPrompt();

    expect(prompt).not.toContain("Do NOT use any of these pairs");
  });

  it("includes custom instructions when a customPrompt is given", () => {
    const prompt = buildPrompt(undefined, undefined, "Focus on animals only");

    expect(prompt).toContain("CUSTOM INSTRUCTIONS:\nFocus on animals only");
  });

  it("omits the custom instructions block when customPrompt is blank", () => {
    const prompt = buildPrompt(undefined, undefined, "   ");

    expect(prompt).not.toContain("CUSTOM INSTRUCTIONS");
  });
});
