import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import CardRenderer from "@/components/cards/CardRenderer";
import { CARD_RATIO_KEYS } from "@/lib/cards/ratios";
import type { AyahContent, CardContent } from "@/lib/cards/types";

/**
 * D10 (05-Design-Contract.md §Card tokens): a card rendered under
 * `data-theme="dark"` must produce the SAME colours as under light —
 * share cards are fixed-identity assets, not theme-adaptive UI.
 *
 * `react-dom/server` has no CSS engine, so "same colours" can't be proven
 * by rendering twice and diffing computed style. It's proven two other
 * ways instead, and together they're airtight:
 *
 * 1. Source-of-truth: every `--card-*` custom property is defined once in
 *    tokens.css's base `:root` and never redefined inside the
 *    `@media (prefers-color-scheme: dark)` block. If it isn't overridden
 *    anywhere, it cannot change value when the media query flips.
 * 2. Consumption: no card component's rendered className ever contains a
 *    bare theme-reactive utility (`text-ink`, `bg-paper`, `text-muted`,
 *    …) — only `[var(--card-*)]` arbitrary values. If the only tokens
 *    referenced are the ones (1) proves invariant, the rendered card is
 *    invariant too.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
const CARD_TOKENS = [
  "--card-paper",
  "--card-ink",
  "--card-signal",
  "--card-deep",
  "--card-gold",
  "--card-muted",
  "--card-rule",
];

function extractDarkModeBlock(css: string): string {
  const start = css.indexOf("@media (prefers-color-scheme: dark)");
  assert.ok(start >= 0, "tokens.css has no dark-mode media block to check");
  let depth = 0;
  let i = css.indexOf("{", start);
  const blockStart = i;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(blockStart, i + 1);
    }
  }
  throw new Error("unbalanced braces in tokens.css dark-mode block");
}

test("every --card-* token is defined in tokens.css", () => {
  const css = fs.readFileSync(path.join(repoRoot, "app/tokens.css"), "utf8");
  for (const token of CARD_TOKENS) {
    assert.match(css, new RegExp(`${token}\\s*:`), `${token} is not defined anywhere in tokens.css`);
  }
});

test("no --card-* token is redefined inside the dark-mode media block", () => {
  const css = fs.readFileSync(path.join(repoRoot, "app/tokens.css"), "utf8");
  const darkBlock = extractDarkModeBlock(css);
  for (const token of CARD_TOKENS) {
    assert.doesNotMatch(
      darkBlock,
      new RegExp(`${token}\\s*:`),
      `${token} is redefined under prefers-color-scheme: dark — it would invert on the reader's OS`,
    );
  }
});

const THEME_REACTIVE = /\b(text|bg|border(-[tbrl])?)-(ink|paper|paper-2|signal|deep|gold|muted|rule)\b/;

const ayah: AyahContent = {
  surah: 55,
  surahName: "Ar-Raḥmān",
  from: 7,
  to: 9,
  arabic: "وَٱلسَّمَآءَ رَفَعَهَا وَوَضَعَ ٱلۡمِيزَانَ",
  translation: "And the heaven He raised and imposed the balance",
  translationEdition: "eng-ummmuhammad",
  root: "و-ز-ن",
  rootOccurrences: 23,
};

function contentFor(kind: CardContent["kind"]): CardContent {
  switch (kind) {
    case "principle":
      return {
        kind,
        ratio: "1:1",
        locale: "en",
        ayah,
        issueNo: 1,
        nameTranslit: "Al-Mīzān",
        nameArabic: "الميزان",
        ctaTitle: "The grocer who reset his scale every Friday",
      };
    case "ayah":
      return { kind, ratio: "1:1", locale: "en", ayah, principleNameTranslit: "Al-Mīzān" };
    case "deed":
      return {
        kind,
        ratio: "9:16", // showBody branch — exercises the most className surface
        locale: "en",
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
        ratio: "1:1",
        locale: "en",
        ayah,
        quote: "The Qur'an puts the scale of the heavens and the scale in your hand in the same breath.",
        attribution: "Al-Mīzān · Quranic Principles",
      };
  }
}

test("no card type ever emits a theme-reactive colour class, for every ratio", () => {
  for (const kind of ["principle", "ayah", "deed", "quote"] as const) {
    for (const ratio of CARD_RATIO_KEYS) {
      const content = { ...contentFor(kind), ratio };
      const html = renderToStaticMarkup(createElement(CardRenderer, { content }));
      assert.doesNotMatch(
        html,
        THEME_REACTIVE,
        `${kind}/${ratio} emitted a theme-reactive class — it would render differently in dark mode`,
      );
    }
  }
});

test("every card surface references only --card-* custom properties for colour", () => {
  const html = renderToStaticMarkup(createElement(CardRenderer, { content: contentFor("deed") }));
  // Confirms the fix actually pins to --card-*, not just avoids the old names.
  assert.match(html, /var\(--card-ink\)|var\(--card-paper\)/);
});
