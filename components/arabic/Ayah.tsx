import { getAyahRange } from "@/lib/quran";

/**
 * Renders an āyah (or range) fetched from the API BY REFERENCE — the text is
 * never authored in this repo (protocol hard rule 1). Server component;
 * fetches are cached at build.
 */
export default async function Ayah({
  surah,
  from,
  to,
  withTranslation = true,
  sourceLine,
  size = "md",
  className = "",
}: {
  surah: number;
  from: number;
  to?: number;
  withTranslation?: boolean;
  /** Rendered mono under the translation, e.g. reference + root. */
  sourceLine?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  const { arabic, translation } = await getAyahRange(
    surah,
    from,
    to ?? from,
    withTranslation,
  );

  const textSize =
    size === "lg"
      ? "text-[clamp(26px,3.4vw,40px)]"
      : "text-[clamp(21px,2.4vw,27px)]";

  return (
    <figure className={className}>
      {arabic ? (
        <div lang="ar" className={`ayah-text ${textSize}`}>
          {arabic}
        </div>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Āyah {surah}:{from}
          {to && to !== from ? `–${to}` : ""} — text unavailable; retrieved by
          reference only
        </p>
      )}
      {withTranslation && translation && (
        <blockquote className="mt-5 font-editorial text-[clamp(18px,2vw,23px)] italic leading-[1.5]">
          &ldquo;{translation}&rdquo;
        </blockquote>
      )}
      {sourceLine && <figcaption className="mt-4">{sourceLine}</figcaption>}
    </figure>
  );
}
