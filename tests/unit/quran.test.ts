import assert from "node:assert/strict";
import test from "node:test";

import {
  ARABIC_EDITION,
  BANGLA_EDITION,
  ENGLISH_EDITION,
  getAyah,
} from "../../lib/quran.ts";

test("getAyah requests the required API edition for each supported locale", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];

  globalThis.fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    const [, edition, surah, ayah] = url.match(/editions\/([^/]+)\/(\d+)\/(\d+)\.json$/) ?? [];
    return new Response(JSON.stringify({ chapter: Number(surah), verse: Number(ayah), text: "api text" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const [arabic, english, bangla] = await Promise.all([
      getAyah(1, 1, "ar"),
      getAyah(1, 1, "en"),
      getAyah(1, 1, "bn"),
    ]);

    assert.equal(arabic?.edition, ARABIC_EDITION);
    assert.equal(english?.edition, ENGLISH_EDITION);
    assert.equal(bangla?.edition, BANGLA_EDITION);
    assert.deepEqual(calls.map((url) => url.match(/editions\/([^/]+)/)?.[1]).sort(), [
      ARABIC_EDITION,
      BANGLA_EDITION,
      ENGLISH_EDITION,
    ].sort());
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getAyah rejects invalid references before making a network request", async () => {
  await assert.rejects(() => getAyah(0, 1, "en"), RangeError);
  await assert.rejects(() => getAyah(1, 0, "en"), RangeError);
});
