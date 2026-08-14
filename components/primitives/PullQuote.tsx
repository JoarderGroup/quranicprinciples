import type { ReactNode } from "react";

/** Board 03: Instrument Serif italic, bounded by a 3px --signal rule above
 * and a hairline below. */
export default function PullQuote({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure
      className={`my-10 border-t-[3px] border-t-signal border-b border-b-rule py-8 ${className}`}
    >
      <blockquote className="font-editorial text-[clamp(24px,3vw,32px)] italic leading-[1.3]">
        &ldquo;{children}&rdquo;
      </blockquote>
    </figure>
  );
}
