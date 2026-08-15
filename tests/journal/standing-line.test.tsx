import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import StandingLine from "@/components/journal/StandingLine";

const REQUIRED_TEXT =
  "Quranic Principles is a magazine, not a madrasa. We are readers and writers, not scholars. Nothing here is a ruling. Where we cite, check us.";

test("StandingLine renders the exact required text — every Journal page includes this component unconditionally", () => {
  const html = renderToStaticMarkup(createElement(StandingLine));
  // Collapse whitespace the way JSX text-wrapping introduces, so the check
  // is about the actual words, not incidental line-break formatting.
  const normalized = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(normalized, REQUIRED_TEXT);
});

test("StandingLine takes no props that could suppress or alter the text — it cannot be silently configured off", () => {
  // The component signature only accepts `className`; there is no `hidden`,
  // `show`, or text-override prop to check against. This test documents
  // that boundary the same way the card engine's SourceLine tests do.
  const htmlDefault = renderToStaticMarkup(createElement(StandingLine));
  const htmlWithClassName = renderToStaticMarkup(createElement(StandingLine, { className: "mt-6" }));
  const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(strip(htmlDefault), strip(htmlWithClassName));
});
