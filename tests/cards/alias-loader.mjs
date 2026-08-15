// Node ESM loader for `node --test tests/cards/`. Two gaps between plain
// Node and how this repo's TypeScript actually resolves modules:
//  1. the `@/` alias tsconfig.json defines, and extensionless relative
//     imports ("bundler" moduleResolution allows both; Node's own
//     resolver understands neither).
//  2. JSX/TSX syntax — Node's `--experimental-strip-types` removes type
//     annotations only, it does not transform JSX. esbuild (a devDependency
//     used only here, not shipped) handles both TS and JSX in one pass.
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";
import esbuild from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url)); // tests/cards
const ROOT = pathToFileURL(path.resolve(here, "../../") + "/"); // repo root
const SUFFIXES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

function tryResolve(base) {
  for (const suffix of SUFFIXES) {
    const candidate = new URL(base.href + suffix);
    try {
      if (fs.statSync(fileURLToPath(candidate)).isFile()) return candidate.href;
    } catch {
      // not this one
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const found = tryResolve(new URL(specifier.slice(2), ROOT));
    if (found) return nextResolve(found, context);
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const found = tryResolve(new URL(specifier, context.parentURL));
    if (found) return nextResolve(found, context);
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const source = fs.readFileSync(fileURLToPath(url), "utf8");
    const { code } = esbuild.transformSync(source, {
      loader: url.endsWith(".tsx") ? "tsx" : "ts",
      format: "esm",
      target: "node22",
      sourcemap: false,
      jsx: "automatic",
    });
    return { format: "module", source: code, shortCircuit: true };
  }
  return nextLoad(url, context);
}
