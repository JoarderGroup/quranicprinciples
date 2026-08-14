"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FacultyCount } from "@/lib/mock/soul";
import MonoLabel from "@/components/primitives/MonoLabel";

/**
 * Eight faculty bars, ordered by count, filling on scroll.
 * Leader in --signal, the rest --deep (06-Soul-Index.md).
 * Every bar links to the essays behind its count.
 *
 * The observer sits on the list (full-size), not the zero-width fill —
 * a width:0 element never reports itself in view.
 */
export default function FacultyBars({ data }: { data: FacultyCount[] }) {
  const t = useTranslations("soul");
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { once: true, margin: "-40px" });
  const max = Math.max(...data.map((d) => d.count));

  return (
    <ol ref={listRef} className="flex flex-col">
      {data.map((f, i) => {
        const pct = (f.count / max) * 100;
        const leader = i === 0;
        const shown = inView || reduceMotion;
        return (
          <li key={f.key} className="border-b border-rule">
            <Link
              href="/p/al-mizan"
              className="grid min-h-[56px] grid-cols-[110px_1fr_3ch] items-center gap-4 py-3 sm:grid-cols-[160px_1fr_3ch]"
              aria-label={`${f.en} — ${f.count} ${t("commands")}. ${t("essaysBehind")}`}
            >
              <span className="flex flex-col">
                <span lang="ar" className="ar-block font-arabic-ui text-[17px] font-bold">
                  {f.ar}
                </span>
                <MonoLabel className="text-muted">{f.en}</MonoLabel>
              </span>
              <span className="h-[18px] bg-paper-2" aria-hidden="true">
                <motion.span
                  className={`block h-full ${leader ? "bg-signal" : "bg-deep"}`}
                  initial={false}
                  animate={{ width: shown ? `${pct}%` : "0%" }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.7,
                          ease: [0.2, 0.7, 0.3, 1],
                          delay: Math.min(i, 5) * 0.06,
                        }
                  }
                />
              </span>
              <span className="text-end font-mono text-[13px]">{f.count}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
