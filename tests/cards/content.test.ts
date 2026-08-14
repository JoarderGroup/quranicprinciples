import assert from "node:assert/strict";
import test from "node:test";

import { assertAyahContent, fetchAyahContent, sourceLineFor } from "@/lib/cards/content";
import type { AyahContent } from "@/lib/cards/types";

function withMockedQuranApi<T>(
  responses: Record<string, string>,
  run: () => Promise<T>,
): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    const match = url.match(/editions\/([^/]+)\/(\d+)\/(\d+)\.json$/);
    const key = match ? `${match[1]}:${match[2]}:${match[3]}` : url;
    const text = responses[key];
    if (text === undefined) {
      return new Response("not found", { status: 404 });
    }
    return new Response(JSON.stringify({ chapter: Number(match![2]), verse: Number(match![3]), text }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  return run().finally(() => {
    globalThis.fetch = original;
  });
}

test("fetchAyahContent resolves verse text and translation through lib/quran.ts, never a literal", async () => {
  await withMockedQuranApi(
    {
      "ara-quranuthmanihaf:55:7": "arabic seven",
      "ara-quranuthmanihaf:55:8": "arabic eight",
      "eng-ummmuhammad:55:7": "translation seven",
      "eng-ummmuhammad:55:8": "translation eight",
    },
    async () => {
      const content = await fetchAyahContent({
        surah: 55,
        surahName: "Ar-Raḥmān",
        from: 7,
        to: 8,
        root: "و-ز-ن",
        rootOccurrences: 23,
      });
      assert.equal(content.arabic, "arabic seven ٧ arabic eight ٨");
      assert.equal(content.translation, "translation seven translation eight");
      assert.equal(content.translationEdition, "eng-ummmuhammad");
      assert.equal(content.surahName, "Ar-Raḥmān");
    },
  );
});

test("fetchAyahContent throws rather than shipping a card with partial verse text", async () => {
  await withMockedQuranApi({ "ara-quranuthmanihaf:55:7": "arabic seven" /* translation missing */ }, async () => {
    await assert.rejects(
      () => fetchAyahContent({ surah: 55, surahName: "Ar-Raḥmān", from: 7 }),
      /could not resolve/,
    );
  });
});

test("sourceLineFor renders the chapter, verse range and edition", () => {
  const ayah: AyahContent = {
    surah: 55,
    surahName: "Ar-Raḥmān",
    from: 7,
    to: 9,
    arabic: "...",
    translation: "...",
    translationEdition: "eng-ummmuhammad",
  };
  assert.equal(sourceLineFor(ayah), "Sūrah Ar-Raḥmān 55:7–9 · Saheeh International");
});

test("sourceLineFor falls back to the raw edition code for an unlabelled edition", () => {
  const ayah: AyahContent = {
    surah: 1,
    surahName: "Al-Fātiḥah",
    from: 1,
    to: 1,
    arabic: "...",
    translation: "...",
    translationEdition: "some-other-edition",
  };
  assert.equal(sourceLineFor(ayah), "Sūrah Al-Fātiḥah 1:1 · some-other-edition");
});

test("assertAyahContent throws — missing, undefined, or blank-field ayah content", () => {
  assert.throws(() => assertAyahContent(undefined));
  assert.throws(() => assertAyahContent(null));
  assert.throws(() =>
    assertAyahContent({
      surah: 55,
      surahName: "Ar-Raḥmān",
      from: 7,
      to: 9,
      arabic: "",
      translation: "text",
      translationEdition: "eng-ummmuhammad",
    }),
  );
  assert.throws(() =>
    assertAyahContent({
      surah: 55,
      surahName: "",
      from: 7,
      to: 9,
      arabic: "text",
      translation: "text",
      translationEdition: "eng-ummmuhammad",
    }),
  );
});

test("assertAyahContent passes a fully-populated AyahContent through", () => {
  const ayah: AyahContent = {
    surah: 55,
    surahName: "Ar-Raḥmān",
    from: 7,
    to: 9,
    arabic: "text",
    translation: "text",
    translationEdition: "eng-ummmuhammad",
  };
  assert.doesNotThrow(() => assertAyahContent(ayah));
});
