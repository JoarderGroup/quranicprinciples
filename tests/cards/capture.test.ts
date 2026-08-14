import assert from "node:assert/strict";
import test from "node:test";

import {
  cardFilename,
  downloadBlob,
  shareOrDownloadBlob,
  waitForFonts,
} from "@/lib/cards/capture";

/**
 * `capture.ts`'s DOM-capture path (`captureCardPng`/`captureCardPdf`, via
 * html-to-image's `toCanvas`) needs a real browser canvas — Node has none,
 * and stubbing one wouldn't prove anything a real render doesn't already.
 * That path is verified visually with a real browser instead (build log).
 * What's tested here is everything capture.ts does around that call:
 * waiting for fonts, filenames, and the download/share fallback logic —
 * all of which are plain, mockable browser-global calls.
 */

test("waitForFonts resolves immediately outside a browser (no `document`)", async () => {
  assert.equal(typeof document, "undefined");
  await waitForFonts(); // must not hang or throw
});

test("waitForFonts awaits document.fonts.ready before resolving", async () => {
  const order: string[] = [];
  let resolveReady!: () => void;
  const ready = new Promise<FontFaceSet>((resolve) => {
    resolveReady = () => {
      order.push("fonts-ready-resolved");
      resolve({} as FontFaceSet);
    };
  });

  (globalThis as { document?: unknown }).document = { fonts: { ready } };
  (globalThis as { requestAnimationFrame?: (cb: () => void) => void }).requestAnimationFrame = (cb) =>
    cb();

  try {
    const waited = waitForFonts().then(() => order.push("waitForFonts-resolved"));
    // waitForFonts must still be pending — it hasn't resolved before fonts.ready has.
    await Promise.race([waited, Promise.resolve().then(() => order.push("microtask-tick"))]);
    assert.deepEqual(order, ["microtask-tick"]);

    resolveReady();
    await waited;
    assert.deepEqual(order, ["microtask-tick", "fonts-ready-resolved", "waitForFonts-resolved"]);
  } finally {
    delete (globalThis as { document?: unknown }).document;
    delete (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame;
  }
});

test("cardFilename encodes the ratio and extension, no colon in the filename", () => {
  assert.equal(cardFilename("al-mizan", "9:16", "png"), "quranic-principles-al-mizan-9x16.png");
  assert.equal(cardFilename("al-mizan", "a4", "pdf"), "quranic-principles-al-mizan-a4.pdf");
  for (const ratio of ["9:16", "1:1", "4:5", "a4"] as const) {
    assert.ok(!cardFilename("x", ratio, "png").includes(":"));
  }
});

const RealURL = globalThis.URL;
const RealSetTimeout = globalThis.setTimeout;

function stubDom() {
  const clicked: string[] = [];
  const created: { href?: string; download?: string }[] = [];

  (globalThis as { document?: unknown }).document = {
    createElement: () => {
      const node: { href?: string; download?: string; click: () => void; remove: () => void } = {
        click: () => clicked.push("click"),
        remove: () => {},
      };
      created.push(node);
      return node;
    },
    body: { appendChild: () => {} },
  };
  const objectUrls = { created: 0, revoked: 0 };
  (globalThis as { URL?: unknown }).URL = {
    createObjectURL: () => {
      objectUrls.created++;
      return "blob:mock-url";
    },
    revokeObjectURL: () => {
      objectUrls.revoked++;
    },
  };
  // Run the revoke-after-download timer synchronously for the test.
  (globalThis as { setTimeout?: unknown }).setTimeout = ((fn: () => void) => fn()) as typeof setTimeout;

  return { clicked, created, objectUrls };
}

function restoreDom() {
  delete (globalThis as { document?: unknown }).document;
  globalThis.URL = RealURL;
  globalThis.setTimeout = RealSetTimeout;
}

// Node defines a read-only global `navigator` getter — plain assignment
// throws, so the stub needs `defineProperty`.
function stubNavigator(value: unknown) {
  Object.defineProperty(globalThis, "navigator", { value, configurable: true, writable: true });
}
function restoreNavigator() {
  delete (globalThis as { navigator?: unknown }).navigator;
}

test("downloadBlob creates an object URL, clicks a download anchor, then revokes it", () => {
  const { clicked, created, objectUrls } = stubDom();
  try {
    downloadBlob(new Blob(["x"]), "test.png");
    assert.equal(created.length, 1);
    assert.equal(created[0].href, "blob:mock-url");
    assert.equal(created[0].download, "test.png");
    assert.deepEqual(clicked, ["click"]);
    assert.equal(objectUrls.created, 1);
    assert.equal(objectUrls.revoked, 1);
  } finally {
    restoreDom();
  }
});

test("shareOrDownloadBlob uses Web Share when the platform can share files", async () => {
  const { clicked } = stubDom();
  const shareCalls: unknown[] = [];
  stubNavigator({
    canShare: () => true,
    share: async (data: unknown) => {
      shareCalls.push(data);
    },
  });
  try {
    const result = await shareOrDownloadBlob(new Blob(["x"]), "test.png", "Al-Mīzān");
    assert.equal(result, "shared");
    assert.equal(shareCalls.length, 1);
    assert.deepEqual(clicked, []); // no fallback download
  } finally {
    restoreDom();
    restoreNavigator();
  }
});

test("shareOrDownloadBlob falls back to download when the platform cannot share files", async () => {
  const { clicked } = stubDom();
  (globalThis as { navigator?: unknown }).navigator = { canShare: () => false };
  try {
    const result = await shareOrDownloadBlob(new Blob(["x"]), "test.png", "Al-Mīzān");
    assert.equal(result, "downloaded");
    assert.deepEqual(clicked, ["click"]);
  } finally {
    restoreDom();
    delete (globalThis as { navigator?: unknown }).navigator;
  }
});

test("shareOrDownloadBlob respects a user-cancelled share sheet — no forced download", async () => {
  const { clicked } = stubDom();
  (globalThis as { navigator?: unknown }).navigator = {
    canShare: () => true,
    share: async () => {
      const err = new Error("cancelled");
      err.name = "AbortError";
      throw err;
    },
  };
  try {
    const result = await shareOrDownloadBlob(new Blob(["x"]), "test.png", "Al-Mīzān");
    assert.equal(result, "cancelled");
    assert.deepEqual(clicked, []);
  } finally {
    restoreDom();
    delete (globalThis as { navigator?: unknown }).navigator;
  }
});
