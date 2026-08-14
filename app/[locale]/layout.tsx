import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontClassNames } from "@/app/fonts";
import Header from "@/components/shell/Header";
import Footer from "@/components/shell/Footer";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "Quranic Principles",
      template: "%s · Quranic Principles",
    },
    description:
      "One principle. One incident. One thing you will not forget. A magazine of Quranic principles in English, Arabic and Bangla.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://quranicprinciples.com",
    ),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: { locale },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("shell");
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={fontClassNames}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <a href="#main" className="skip-link">
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
