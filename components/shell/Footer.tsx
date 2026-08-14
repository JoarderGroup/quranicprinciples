import { getTranslations } from "next-intl/server";
import MonoLabel from "@/components/primitives/MonoLabel";
import Chip from "@/components/primitives/Chip";
import Rule from "@/components/primitives/Rule";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tShell = await getTranslations("shell");

  return (
    <footer className="mt-24">
      <div className="wrap">
        <Rule weight="major" />
        <div className="grid gap-10 py-12 md:grid-cols-3">
          <div>
            <p className="font-editorial text-[22px] italic leading-[1.35]">
              {t("subscribeLead")}
            </p>
            <p className="mt-3 text-[14px] leading-[1.6] text-muted">
              {t("subscribeBody")}
            </p>
            <Chip
              as="a"
              href="mailto:subscribe@quranicprinciples.com"
              tone="solid"
              className="mt-5"
            >
              {tShell("subscribe")}
            </Chip>
          </div>
          <div>
            <MonoLabel as="h2" className="text-signal">
              {t("attributions")}
            </MonoLabel>
            <p className="mt-4 text-[13px] leading-[1.7] text-muted">{t("fontsLine")}</p>
            <p className="mt-3 text-[13px] leading-[1.7] text-muted">{t("quranLine")}</p>
          </div>
          <div>
            <MonoLabel as="h2" className="text-signal">
              {t("socials")}
            </MonoLabel>
            <p className="mt-4 text-[13px] leading-[1.7] text-muted">{t("socialsSoon")}</p>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              © {new Date().getFullYear()} Quranic Principles · {t("rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
