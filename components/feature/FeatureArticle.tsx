"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Depth } from "@/lib/types";
import Rule from "@/components/primitives/Rule";
import Panel from "@/components/primitives/Panel";
import PanelGrid from "@/components/primitives/PanelGrid";
import PullQuote from "@/components/primitives/PullQuote";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Bidi from "@/components/arabic/Bidi";

const DEPTHS: Depth[] = ["seed", "spark", "story", "source"];

/** Minimal emphasis-aware paragraph renderer for mock body_md. */
function Para({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="font-editorial italic">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export interface DeedContent {
  prompt: string;
  body: string;
  next_ar: string;
  next_en: string;
}

/**
 * The Depth Dial — the signature interaction. One essay, four approved
 * renderings; the pills re-render the body from a different `rendering` row.
 * State is client-side; ?d= deep-links an initial depth.
 */
export default function FeatureArticle({
  renderings,
  standfirst,
  pullQuote,
  deed,
  kicker,
  title,
  breadcrumb,
  ayahSlot,
  rightRail,
}: {
  renderings: Record<Depth, string>;
  standfirst: string;
  pullQuote: string;
  deed: DeedContent;
  kicker: ReactNode;
  title: string;
  breadcrumb: ReactNode;
  ayahSlot: ReactNode;
  rightRail: ReactNode;
}) {
  const t = useTranslations("feature");
  const [depth, setDepth] = useState<Depth>("story");

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (d && (DEPTHS as string[]).includes(d)) setDepth(d as Depth);
  }, []);

  const paras = renderings[depth].split("\n\n");

  return (
    <article className="wrap pt-6">
      {/* Top bar: breadcrumb start, depth dial end — board 03. */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        {breadcrumb}
        <div role="group" aria-label={t("depthLabel")} className="flex items-center gap-2">
          <MonoLabel className="me-1 text-muted">{t("depthLabel")}</MonoLabel>
          {DEPTHS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={depth === d}
              onClick={() => setDepth(d)}
              className={`inline-flex min-h-[44px] items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.2em] ${
                depth === d
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-transparent hover:border-ink"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <Rule weight="major" />

      <div className="grid gap-12 pt-10 lg:grid-cols-[7fr_5fr]">
        <div>
          {kicker}
          <h1 className="mt-4 font-display text-[clamp(38px,5.5vw,68px)] font-black leading-[0.98] tracking-[-0.035em]">
            {title}
          </h1>
          <p className="mt-6 max-w-[52ch] font-editorial text-[clamp(19px,2.2vw,24px)] leading-[1.45]">
            {standfirst}
          </p>

          <div className="mt-10">
            {depth === "story" && (
              <>
                <div className="gap-10 text-[16px] leading-[1.7] md:columns-2 [&>p]:mb-5 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:me-2 [&>p:first-of-type]:first-letter:font-editorial [&>p:first-of-type]:first-letter:text-[64px] [&>p:first-of-type]:first-letter:leading-[0.75] [&>p:first-of-type]:first-letter:text-signal">
                  {paras.slice(0, 4).map((p, i) => (
                    <Para key={i} text={p} />
                  ))}
                </div>
                <PullQuote>{pullQuote}</PullQuote>
                <div className="gap-10 text-[16px] leading-[1.7] md:columns-2 [&>p]:mb-5">
                  {paras.slice(4).map((p, i) => (
                    <Para key={i} text={p} />
                  ))}
                </div>
              </>
            )}

            {depth === "seed" && (
              <p className="max-w-[36ch] font-editorial text-[clamp(26px,3.4vw,38px)] italic leading-[1.35]">
                {renderings.seed}
              </p>
            )}

            {depth === "spark" && (
              <PanelGrid className="grid-cols-1 sm:grid-cols-2">
                {paras.map((p, i) => (
                  <Panel key={i} className="p-6">
                    <MonoLabel as="p" className="text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </MonoLabel>
                    <p className="mt-3 font-editorial text-[19px] leading-[1.4]">{p}</p>
                  </Panel>
                ))}
              </PanelGrid>
            )}

            {depth === "source" && (
              <div>
                {ayahSlot}
                <div className="mt-10 max-w-[62ch] text-[16px] leading-[1.7] [&>p]:mb-5">
                  {paras.map((p, i) => (
                    <Para key={i} text={p} />
                  ))}
                </div>
                <Chip tone="disabled" aria-disabled="true" className="mt-4">
                  {t("comingSoon")} — /source
                </Chip>
              </div>
            )}
          </div>

          {/* The Deed callout — board 03: ink panel start, editorial end. */}
          {depth !== "source" && (
            <div className="mt-12 grid border border-ink sm:grid-cols-[180px_1fr]">
              <Panel surface="ink" className="flex flex-col justify-between gap-6 p-6">
                <MonoLabel as="p" className="text-gold">
                  Beat 05
                </MonoLabel>
                <p lang="ar" className="ar-block font-arabic-ui text-[40px] font-bold leading-none">
                  العمل
                </p>
                <MonoLabel as="p">The Deed</MonoLabel>
              </Panel>
              <div className="p-6">
                <p className="font-editorial text-[clamp(20px,2.4vw,26px)] italic leading-[1.35]">
                  {deed.prompt}
                </p>
                <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.65] text-muted">
                  {deed.body}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Chip tone="disabled" aria-disabled="true">
                    {t("writeIt")}
                  </Chip>
                  <Chip tone="disabled" aria-disabled="true">
                    {t("sendToAFriend")}
                  </Chip>
                  <Chip tone="signal">
                    {t("next")}: <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">{deed.next_ar}</Bidi>
                  </Chip>
                </div>
              </div>
            </div>
          )}
        </div>

        {rightRail}
      </div>
    </article>
  );
}
