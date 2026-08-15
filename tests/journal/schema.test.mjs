import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validatePacket } from "../../content/journal/validate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
const fixturesDir = path.join(repoRoot, "content/journal/fixtures");

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(fixturesDir, name), "utf8"));
}

function validDraft() {
  // Deep-clone so each test can mutate its own copy freely.
  return JSON.parse(JSON.stringify(loadFixture("valid-draft.json")));
}

test("the valid-draft fixture passes", () => {
  const { valid, errors } = validatePacket(validDraft());
  assert.equal(valid, true, `expected valid, got errors: ${errors.join("; ")}`);
});

test("the invalid-inline-ayah fixture fails, on both intended grounds", () => {
  const { valid, errors } = validatePacket(loadFixture("invalid-inline-ayah.json"));
  assert.equal(valid, false);
  assert.ok(
    errors.some((e) => e.includes("body_md")),
    "expected a body_md (inline āyah) error",
  );
  assert.ok(
    errors.some((e) => e.includes("source")),
    "expected a missing-source (cited claim) error",
  );
});

test("publication_status can only ever be 'draft'", () => {
  const packet = validDraft();
  packet.publication_status = "published";
  const { valid, errors } = validatePacket(packet);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("publication_status")));
});

test("an unknown series is rejected", () => {
  const packet = validDraft();
  packet.series = "consciousness"; // the old, superseded series name — must not be accepted
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("an unsupported locale is rejected", () => {
  const packet = validDraft();
  packet.locale = "fr";
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("an invalid surah number is rejected", () => {
  const packet = validDraft();
  packet.ayah_refs = [{ surah: 115, ayah: 1, translation_edition: "eng-saheeh" }];
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("an invented translation edition is rejected", () => {
  const packet = validDraft();
  packet.ayah_refs = [{ surah: 1, ayah: 1, translation_edition: "made-up-edition" }];
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("a claim missing its tier is rejected", () => {
  const packet = validDraft();
  delete packet.claims[0].tier;
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("an 'observed' claim carrying a source_url is rejected — can't be both sourced and a personal observation", () => {
  const packet = validDraft();
  packet.claims[1].source_url = "https://example.com/not-allowed";
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("a claim's entry_ordinal must reference a real entry", () => {
  const packet = validDraft();
  packet.claims[0].entry_ordinal = 999;
  const { valid, errors } = validatePacket(packet);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("entry_ordinal")));
});

test("duplicate entry ordinals are rejected", () => {
  const packet = validDraft();
  packet.entries[1].ordinal = packet.entries[0].ordinal;
  const { valid, errors } = validatePacket(packet);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("duplicate ordinal")));
});

test("citation_audit_log cannot arrive pre-approved — approval is exclusively human", () => {
  const packet = validDraft();
  packet.citation_audit_log[0].approved = true;
  const { valid, errors } = validatePacket(packet);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("approved:true")));
});

test("editorial_status human_review_pending requires a non-empty review_reason", () => {
  const packet = validDraft();
  packet.editorial_status = "human_review_pending";
  packet.review_reason = null;
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("editorial_status clear requires review_reason to be null", () => {
  const packet = validDraft();
  packet.editorial_status = "clear";
  packet.review_reason = "should not be here";
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("a supersedes_id or version field is rejected outright — additionalProperties: false", () => {
  const packet = validDraft();
  packet.supersedes_id = "00000000-0000-0000-0000-000000000000";
  const { valid, errors } = validatePacket(packet);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("additional")));
});

test("a version field is rejected outright", () => {
  const packet = validDraft();
  packet.version = 2;
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("an approved_by field on the packet itself is rejected — a packet cannot self-approve", () => {
  const packet = validDraft();
  packet.approved_by = "someone";
  const { valid } = validatePacket(packet);
  assert.equal(valid, false);
});

test("a slug built from a raw source filename pattern is still schema-valid (agent-discipline, not schema-enforceable) but the pointer field is separate", () => {
  // The schema can't know a slug came from a filename — that's Prompt K's
  // discipline (27-Journal-Editorial-Map.md), not a mechanical rule. This
  // test documents that boundary rather than asserting false enforcement.
  const packet = validDraft();
  packet.raw_source = "../../Assets QP/essays/13. THE THING THAT FOLLOWS YOU HOME.md";
  const { valid } = validatePacket(packet);
  assert.equal(valid, true);
});
