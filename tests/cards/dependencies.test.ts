import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");

test("no Satori or @vercel/og anywhere in package.json (contract: banned, no RTL)", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of Object.keys(all)) {
    assert.ok(!/satori/i.test(name), `banned dependency present: ${name}`);
    assert.ok(!/@vercel\/og/i.test(name), `banned dependency present: ${name}`);
  }
});

test("lib/cards and components/cards never import satori or @vercel/og", () => {
  const dirs = ["lib/cards", "components/cards", "app/api/card"].map((d) => path.join(repoRoot, d));
  for (const dir of dirs) {
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(ts|tsx)$/.test(file)) continue;
      const source = fs.readFileSync(path.join(dir, file), "utf8");
      assert.ok(!/from ["']satori["']/.test(source), `${file} imports satori`);
      assert.ok(!/from ["']@vercel\/og["']/.test(source), `${file} imports @vercel/og`);
    }
  }
});
