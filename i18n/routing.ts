import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar", "bn"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];
