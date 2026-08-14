import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SectionLabel from "@/components/primitives/SectionLabel";
import Chip from "@/components/primitives/Chip";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="wrap flex min-h-[50vh] flex-col items-start justify-center py-24">
      <SectionLabel>404</SectionLabel>
      <h1 className="mt-4 font-display text-[clamp(32px,5vw,56px)] font-black leading-[1] tracking-[-0.035em]">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-[48ch] font-editorial text-[19px] italic leading-[1.5] text-muted">
        {t("body")}
      </p>
      <Chip as={Link} href="/" tone="solid" className="mt-8">
        {t("backHome")}
      </Chip>
    </div>
  );
}
