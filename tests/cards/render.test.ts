import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import CardRenderer from "@/components/cards/CardRenderer";
import { CARD_RATIO_KEYS } from "@/lib/cards/ratios";
import type { AyahContent, CardContent } from "@/lib/cards/types";
import type { CardRatio, Locale } from "@/lib/types";

function render(content: CardContent): string {
  return renderToStaticMarkup(createElement(CardRenderer, { content }));
}

const ayah: AyahContent = {
  surah: 55,
  surahName: "Ar-Raḥmān",
  from: 7,
  to: 9,
  arabic: "وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ",
  translation: "And the heaven He raised and imposed the balance",
  translationEdition: "eng-ummmuhammad",
  root: "و-ز-ن",
  rootOccurrences: 23,
};

function contentFor(kind: CardContent["kind"], ratio: CardRatio, locale: Locale): CardContent {
  switch (kind) {
    case "principle":
      return {
        kind,
        ratio,
        locale,
        ayah,
        issueNo: 1,
        nameTranslit: "Al-Mīzān",
        nameArabic: "الميزان",
        ctaTitle: "The grocer who reset his scale every Friday",
      };
    case "ayah":
      return { kind, ratio, locale, ayah, principleNameTranslit: "Al-Mīzān" };
    case "deed":
      return {
        kind,
        ratio,
        locale,
        ayah,
        issueNo: 1,
        principleNameTranslit: "Al-Mīzān",
        deedArabicWord: "العمل",
        promptText: "Name one weighing you will make honest this week.",
        bodyText: "Time you owe. Money you counted. A promise you rounded down.",
      };
    case "quote":
      return {
        kind,
        ratio,
        locale,
        ayah,
        quote:
          "The Qur'an puts the scale of the heavens and the scale in your hand in the same breath.",
        attribution: "Al-Mīzān · Quranic Principles",
      };
  }
}

const KINDS: CardContent["kind"][] = ["principle", "ayah", "deed", "quote"];
const LOCALES: Locale[] = ["en", "ar", "bn"];

test("all four card types render at all four ratios in all three locales", () => {
  for (const kind of KINDS) {
    for (const ratio of CARD_RATIO_KEYS) {
      for (const locale of LOCALES) {
        const html = render(contentFor(kind, ratio, locale));
        assert.ok(html.length > 0, `${kind}/${ratio}/${locale} rendered nothing`);
      }
    }
  }
});

test("the source line is present in the output for every ratio, every card type", () => {
  for (const kind of KINDS) {
    for (const ratio of CARD_RATIO_KEYS) {
      const html = render(contentFor(kind, ratio, "en"));
      assert.match(
        html,
        /Sūrah Ar-Raḥmān 55:7–9 · Saheeh International/,
        `${kind}/${ratio} is missing its source line`,
      );
    }
  }
});

test("a card with no ayah_ref fails to render, for every card type", () => {
  for (const kind of KINDS) {
    const content = { ...contentFor(kind, "1:1", "en"), ayah: undefined } as unknown as CardContent;
    assert.throws(
      () => render(content),
      /missing or incomplete ayah content/,
      `${kind} rendered without throwing despite a missing ayah_ref`,
    );
  }
});

test("a card with a blank verse (ayah present but text empty) still fails to render", () => {
  const content = contentFor("principle", "9:16", "en");
  const broken = { ...content, ayah: { ...ayah, arabic: "" } };
  assert.throws(() => render(broken));
});

test("the Arabic verse text is carried through unmodified — not reversed, not split", () => {
  const html = render(contentFor("ayah", "9:16", "en"));
  // The exact glyph sequence the API returned must appear intact. If
  // anything upstream ever reversed or re-joined the string per-character,
  // this substring match would fail even though a human skimming the
  // output might not notice.
  assert.ok(html.includes(ayah.arabic), "Arabic verse text was not carried through verbatim");
  // And it must render inside a properly isolated RTL block, not bare in
  // an LTR run (contract §Bidi / .ayah-text in globals.css).
  assert.match(html, /class="ayah-text[^"]*"[^>]*>[^<]*وَالسَّمَاءَ/);
});

test('every Arabic fragment renders lang="ar" (Bidi/RootChip/ar-block convention)', () => {
  const html = render(contentFor("principle", "a4", "en"));
  assert.match(html, /lang="ar"/);
});
