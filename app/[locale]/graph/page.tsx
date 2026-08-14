import { getTranslations, setRequestLocale } from "next-intl/server";
import Bidi from "@/components/arabic/Bidi";
import MonoLabel from "@/components/primitives/MonoLabel";

export async function generateMetadata() {
  return { title: "The Knowledge Graph" };
}

const DIAGRAM = String.raw`
                    ○ QIST
                   /|
                  / |        ○ 'ADL
                 /  |       /|
     MIZAN ●----+---+------○ |
            \   |   |        |
             \  |   ○--------○ AMANAH
              \ |  /
               \| /
                ○ SIDQ
`;

/** ⭐ COMING SOON — deliberate, finished, and clearly unfinished.
 * An --ink field, an ASCII diagram, the title, one paragraph. Nothing else.
 * No email capture. No countdown. (Locked decision: graph is v2.) */
export default async function GraphPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("graph");

  return (
    <div className="bg-ink text-paper">
      <div className="wrap flex min-h-[calc(100vh-105px)] flex-col items-start justify-center py-20">
        <MonoLabel as="p" className="text-gold">
          {t("kicker")} &middot;{" "}
          <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
            الخريطة
          </Bidi>
        </MonoLabel>

        {/* ASCII art is always aria-hidden with a text alternative
            (contract §Accessibility). */}
        <pre
          aria-hidden="true"
          className="mt-10 overflow-x-auto font-mono text-[12px] leading-[1.5] text-muted"
        >
          {DIAGRAM}
        </pre>
        <p className="sr-only">{t("diagramAlt")}</p>

        <h1 className="mt-10 font-display text-[clamp(40px,7vw,88px)] font-black leading-[0.95] tracking-[-0.035em]">
          {t("title")}
        </h1>
        <MonoLabel as="p" className="mt-4 text-signal">
          {t("soon")}
        </MonoLabel>
        <p className="mt-6 max-w-[54ch] font-editorial text-[clamp(18px,2.2vw,23px)] italic leading-[1.5]">
          {t("body")}
        </p>
      </div>
    </div>
  );
}
