import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { surahCoverage, TOTAL_SURAHS } from "@/lib/mock/soul";

/**
 * 114 squares, one per sūrah, shaded by tagged-command count.
 * Mostly empty is CORRECT — the empty squares are the editorial plan,
 * designed to look intentional: hairline cells on the recessed surface.
 */
export default async function SurahGrid() {
  const t = await getTranslations("soul");
  const covered = new Map(surahCoverage.map((s) => [s.surah, s]));
  const max = Math.max(...surahCoverage.map((s) => s.count));

  return (
    <div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(30px,1fr))] gap-px border border-rule bg-rule">
        {Array.from({ length: TOTAL_SURAHS }, (_, i) => {
          const n = i + 1;
          const hit = covered.get(n);
          if (!hit) {
            return (
              <li key={n} className="aspect-square bg-paper">
                <span className="sr-only">{`${n}`}</span>
              </li>
            );
          }
          const leader = hit.count === max;
          return (
            <li key={n} className="aspect-square">
              <Link
                href="/p/al-mizan"
                aria-label={`${t("coveredSquare", { surah: `${n} — ${hit.name}`, count: hit.count })}. ${t("essaysBehind")}`}
                className={`flex size-full items-center justify-center font-mono text-[10px] ${
                  leader ? "bg-signal text-paper" : "bg-deep text-paper"
                }`}
                style={leader ? undefined : { opacity: 0.55 + 0.45 * (hit.count / max) }}
              >
                {n}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        {t("coverageNote", { covered: surahCoverage.length })}
      </p>
    </div>
  );
}
