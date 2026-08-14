/**
 * Minimal single-image A4 PDF writer.
 *
 * The card constraint (contract §Layout, board 05, and the ban on
 * Satori/@vercel/og for RTL correctness) means a PDF for print has to be
 * built from a JPEG the *browser* already rasterised correctly — never
 * server-side text layout. Rather than pull in a ~150KB PDF library for
 * "wrap one JPEG in one page," this hand-writes the ~15 PDF objects that
 * task needs (a JPEG's own bytes are valid PDF `/DCTDecode` stream data
 * as-is — no re-encoding). Runs identically in the browser and in Node
 * (used directly by tests/cards/), no Buffer, no dependency.
 */

// ISO 216 A4 in PDF points (72pt/inch; 210mm × 297mm).
const A4_POINTS = { w: 595.28, h: 841.89 };

const enc = new TextEncoder();

function concat(...parts: Uint8Array<ArrayBuffer>[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/**
 * @param jpegBytes  Raw JPEG bytes, e.g. from `canvas.toBlob('image/jpeg')`.
 * @param pixelWidth  Exact raster width of that JPEG — must match, or PDF
 *   viewers may distort the image.
 * @param pixelHeight Exact raster height of that JPEG.
 */
export function jpegToPdfA4(
  jpegBytes: Uint8Array<ArrayBuffer>,
  pixelWidth: number,
  pixelHeight: number,
): Blob {
  if (!Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight) || pixelWidth <= 0 || pixelHeight <= 0) {
    throw new Error("jpegToPdfA4: pixelWidth/pixelHeight must be positive, real numbers");
  }

  const contentStream = enc.encode(
    `q\n${A4_POINTS.w.toFixed(2)} 0 0 ${A4_POINTS.h.toFixed(2)} 0 0 cm\n/Im0 Do\nQ`,
  );

  const objects: Uint8Array<ArrayBuffer>[] = [];
  const offsets: number[] = [];
  let cursor = 0;

  const pushObject = (bytes: Uint8Array<ArrayBuffer>) => {
    offsets.push(cursor);
    objects.push(bytes);
    cursor += bytes.length;
  };

  const header = enc.encode("%PDF-1.4\n%âãÏÓ\n");
  cursor += header.length;

  // 1: Catalog
  pushObject(enc.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));

  // 2: Pages
  pushObject(enc.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"));

  // 3: Page
  pushObject(
    enc.encode(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_POINTS.w.toFixed(2)} ${A4_POINTS.h.toFixed(2)}] ` +
        `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    ),
  );

  // 4: Image XObject — the JPEG's own compressed bytes, untouched.
  pushObject(
    concat(
      enc.encode(
        `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
      ),
      jpegBytes,
      enc.encode("\nendstream\nendobj\n"),
    ),
  );

  // 5: Content stream — place the image to fill the full A4 page.
  pushObject(
    concat(
      enc.encode(`5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      enc.encode("\nendstream\nendobj\n"),
    ),
  );

  const xrefStart = cursor;
  const objectCount = objects.length + 1; // +1 for the free-list head
  let xref = `xref\n0 ${objectCount}\n0000000000 65535 f\r\n`;
  for (const offset of offsets) {
    // `offset` already includes the header's byte length — `cursor` was
    // seeded with it before the first object was pushed.
    xref += `${String(offset).padStart(10, "0")} 00000 n\r\n`;
  }
  const xrefBytes = enc.encode(xref);

  const trailer = enc.encode(
    `trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
  );

  const pdf = concat(header, ...objects, xrefBytes, trailer);
  return new Blob([pdf], { type: "application/pdf" });
}
