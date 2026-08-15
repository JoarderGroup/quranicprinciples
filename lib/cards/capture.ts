"use client";

import { toCanvas } from "html-to-image";
import type { CardRatio } from "@/lib/types";
import { jpegToPdfA4 } from "./pdf";
import { CARD_RATIOS, pixelRatioFor } from "./ratios";

/**
 * Rendering happens in the browser, against real DOM — never Satori,
 * never `@vercel/og` (03-Content-Funnel.md, _STATE.md locked decisions:
 * "Satori/@vercel/og are banned — no RTL"). `html-to-image` walks the
 * DOM the browser itself laid out and shaped, so Arabic composes exactly
 * as the reader saw it on screen.
 *
 * A card captured before its fonts finish swapping ships in the wrong
 * typeface and nobody notices until it is already public — so every
 * capture path waits on `document.fonts.ready` first.
 */
export async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  await document.fonts.ready;
  // One more frame so layout settles after any late font-driven reflow.
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function captureCanvas(node: HTMLElement, ratio: CardRatio): Promise<HTMLCanvasElement> {
  await waitForFonts();
  return toCanvas(node, {
    pixelRatio: pixelRatioFor(ratio),
    width: CARD_RATIOS[ratio].base.w,
    height: CARD_RATIOS[ratio].base.h,
    cacheBust: true,
    backgroundColor: undefined, // the frame paints its own token background
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`canvas.toBlob(${type}) returned null`))),
      type,
      quality,
    );
  });
}

export async function captureCardPng(node: HTMLElement, ratio: CardRatio): Promise<Blob> {
  const canvas = await captureCanvas(node, ratio);
  return canvasToBlob(canvas, "image/png");
}

/** A4 only — captures at print pixel dimensions, then wraps the JPEG in a
 * hand-written single-page PDF (see pdf.ts) rather than pulling in a PDF
 * library. */
export async function captureCardPdf(node: HTMLElement): Promise<Blob> {
  const canvas = await captureCanvas(node, "a4");
  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", 0.92);
  const bytes = new Uint8Array(await jpegBlob.arrayBuffer());
  return jpegToPdfA4(bytes, canvas.width, canvas.height);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Web Share API where the platform supports sharing files, a plain
 * download everywhere else — no account, no server round-trip either way
 * (07-Admin-Spec.md §6, 03-Content-Funnel.md). */
export async function shareOrDownloadBlob(
  blob: Blob,
  filename: string,
  shareTitle: string,
): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: shareTitle });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "cancelled"; // user dismissed the share sheet — respect it, no forced download
      // Any other failure (e.g. platform lied about canShare) falls through to download.
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

export function cardFilename(
  slug: string,
  ratio: CardRatio,
  ext: "png" | "pdf",
): string {
  return `quranic-principles-${slug}-${ratio.replace(":", "x")}.${ext}`;
}

/**
 * The single entry point UI buttons call: capture the given card node at
 * the given ratio, then share (where supported) or download.
 */
export async function exportCard(
  node: HTMLElement,
  ratio: CardRatio,
  slug: string,
  shareTitle: string,
): Promise<"shared" | "downloaded" | "cancelled"> {
  if (ratio === "a4") {
    const blob = await captureCardPdf(node);
    return shareOrDownloadBlob(blob, cardFilename(slug, ratio, "pdf"), shareTitle);
  }
  const blob = await captureCardPng(node, ratio);
  return shareOrDownloadBlob(blob, cardFilename(slug, ratio, "png"), shareTitle);
}
