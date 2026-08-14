import type { ReactNode } from "react";

/**
 * NOT OPTIONAL. Every Arabic (or Bangla) fragment inside an LTR run passes
 * through this. Without isolation, `ROOT و-ز-ن · 23 OCCURRENCES` silently
 * reorders to `ROOT 23 · و-ز-ن OCCURRENCES` (contract §Bidi).
 *
 * <bdi> isolates by spec; unicode-bidi is set explicitly as belt-and-braces.
 */
export default function Bidi({
  lang = "ar",
  dir = "auto",
  className = "",
  children,
}: {
  lang?: string;
  dir?: "auto" | "rtl" | "ltr";
  className?: string;
  children: ReactNode;
}) {
  return (
    <bdi lang={lang} dir={dir} className={className} style={{ unicodeBidi: "isolate" }}>
      {children}
    </bdi>
  );
}
