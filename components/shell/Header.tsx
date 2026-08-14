import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { departments } from "@/lib/mock/departments";
import Bidi from "@/components/arabic/Bidi";
import MonoLabel from "@/components/primitives/MonoLabel";
import Chip from "@/components/primitives/Chip";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function Header() {
  const t = await getTranslations("shell");

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="wrap flex min-h-[64px] items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.2em]"
        >
          {t("masthead")}
        </Link>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <button
            type="button"
            disabled
            title={t("searchComingSoon")}
            aria-label={t("searchComingSoon")}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-muted"
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <Chip
            as="a"
            href="mailto:subscribe@quranicprinciples.com"
            tone="signal"
            className="hidden sm:inline-flex"
          >
            {t("subscribe")}
          </Chip>
        </div>
      </div>

      {/* Department nav — Arabic names are the running heads in ALL locales. */}
      <nav aria-label={t("departments")} className="rail border-t border-rule">
        <ul className="wrap flex items-stretch gap-6">
          {departments.map((d) => (
            <li key={d.key} className="shrink-0">
              <Link
                href={`/d/${d.key}` as never}
                className="inline-flex min-h-[44px] items-center gap-2 py-1"
              >
                <Bidi className="font-arabic-ui text-[14px] font-bold">{d.name_ar}</Bidi>
                <MonoLabel className="text-muted">{d.name_en}</MonoLabel>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
