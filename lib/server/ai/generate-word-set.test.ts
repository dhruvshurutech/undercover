import { describe, expect, it } from "vitest";
import { resolveWordSet } from "./generate-word-set";
import { ModelAdapter } from "./adapter";
import { makePairKey, WordSet } from "@/lib/words";

class FakeAdapter implements ModelAdapter {
  constructor(
    private readonly responses: Record<
      string,
      WordSet | (() => Promise<WordSet>)
    >,
  ) {}

  async generate(_prompt: string, modelId: string): Promise<WordSet> {
    const response = this.responses[modelId];
    if (!response) {
      throw new Error(`FakeAdapter has no response configured for ${modelId}`);
    }
    if (typeof response === "function") {
      return response();
    }
    return response;
  }
}

const wordSet = (word: string): WordSet => ({
  civilian: { word, description: `A ${word} description` },
  undercover: [{ word: `${word}-undercover`, description: "desc" }],
});

describe("resolveWordSet", () => {
  it("returns the first model's result when it succeeds", async () => {
    const adapter = new FakeAdapter({
      "model-a": wordSet("tea"),
    });

    const result = await resolveWordSet(adapter, ["model-a"]);

    expect(result).toEqual(wordSet("tea"));
  });

  it("falls over to the next model when the first one throws", async () => {
    const adapter = new FakeAdapter({
      "model-a": () => Promise.reject(new Error("model-a is down")),
      "model-b": wordSet("coffee"),
    });

    const result = await resolveWordSet(adapter, ["model-a", "model-b"]);

    expect(result).toEqual(wordSet("coffee"));
  });

  it("falls over to the next model when the first one's pair is excluded", async () => {
    const teaSet = wordSet("tea");
    const excludedKey = makePairKey(
      teaSet.civilian.word,
      teaSet.undercover[0].word,
    );
    const adapter = new FakeAdapter({
      "model-a": teaSet,
      "model-b": wordSet("coffee"),
    });

    const result = await resolveWordSet(
      adapter,
      ["model-a", "model-b"],
      undefined,
      [excludedKey],
    );

    expect(result).toEqual(wordSet("coffee"));
  });

  it("rejects when every configured model fails", async () => {
    const adapter = new FakeAdapter({
      "model-a": () => Promise.reject(new Error("model-a is down")),
      "model-b": () => Promise.reject(new Error("model-b is down")),
    });

    await expect(
      resolveWordSet(adapter, ["model-a", "model-b"]),
    ).rejects.toThrow("model-b is down");
  });

  it("echoes non-empty categories onto the returned word set", async () => {
    const adapter = new FakeAdapter({ "model-a": wordSet("tea") });

    const result = await resolveWordSet(adapter, ["model-a"], ["drinks"]);

    expect(result.categories).toEqual(["drinks"]);
  });

  it("leaves categories undefined when none are given", async () => {
    const adapter = new FakeAdapter({ "model-a": wordSet("tea") });

    const result = await resolveWordSet(adapter, ["model-a"]);

    expect(result.categories).toBeUndefined();
  });
});
