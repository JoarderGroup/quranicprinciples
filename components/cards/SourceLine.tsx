import { assertAyahContent, sourceLineFor } from "@/lib/cards/content";
import type { AyahContent } from "@/lib/cards/types";
import MonoLabel from "@/components/primitives/MonoLabel";

/**
 * Rendered unconditionally by every card type — never behind a prop, never
 * skippable by a caller. If `ayah` is missing or incomplete this THROWS
 * during render, so the card fails to render rather than shipping without
 * attribution (Prompt G §4.1, 16-Editorial-Doctrine.md §15 — "every claim
 * carries a source line, including on share cards, where it is rendered by
 * the template and cannot be removed by an editor").
 */
export default function SourceLine({
  ayah,
  className = "",
}: {
  ayah: AyahContent | null | undefined;
  className?: string;
}) {
  assertAyahContent(ayah);
  return (
    <MonoLabel className={`text-[var(--card-gold)] ${className}`}>{sourceLineFor(ayah)}</MonoLabel>
  );
}
