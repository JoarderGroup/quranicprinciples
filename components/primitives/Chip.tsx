import type { ElementType, ReactNode } from "react";

/**
 * Pill chip — boards 02/03 grammar (depth dial, subscribe, take-it-with-you).
 * Interactive chips must keep ≥44px touch targets via padding.
 */
export default function Chip({
  as: Tag = "span",
  tone = "outline",
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: "outline" | "solid" | "signal" | "disabled" | "paper";
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  const tones: Record<string, string> = {
    outline: "border border-current bg-transparent",
    solid: "border border-ink bg-ink text-paper",
    signal: "border border-signal bg-signal text-paper",
    disabled: "border border-rule text-muted",
    /* Active pill on an ink surface — board 02. */
    paper: "border border-paper bg-paper text-ink",
  };
  return (
    <Tag
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
