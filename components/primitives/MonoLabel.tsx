import type { ElementType, ReactNode } from "react";

/**
 * Script-aware meta label — contract §Type.
 * Latin: JetBrains Mono 10–11px, uppercase, letter-spacing 0.2em.
 * Arabic / Bangla: NEVER tracked or uppercased — body family, 12px,
 * sentence case. Tracking destroys both scripts.
 */
export default function MonoLabel({
  as: Tag = "span",
  script = "latin",
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  script?: "latin" | "ar" | "bn";
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  if (script === "ar") {
    return (
      <Tag lang="ar" className={`font-arabic-ui text-[12px] ${className}`} {...rest}>
        {children}
      </Tag>
    );
  }
  if (script === "bn") {
    return (
      <Tag lang="bn" className={`font-bangla-ui text-[12px] ${className}`} {...rest}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag
      className={`font-mono text-[11px] uppercase tracking-[0.2em] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
