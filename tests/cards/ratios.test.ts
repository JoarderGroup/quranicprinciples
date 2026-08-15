import assert from "node:assert/strict";
import test from "node:test";

import { CARD_RATIOS, CARD_RATIO_KEYS, pixelRatioFor } from "@/lib/cards/ratios";

test("all four ratios are defined", () => {
  assert.deepEqual(CARD_RATIO_KEYS.sort(), ["1:1", "4:5", "9:16", "a4"]);
});

test("each ratio's base and target share the same aspect ratio", () => {
  for (const key of CARD_RATIO_KEYS) {
    const { base, target } = CARD_RATIOS[key];
    const baseAspect = base.w / base.h;
    const targetAspect = target.w / target.h;
    assert.ok(
      Math.abs(baseAspect - targetAspect) < 0.001,
      `${key}: base aspect ${baseAspect} !== target aspect ${targetAspect}`,
    );
  }
});

test("pixelRatioFor derives an exact scale from base to target", () => {
  assert.equal(pixelRatioFor("9:16"), 1080 / 360);
  assert.equal(pixelRatioFor("a4"), 2480 / 794);
});
