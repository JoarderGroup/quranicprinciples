"use client";

import { useState } from "react";
import { Bookmark, Check, Download, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

/** Āyah-of-the-day actions. Share works today (Web Share / clipboard);
 * save + download ship with the card engine (Codex) and are honestly disabled. */
export default function AyahActions({ reference }: { reference: string }) {
  const t = useTranslations("home");
  const [shared, setShared] = useState(false);

  async function share() {
    const url = window.location.href;
    const payload = { title: "Quranic Principles", text: reference, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(`${reference} — ${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user dismissed the sheet */
    }
  }

  const idle = "inline-flex min-h-[44px] min-w-[44px] items-center justify-center";

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled title={t("save")} aria-label={t("save")} className={`${idle} text-muted`}>
        <Bookmark size={17} aria-hidden="true" />
      </button>
      <button type="button" disabled title={t("download")} aria-label={t("download")} className={`${idle} text-muted`}>
        <Download size={17} aria-hidden="true" />
      </button>
      <button type="button" onClick={share} aria-label={t("share")} className={idle}>
        {shared ? <Check size={17} aria-hidden="true" /> : <Share2 size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}
