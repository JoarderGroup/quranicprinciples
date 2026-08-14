"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, { label: string; lang: string; className: string }> = {
  en: { label: "EN", lang: "en", className: "font-mono text-[11px] uppercase tracking-[0.2em]" },
  ar: { label: "العربية", lang: "ar", className: "font-arabic-ui text-[12px]" },
  bn: { label: "বাংলা", lang: "bn", className: "font-bangla-ui text-[12px]" },
};

export default function LocaleSwitcher() {
  const t = useTranslations("shell");
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  return (
    <nav aria-label={t("localeSwitcher")} className="flex items-center gap-1">
      {routing.locales.map((l) => {
        const { label, lang, className } = LABELS[l];
        const active = l === locale;
        return (
          <Link
            key={l}
            href={{ pathname, params } as never}
            locale={l}
            lang={lang}
            aria-current={active ? "true" : undefined}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 ${className} ${
              active
                ? "border-ink bg-ink text-paper"
                : "border-rule text-ink hover:border-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
