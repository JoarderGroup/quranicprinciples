import type { JournalEntryPublic, JournalSeriesKey } from "@/lib/types";

/**
 * Demo Journal data only — fictional, standing in for the real content
 * Hermes/the owner will produce (26-PROMPT-K-Ollama-Journal-Funnel.md).
 * Never copied from Assets QP/essays/ — this file is not real content and
 * must never be treated as such.
 */

export const journalSeriesOrder: { key: JournalSeriesKey; name: string }[] = [
  { key: "foundation", name: "Foundation" },
  { key: "soul", name: "Soul" },
  { key: "philosophy", name: "Philosophy" },
  { key: "convergence", name: "Convergence" },
  { key: "civilization", name: "Civilization" },
];

export const journalEntries: JournalEntryPublic[] = [
  {
    id: "j01",
    slug: "the-quiet-between-two-answers",
    sequence_number: 1,
    locale: "en",
    title: "The Quiet Between Two Answers",
    deck: "A demo Journal entry — not real content. Placeholder for what the citation-verified funnel will eventually produce.",
    author: "Demo Author",
    entries: [
      {
        ordinal: 1,
        heading: "The pause",
        body_md:
          "This is placeholder Journal prose, standing in for what a real, citation-verified entry will read like once the owner approves content from the funnel.",
      },
      {
        ordinal: 2,
        heading: "What the pause is for",
        body_md:
          "A second demo section — long enough to show the numbered-entries structure a Journal piece actually uses, distinct from an Issue's five-beat spine.",
      },
    ],
    editorial_status: "clear",
    created_at: "2026-08-01T00:00:00Z",
    series_key: "soul",
    series_name: "Soul",
    series_sort_order: 2,
  },
  {
    id: "j02",
    slug: "a-flagged-demo-entry",
    sequence_number: 1,
    locale: "en",
    title: "A Flagged Demo Entry",
    deck: "Demonstrates the human_review_pending state — flagged, not hidden, not silently corrected.",
    author: "Demo Author",
    entries: [
      {
        ordinal: 1,
        heading: "Why this one is flagged",
        body_md:
          "This demo entry is deliberately marked human_review_pending to show the label on a live page — the whole point of that status is that it stays visible, not that it disappears.",
      },
    ],
    editorial_status: "human_review_pending",
    created_at: "2026-08-02T00:00:00Z",
    series_key: "foundation",
    series_name: "Foundation",
    series_sort_order: 1,
  },
];

export function journalEntriesBySeries(key: JournalSeriesKey): JournalEntryPublic[] {
  return journalEntries.filter((e) => e.series_key === key);
}

export function journalEntryBySlug(series: string, slug: string): JournalEntryPublic | undefined {
  return journalEntries.find((e) => e.series_key === series && e.slug === slug);
}

/** One āyah reference per demo entry — the same by-reference discipline as
 * the rest of the site (protocol hard rule 1): never a translation string. */
export const journalAyahRefsByEntry: Record<string, { surah: number; ayah: number }[]> = {
  j01: [{ surah: 94, ayah: 5 }],
  j02: [{ surah: 49, ayah: 6 }],
};

export const journalSourceNotesByEntry: Record<string, string[]> = {
  j01: ["Demo content — source notes will list every omitted verse and every cut claim once real packets land."],
  j02: ["This entry is flagged human_review_pending as a demonstration of that state, not because of a real editorial concern."],
};
