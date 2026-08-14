import localFont from "next/font/local";

/* All faces OFL, self-hosted (contract §Type). KFGQPC is proprietary and
 * is never embedded. Only the display face is preloaded — zero CLS on the
 * masthead is an acceptance criterion; everything else swaps in lazily. */

export const archivo = localFont({
  src: "./fonts/Archivo-var.woff2",
  weight: "100 900",
  display: "swap",
  preload: true,
  variable: "--font-archivo",
});

export const instrumentSerif = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-instrument",
});

export const amiriQuran = localFont({
  src: "./fonts/AmiriQuran-Regular.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-amiri-quran",
});

export const notoKufiArabic = localFont({
  src: "./fonts/NotoKufiArabic-var.woff2",
  weight: "100 900",
  display: "swap",
  preload: false,
  variable: "--font-noto-kufi",
});

export const hindSiliguri = localFont({
  src: [
    { path: "./fonts/HindSiliguri-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/HindSiliguri-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-hind-siliguri",
});

export const notoSerifBengali = localFont({
  src: "./fonts/NotoSerifBengali-var.woff2",
  weight: "100 900",
  display: "swap",
  preload: false,
  variable: "--font-noto-serif-bengali",
});

export const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-var.woff2",
  weight: "100 800",
  display: "swap",
  preload: false,
  variable: "--font-jetbrains",
});

export const fontClassNames = [
  archivo.variable,
  instrumentSerif.variable,
  amiriQuran.variable,
  notoKufiArabic.variable,
  hindSiliguri.variable,
  notoSerifBengali.variable,
  jetbrainsMono.variable,
].join(" ");
