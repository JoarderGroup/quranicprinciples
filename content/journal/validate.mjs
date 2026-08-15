#!/usr/bin/env node
/**
 * The exact validation command content/journal/README.md documents, and
 * every content-prep agent (Prompt K) must run against every packet it
 * emits. Two layers:
 *
 * 1. JSON Schema (packet.schema.json) — structural/type rules, the
 *    inline-āyah-text guard, the cited/observed source-field rules.
 * 2. This script's own checks — cross-field rules draft-07 JSON Schema
 *    cannot express (claims must reference a real entries[].ordinal;
 *    citation_audit_log can never arrive pre-approved).
 *
 * Usage: node content/journal/validate.mjs <packet.json> [more.json ...]
 * Exit code 0 = every packet valid. Non-zero = at least one failed;
 * failures are printed to stderr, one packet's errors grouped together.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(path.join(here, "packet.schema.json"), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

/** Cross-field checks draft-07 JSON Schema has no way to express. */
export function extraChecks(packet) {
  const errors = [];
  if (!packet || typeof packet !== "object") return errors;

  const ordinals = new Set((packet.entries ?? []).map((e) => e.ordinal));
  for (const claim of packet.claims ?? []) {
    if (!ordinals.has(claim.entry_ordinal)) {
      errors.push(
        `claims: entry_ordinal ${claim.entry_ordinal} does not match any entries[].ordinal (claim: "${String(claim.claim).slice(0, 60)}")`,
      );
    }
  }

  for (const [i, row] of (packet.citation_audit_log ?? []).entries()) {
    if (row.approved === true) {
      errors.push(
        `citation_audit_log[${i}]: approved:true in a draft packet — approval is the human path, Hermes can never emit it`,
      );
    }
  }

  const seenOrdinals = new Set();
  for (const entry of packet.entries ?? []) {
    if (seenOrdinals.has(entry.ordinal)) {
      errors.push(`entries: duplicate ordinal ${entry.ordinal}`);
    }
    seenOrdinals.add(entry.ordinal);
  }

  return errors;
}

/** @returns {{valid: boolean, errors: string[]}} */
export function validatePacket(packet) {
  const schemaOk = validateSchema(packet);
  const schemaErrors = schemaOk
    ? []
    : validateSchema.errors.map((e) => `${e.instancePath || "(root)"} ${e.message}`);
  const extra = extraChecks(packet);
  const errors = [...schemaErrors, ...extra];
  return { valid: errors.length === 0, errors };
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: node content/journal/validate.mjs <packet.json> [more.json ...]");
    process.exit(2);
  }

  let allValid = true;
  for (const file of files) {
    let packet;
    try {
      packet = JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
      console.error(`${file}: could not read/parse — ${err.message}`);
      allValid = false;
      continue;
    }
    const { valid, errors } = validatePacket(packet);
    if (valid) {
      console.log(`${file}: valid`);
    } else {
      allValid = false;
      console.error(`${file}: INVALID`);
      for (const e of errors) console.error(`  - ${e}`);
    }
  }

  process.exit(allValid ? 0 : 1);
}

// Only run as a CLI when invoked directly, not when imported by tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
