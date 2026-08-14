"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CommandType } from "@/lib/types";
import Bidi from "@/components/arabic/Bidi";
import MonoLabel from "@/components/primitives/MonoLabel";

const TONES: Record<CommandType, string> = {
  amr: "bg-signal",
  nahy: "bg-deep",
  wasiyyah: "bg-gold",
};

/** Three-part stacked bar: amr / nahy / waṣiyyah. Observer sits on the
 * full-width track, not the zero-width segments. */
export default function CommandBar({
  data,
}: {
  data: { key: CommandType; ar: string; count: number }[];
}) {
  const t = useTranslations("soul");
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(trackRef, { once: true, margin: "-40px" });
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const shown = inView || reduceMotion;

  return (
    <div>
      <div ref={trackRef} className="flex h-[28px] w-full overflow-hidden bg-paper-2" aria-hidden="true">
        {data.map((d, i) => (
          <motion.span
            key={d.key}
            className={`block h-full ${TONES[d.key]}`}
            initial={false}
            animate={{ width: shown ? `${(d.count / total) * 100}%` : "0%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.7, ease: [0.2, 0.7, 0.3, 1], delay: i * 0.06 }
            }
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        {data.map((d) => (
          <li key={d.key}>
            <Link
              href="/p/al-mizan"
              className="inline-flex min-h-[44px] items-center gap-2"
              aria-label={`${t(d.key)} — ${d.count} ${t("commands")}. ${t("essaysBehind")}`}
            >
              <span className={`inline-block size-3 ${TONES[d.key]}`} aria-hidden="true" />
              <MonoLabel>{t(d.key)}</MonoLabel>
              <Bidi className="font-arabic-ui text-[12px]">{d.ar}</Bidi>
              <span className="font-mono text-[13px]">{d.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
