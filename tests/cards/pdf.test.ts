import assert from "node:assert/strict";
import test from "node:test";

import { jpegToPdfA4 } from "@/lib/cards/pdf";

// The smallest possible valid JPEG (1×1 px, red) — enough to prove the
// byte-splicing is correct without a real capture.
const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==";

function tinyJpegBytes(): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(TINY_JPEG_BASE64), (c) => c.charCodeAt(0));
}

test("produces a well-formed single-page PDF", async () => {
  const blob = jpegToPdfA4(tinyJpegBytes(), 1, 1);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const text = new TextDecoder("latin1").decode(bytes);

  assert.equal(blob.type, "application/pdf");
  assert.match(text, /^%PDF-1\.4/);
  assert.match(text, /%%EOF$/);
  assert.match(text, /\/MediaBox \[0 0 595\.28 841\.89\]/);
  assert.match(text, /\/Filter \/DCTDecode/);
  assert.match(text, /\/Width 1 \/Height 1/);
  assert.match(text, /xref\n0 6\n/); // catalog, pages, page, image, content = 5 objects + free head
});

test("embeds the JPEG bytes verbatim, not re-encoded", async () => {
  const jpeg = tinyJpegBytes();
  const blob = jpegToPdfA4(jpeg, 1, 1);
  const bytes = new Uint8Array(await blob.arrayBuffer());

  // The raw JPEG byte sequence must appear intact somewhere in the PDF.
  let found = false;
  for (let i = 0; i <= bytes.length - jpeg.length; i++) {
    if (bytes[i] === jpeg[0] && bytes.subarray(i, i + jpeg.length).every((b, j) => b === jpeg[j])) {
      found = true;
      break;
    }
  }
  assert.ok(found, "JPEG bytes were not found verbatim in the PDF output");
});

test("every xref offset points at the start of its object", async () => {
  const blob = jpegToPdfA4(tinyJpegBytes(), 1, 1);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const text = new TextDecoder("latin1").decode(bytes);

  const xrefMatch = text.match(/xref\n0 6\n([\s\S]+?)trailer/);
  assert.ok(xrefMatch, "xref table not found");
  const lines = xrefMatch![1].trim().split("\n");
  assert.equal(lines.length, 6);

  for (let objNum = 1; objNum <= 5; objNum++) {
    const offset = Number(lines[objNum].slice(0, 10));
    const atOffset = text.slice(offset, offset + `${objNum} 0 obj`.length);
    assert.equal(atOffset, `${objNum} 0 obj`, `xref entry for object ${objNum} points at the wrong byte`);
  }
});

test("rejects non-positive dimensions", () => {
  assert.throws(() => jpegToPdfA4(tinyJpegBytes(), 0, 100));
  assert.throws(() => jpegToPdfA4(tinyJpegBytes(), 100, -1));
  assert.throws(() => jpegToPdfA4(tinyJpegBytes(), Number.NaN, 100));
});
