import { NextResponse } from "next/server";
import { fetchAyahContent, sourceLineFor } from "@/lib/cards/content";

/**
 * Read-only card *content* endpoint — not part of the export/capture path
 * (that stays fully client-side and server-round-trip-free, per Prompt G
 * §5). This exists so any future consumer (the admin Card Studio, a link
 * unfurler, this phase's own tests) can resolve the exact text a card
 * would carry — surah name and root count come from the caller, never
 * this endpoint, and the verse/translation always come from `lib/quran.ts`
 * by reference (protocol hard rule 1). No Supabase, no schema touched.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const surah = Number(params.get("surah"));
  const from = Number(params.get("from"));
  const to = params.get("to") ? Number(params.get("to")) : from;
  const surahName = params.get("surahName");
  const root = params.get("root") ?? undefined;
  const rootOccurrences = params.get("occurrences")
    ? Number(params.get("occurrences"))
    : undefined;

  if (
    !surahName ||
    !Number.isInteger(surah) ||
    surah < 1 ||
    surah > 114 ||
    !Number.isInteger(from) ||
    from < 1 ||
    !Number.isInteger(to) ||
    to < from
  ) {
    return NextResponse.json(
      { error: "surah (1–114), from, to, and surahName are required" },
      { status: 400 },
    );
  }

  try {
    const ayah = await fetchAyahContent({ surah, surahName, from, to, root, rootOccurrences });
    return NextResponse.json({
      surah: ayah.surah,
      from: ayah.from,
      to: ayah.to,
      arabic: ayah.arabic,
      translation: ayah.translation,
      translationEdition: ayah.translationEdition,
      sourceLine: sourceLineFor(ayah),
    });
  } catch {
    return NextResponse.json(
      { error: "could not resolve that verse from the Quran API" },
      { status: 502 },
    );
  }
}
